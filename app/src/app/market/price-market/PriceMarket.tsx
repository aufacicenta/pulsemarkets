import Countdown from "react-countdown";
import clsx from "clsx";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Grid } from "ui/grid/Grid";
import { MarketCard } from "ui/pulse/market-card/MarketCard";
import { Card } from "ui/card/Card";
import useNearMarketContract from "providers/near/contracts/market/useNearMarketContract";
import { OutcomeToken } from "providers/near/contracts/market/market.types";
import { SwapCardProps } from "ui/pulse/swap-card/SwapCard.types";
import switchboard from "providers/switchboard";
import currency from "providers/currency";
import { Typography } from "ui/typography/Typography";
import date from "providers/date";
import { Button } from "ui/button/Button";
import useNearMarketFactoryContract from "providers/near/contracts/market-factory/useNearMarketFactoryContract";
import { useToastContext } from "hooks/useToastContext/useToastContext";

import { PriceMarketProps } from "./PriceMarket.types";
import styles from "./PriceMarket.module.scss";

const SwapCard = dynamic<SwapCardProps>(() => import("ui/pulse/swap-card/SwapCard").then((mod) => mod.SwapCard), {
  ssr: false,
});

// @TODO markets will be resolved automatically after event ends (server side)
export const PriceMarket: React.FC<PriceMarketProps> = ({ className, marketContractValues, marketId }) => {
  const [selectedOutcomeToken, setSelectedOutcomeToken] = useState<OutcomeToken | undefined>(undefined);
  const [currentPrice, setCurrentPrice] = useState<string | undefined>(currency.convert.toFormattedString(0));
  const [isBettingEnabled, setIsBettingEnabled] = useState(true);

  const toast = useToastContext();

  const { onClickResolveMarket } = useNearMarketContract({ marketId });
  const MarketFactoryContract = useNearMarketFactoryContract();

  const { market, buySellTimestamp, outcomeTokens, isOver, isResolutionWindowExpired } = marketContractValues;

  const diff = date.client(date.fromNanoseconds(market.ends_at - buySellTimestamp!)).minutes();
  const startsAt = date.client(date.fromNanoseconds(market.starts_at));
  const bettingTimestamp = startsAt.clone().add(diff, "minutes").valueOf();

  const bettingPeriodExpired = () => date.now().valueOf() > bettingTimestamp;

  const onClickOutcomeToken = (outcomeToken: OutcomeToken) => {
    setSelectedOutcomeToken(outcomeToken);
  };

  const updateCurrentPrice = async () => {
    const price = await switchboard.fetchCurrentPrice(switchboard.jobs.testnet.near.btcUsd);
    setCurrentPrice(currency.convert.toFormattedString(price));
  };

  const onClickCreatePriceMarket = async () => {
    try {
      await MarketFactoryContract.createPriceMarket();
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        title: "Oops, our bad.",
        children: <Typography.Text>While creating the market. Try again?</Typography.Text>,
      });
    }
  };

  useEffect(() => {
    if (outcomeTokens) {
      setSelectedOutcomeToken(outcomeTokens[0]);
    }
  }, [outcomeTokens]);

  useEffect(() => {
    updateCurrentPrice();
    setIsBettingEnabled(!bettingPeriodExpired());

    const interval = setInterval(async () => {
      updateCurrentPrice();

      if (bettingPeriodExpired()) {
        updateCurrentPrice();
        setIsBettingEnabled(false);
        clearInterval(interval);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getCurrentResultElement = () => {
    if (isOver && isResolutionWindowExpired) {
      return (
        <div className={styles["price-market__current-result-element--create-market"]}>
          <Typography.Description align="right">Create the next price market and earn fees</Typography.Description>
          <Button size="xs" variant="outlined" color="success" onClick={onClickCreatePriceMarket}>
            Create Next Market
          </Button>
        </div>
      );
    }

    return (
      <>
        <Grid.Row>
          <Grid.Col className={styles["price-market__current-result-element--current-price"]}>
            <Typography.Description>Current price</Typography.Description>
            <Typography.Headline3>{currentPrice}</Typography.Headline3>
          </Grid.Col>
          <Grid.Col className={styles["price-market__current-result-element--time-left"]}>
            <Typography.Description>Time left to bet</Typography.Description>
            <Typography.Headline3>
              <Countdown date={bettingTimestamp} />
            </Typography.Headline3>
          </Grid.Col>
        </Grid.Row>
        <Typography.MiniDescription align="center" flat>
          * Bets end {diff} minutes after event starts.
        </Typography.MiniDescription>
      </>
    );
  };

  const getDatesElement = () => {
    if (bettingPeriodExpired()) {
      return (
        <Typography.Description className={styles["price-market__start-end-time--text"]}>
          <span>Betting ended</span> <span>be ready for the next round!</span>
        </Typography.Description>
      );
    }

    return null;
  };

  return (
    <div className={clsx(styles["price-market"], className)}>
      <Grid.Row>
        <Grid.Col lg={8} xs={12}>
          <Card className={styles["price-market__info-card"]}>
            <Card.Content>
              <MarketCard
                expanded
                currentResultElement={getCurrentResultElement()}
                datesElement={<div className={styles["price-market__dates-element"]}>{getDatesElement()}</div>}
                onClickOutcomeToken={onClickOutcomeToken}
                marketContractValues={marketContractValues}
                onClickResolveMarket={onClickResolveMarket}
                marketId={marketId}
              />
            </Card.Content>
          </Card>
        </Grid.Col>
        <Grid.Col lg={4} xs={12}>
          {selectedOutcomeToken && (
            <SwapCard
              marketContractValues={marketContractValues}
              selectedOutcomeToken={selectedOutcomeToken}
              setSelectedOutcomeToken={setSelectedOutcomeToken}
              marketId={marketId}
              isBettingEnabled={isBettingEnabled}
            />
          )}
        </Grid.Col>
      </Grid.Row>
    </div>
  );
};
