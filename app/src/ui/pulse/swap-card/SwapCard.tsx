import clsx from "clsx";
import { Form as RFForm } from "react-final-form";
import { OnChange } from "react-final-form-listeners";
import { useTranslation } from "next-i18next";
import { ChangeEvent, useEffect, useState } from "react";
import _ from "lodash";
import Countdown from "react-countdown";
import { useAccount } from "wagmi";

import { Card } from "ui/card/Card";
import { Typography } from "ui/typography/Typography";
import { Form } from "ui/form/Form";
import { Button } from "ui/button/Button";
import pulse from "providers/pulse";
import useNearFungibleTokenContract from "providers/near/contracts/fungible-token/useNearFungibleTokenContract";
import currency from "providers/currency";
import { useToastContext } from "hooks/useToastContext/useToastContext";
import { WrappedBalance } from "providers/near/contracts/market/market.types";
import date from "providers/date";
import { useNearMarketContractContext } from "context/near/market-contract/useNearMarketContractContext";
import near from "providers/near";

import styles from "./SwapCard.module.scss";
import { SwapCardForm, SwapCardProps, Token } from "./SwapCard.types";

const DEFAULT_DEBOUNCE_TIME = 500;

// @TODO let's try https://www.npmjs.com/package/@lemoncode/fonk: required, valid number, enough balance
const validate = () => ({
  fromTokenAmount: undefined,
  toTokenAmount: undefined,
});

