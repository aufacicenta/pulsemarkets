import clsx from "clsx";
import { useEffect } from "react";
import Countdown from "react-countdown";
import { useAccount } from "wagmi";

import { useNearMarketContractContext } from "context/near/market-contract/useNearMarketContractContext";
import { Typography } from "ui/typography/Typography";
import currency from "providers/currency";
import { useRoutes } from "hooks/useRoutes/useRoutes";

import { PriceMarketTableRowProps } from "./PriceMarketTableRow.types";
import styles from "./PriceMarketTableRow.module.scss";

export const PriceMarketTableRow: React.FC<PriceMarketTableRowProps> = ({ className }) => {
  const { isConnected } = useAccount();
  const routes = useRoutes();

  const {
    fetchMarketContractValues,
    marketContractValues,
    calculateTotalOutcomeTokensPosition,
    outcomeTokensExtended,
    bettingPeriodExpired,
    marketId,
  } = useNearMarketContractContext();

  useEffect(() => {
    fetchMarketContractValues();
  }, []);

  useEffect(() => {
    calculateTotalOutcomeTokensPosition();
  }, [marketContractValues]);

  const getOutcomeTokensPosition = () => {
    if (!isConnected) {
      return "connect wallet";
    }

    if (outcomeTokensExtended?.length) {
      return outcomeTokensExtended.map((token, index) =>
        index === outcomeTokensExtended.length - 1
          ? `${token.value}: ${currency.convert.fromUIntAmount(
              token.balance_of!,
              marketContractValues?.collateralTokenMetadata.decimals!,
            )} (${token.position?.toFixed(2)}%)`
          : `${token.value}: ${currency.convert.fromUIntAmount(
              token.balance_of!,
              marketContractValues?.collateralTokenMetadata.decimals!,
            )} (${token.position?.toFixed(2)}%), `,
      );
    }

    return "calculating";
  };

  if (!marketContractValues) {
    return null;
  }

  return (
    <tr className={clsx(styles["price-market-table-row"], className)}>
      <td>
        <Typography.Description flat>{marketContractValues.market.description}</Typography.Description>
      </td>
      <td>
        <Typography.Description flat />
      </td>
      <td>
        <Typography.Description flat>{getOutcomeTokensPosition()}</Typography.Description>
      </td>
      <td>
        <Typography.Description flat>
          {!bettingPeriodExpired() ? <Countdown date={marketContractValues.buySellTimestamp} /> : "—"}
        </Typography.Description>
      </td>
      <td>
        <Typography.Description flat>
          {marketContractValues.isResolved ? "resolved" : "unresolved"}
        </Typography.Description>
      </td>
      <td>
        <Typography.Link
          className={clsx(styles["price-market-table-row__link"])}
          href={routes.market.price({ marketId })}
        >
          See details
        </Typography.Link>
      </td>
    </tr>
  );
};