export const SwapCard: React.FC<SwapCardProps> = ({
  className,
  marketContractValues: {
    market,
    collateralTokenMetadata,
    feeRatio,
    isOver,
    isResolved,
    isResolutionWindowExpired,
    outcomeTokens,
    resolution,
  },
  marketId,
  isBettingEnabled,
}) => {
  const [fromToken, setFromToken] = useState<Token>({ symbol: "", amount: 0 });
  const [toToken, setToToken] = useState<Token>({ symbol: "", amount: 0 });
  const [balance, setBalance] = useState("0.00");
  const [rate, setRate] = useState("0.00");
  const [fee, setFee] = useState("0.00");

  const { t } = useTranslation(["swap-card"]);
  const toast = useToastContext();
  const { isConnected, address } = useAccount();

  const FungibleTokenContract = useNearFungibleTokenContract({ contractAddress: collateralTokenMetadata.id });
  const MarketContract = useNearMarketContractContext();

  const collateralToken = pulse.getCollateralTokenByAccountId(collateralTokenMetadata.id);
  const ftMetadata = FungibleTokenContract.metadata;

  const isCollateralSourceToken = () => fromToken.symbol === collateralToken.symbol;
  const canClaim = isResolved || (isOver && isResolutionWindowExpired);
  const endedUnresolved = isOver && isResolutionWindowExpired && !isResolved;
  const isUnderResolution = !isResolved && isOver && !isResolutionWindowExpired;

  const updateCollateralTokenBalance = async () => {
    const collateralTokenBalance = await FungibleTokenContract.getWalletBalance();
    setBalance(collateralTokenBalance);
  };

  const updateOutcomeTokenBalance = async () => {
    if (!isConnected) {
      return;
    }

    const outcomeTokenBalance = await MarketContract.getBalanceOf({
      outcome_id: MarketContract.selectedOutcomeToken!.outcome_id,
      account_id: address!,
    });

    setBalance(currency.convert.toDecimalsPrecisionString(outcomeTokenBalance, ftMetadata?.decimals!));
  };

  const setCollateralAsSource = async () => {
    setFromToken({
      symbol: collateralToken.symbol,
      amount: 0,
    });

    setToToken({
      symbol: market.options[MarketContract.selectedOutcomeToken!.outcome_id],
      amount: 0,
    });

    updateCollateralTokenBalance();
  };

  const setOutcomeAsSource = async () => {
    setToToken({
      symbol: collateralToken.symbol,
      amount: 0,
    });

    setFromToken({
      symbol: market.options[MarketContract.selectedOutcomeToken!.outcome_id],
      amount: 0,
    });

    updateOutcomeTokenBalance();
  };

  const updateSourceToken = () => {
    if (canClaim) {
      setOutcomeAsSource();
    } else {
      setCollateralAsSource();
    }
  };

  useEffect(() => {
    updateSourceToken();
  }, [
    MarketContract.selectedOutcomeToken!.outcome_id,
    ftMetadata?.decimals,
    MarketContract.actions.fetchMarketContractValues.isLoading,
  ]);

  const getBuyRate = async (buyAmount: WrappedBalance) => {
    const decimals = ftMetadata?.decimals!;
    const amount = Number(currency.convert.toUIntAmount(buyAmount, decimals));

    const [amountMintable, exchangeFee] = await MarketContract.getAmountMintable({
      amount,
    });

    const feeString = currency.convert.fromUIntAmount(exchangeFee, decimals).toString();
    const rateString = currency.convert.fromUIntAmount(amountMintable, decimals).toString();

    setFee(feeString);
    setRate(rateString);
  };

  const getSellRate = async (sellAmount: WrappedBalance) => {
    const decimals = ftMetadata?.decimals!;
    const amount = Number(currency.convert.toUIntAmount(sellAmount, decimals));

    const [amountPayable] = await MarketContract.getAmountPayable({
      amount,
      outcome_id: MarketContract.selectedOutcomeToken!.outcome_id,
      account_id: address || near.getConfig().guestWalletId,
    });

    const rateString = currency.convert.fromUIntAmount(amountPayable, decimals);

    setRate(rateString);
  };

  const onFromTokenChange = (value: string) => {
    if (isCollateralSourceToken()) {
      getBuyRate(Number(value));
    } else {
      getSellRate(Number(value));
    }
  };

  const buy = async (amount: string) => {
    if (isOver) {
      toast.trigger({
        variant: "error",
        title: "Market Is Over",
        children: <Typography.Text>{t("swapCard.cannotPurchase")}</Typography.Text>,
      });

      return;
    }

    await FungibleTokenContract.ftTransferCall(marketId, amount, MarketContract.selectedOutcomeToken!.outcome_id);

    updateCollateralTokenBalance();
  };

  const sell = async (sellAmount: string) => {
    const amount = Number(sellAmount);

    await MarketContract.sell({
      outcome_id: MarketContract.selectedOutcomeToken!.outcome_id,
      amount,
    });
  };

  const onSubmit = async ({ fromTokenAmount }: SwapCardForm) => {
    const decimals = ftMetadata?.decimals!;
    const amount = currency.convert.toUIntAmount(fromTokenAmount, decimals);

    await (canClaim || endedUnresolved ? sell(amount) : buy(amount));
  };

  const onSelectOutcomeToken = (id: string | number | ChangeEvent<HTMLSelectElement>) => {
    MarketContract.onClickOutcomeToken(outcomeTokens![id as number]);
  };

  const onClickHalfBalance = (setFromTokenInputValue: (value: string) => void) => {
    const amount = Number(balance) / 2;
    setFromTokenInputValue(amount.toString());
    getBuyRate(amount);
  };

  const onClickMaxBalance = (setFromTokenInputValue: (value: string) => void) => {
    const amount = Number(balance);
    setFromTokenInputValue(amount.toString());
    getBuyRate(amount);
  };

  const onClickResolveMarket = async () => {
    await MarketContract.onClickResolveMarket();
  };

  const onResolutionWindowCountdownComplete = async () => {
    await MarketContract.fetchMarketContractValues();
    updateSourceToken();
  };

  const onTimeLeftBeforeResolutionCountdownComplete = async () => {
    await MarketContract.fetchMarketContractValues();
    updateSourceToken();
  };

  const getMarketTitle = () => {
    if (canClaim) {
      return t("swapCard.title.claim");
    }

    if (isUnderResolution) {
      return t("swapCard.title.underResolution");
    }

    if (!isBettingEnabled) {
      return t("swapCard.title.bettingExpired");
    }

    return t("swapCard.title");
  };

  const getSubmitButton = () => {
    if (!isConnected) {
      return (
        <Button disabled fullWidth>
          {canClaim ? "Connect to Claim" : "Connect to Bet"}
        </Button>
      );
    }

    if (isUnderResolution) {
      const timeLeft = resolution.window;

      return (
        <>
          <Button fullWidth onClick={onClickResolveMarket} className={styles["swap-card__button--resolve-market"]}>
            {t("swapCard.resolveMarket")}
          </Button>
          <Typography.MiniDescription align="center" flat>
            {t("swapCard.timeLeft")} <Countdown date={timeLeft} onComplete={onResolutionWindowCountdownComplete} />
          </Typography.MiniDescription>
        </>
      );
    }

    if (endedUnresolved) {
      return (
        <>
          <Typography.MiniDescription>Market was not resolved</Typography.MiniDescription>
          <Button fullWidth type="submit">
            {t("swapCard.withdraw")}
          </Button>
        </>
      );
    }

    if (canClaim) {
      return (
        <>
          <Button fullWidth type="submit" className={styles["swap-card__button--resolve-market"]}>
            {t("swapCard.sell")}
          </Button>
          {resolution.resolved_at && (
            <Typography.MiniDescription align="center" flat>
              {t("swapCard.resolvedAt")} {date.fromTimestampWithOffset(resolution.resolved_at, market.utc_offset)}
            </Typography.MiniDescription>
          )}
        </>
      );
    }

    if (!isBettingEnabled) {
      const timeLeft = market.ends_at;

      return (
        <>
          <Button fullWidth disabled>
            {t("swapCard.title.bettingExpired")}
          </Button>
          <Typography.MiniDescription align="center" flat>
            {t("swapCard.timeLeftResolution")}{" "}
            <Countdown date={timeLeft} onComplete={onTimeLeftBeforeResolutionCountdownComplete} />
          </Typography.MiniDescription>
        </>
      );
    }

    if (isCollateralSourceToken()) {
      return (
        <Button fullWidth type="submit">
          {FungibleTokenContract.actions.ftTransferCall.isLoading ? t("swapCard.buying") : t("swapCard.buy")}
        </Button>
      );
    }

    return (
      <Button fullWidth type="submit">
        {t("swapCard.sell")}
      </Button>
    );
  };

  // @TODO i18n
  return (
    <RFForm
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setFromTokenInputValue: (_args, state, utils) => (value: string) => {
          utils.changeValue(state, "fromTokenAmount", () => value);
        },
      }}
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit}>
          <Card className={clsx(styles["swap-card"], className)}>
            <Card.Content>
              <Typography.Headline2 className={styles["swap-card__buy-sell"]}>{getMarketTitle()}</Typography.Headline2>
              <div className={styles["swap-card__balance--container"]}>
                <Typography.Description className={styles["swap-card__balance--amount"]}>
                  {t("swapCard.balance")}: {balance} {fromToken.symbol}
                  {isCollateralSourceToken() && (
                    <img
                      src={pulse.getCollateralTokenIconByAccountId(collateralToken.accountId)}
                      alt="token-icon"
                      className={styles["swap-card__from--token-icon"]}
                    />
                  )}
                </Typography.Description>
                <div className={styles["swap-card__balance--half-max"]}>
                  <Typography.Description
                    className={styles["swap-card__balance--half"]}
                    onClick={() => onClickHalfBalance(form.mutators.setFromTokenInputValue())}
                  >
                    {t("swapCard.half")}
                  </Typography.Description>
                  <Typography.Description
                    className={styles["swap-card__balance--max"]}
                    onClick={() => onClickMaxBalance(form.mutators.setFromTokenInputValue())}
                  >
                    {t("swapCard.max")}
                  </Typography.Description>
                </div>
              </div>
              <div className={styles["swap-card__from"]}>
                <div className={styles["swap-card__from--token-amount"]}>
                  <OnChange name="fromTokenAmount">
                    {_.debounce((value) => onFromTokenChange(value), DEFAULT_DEBOUNCE_TIME)}
                  </OnChange>
                  <Form.TextInput
                    id="fromTokenAmount"
                    type="text"
                    defaultValue="0.00"
                    className={styles["swap-card__from--amount-input"]}
                  />
                  <Form.Select
                    id="outcomeTokenId"
                    className={styles["swap-card__select"]}
                    inputProps={{
                      onChange: onSelectOutcomeToken,
                      value: MarketContract.selectedOutcomeToken!.outcome_id,
                    }}
                  >
                    {market.options.map((option, id) => (
                      <Form.Select.Item value={id} key={option}>
                        <Typography.Text flat truncate>
                          {option}
                        </Typography.Text>
                      </Form.Select.Item>
                    ))}
                  </Form.Select>
                </div>
              </div>
              <Typography.Description className={styles["swap-card__overview"]}>
                {t("swapCard.overview")}
              </Typography.Description>
              <div className={styles["swap-card__overview-card"]}>
                {!canClaim && (
                  <div className={styles["swap-card__overview-card--row"]}>
                    <Typography.Text flat>
                      {t("swapCard.estimatedFee")} (
                      {Number(currency.convert.fromUIntAmount(feeRatio, ftMetadata?.decimals!)) * 100}%)
                    </Typography.Text>
                    {fromToken.symbol === collateralToken.symbol ? (
                      <Typography.Text flat>
                        {fee} {fromToken.symbol}
                      </Typography.Text>
                    ) : (
                      <Typography.Text flat>none for sells</Typography.Text>
                    )}
                  </div>
                )}
                <div className={styles["swap-card__overview-card--row"]}>
                  <Typography.Text flat>{t("swapCard.rate")}</Typography.Text>
                  <div className={styles["swap-card__overview-card--row-description"]}>
                    <Typography.Text flat>{rate}</Typography.Text>
                    <Typography.Description flat>
                      {toToken.symbol} / {fromToken.symbol}
                    </Typography.Description>
                  </div>
                </div>
              </div>
              {getSubmitButton()}
            </Card.Content>
          </Card>
        </form>
      )}
    />
  );
};
