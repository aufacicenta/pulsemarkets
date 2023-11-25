import clsx from "clsx";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useAccount } from "wagmi";

import { useNearMarketContractContext } from "context/near/market-contract/useNearMarketContractContext";
import { Typography } from "ui/typography/Typography";
import { Card } from "ui/card/Card";
import currency from "providers/currency";

import styles from "./OutcomeTokensPosition.module.scss";
import { OutcomeTokensPositionProps } from "./OutcomeTokensPosition.types";

export const OutcomeTokensPosition: React.FC<OutcomeTokensPositionProps> = ({ className }) => {
  const { isConnected } = useAccount();

  const { marketContractValues, calculateTotalOutcomeTokensPosition, outcomeTokensExtended } =
    useNearMarketContractContext();

  useEffect(() => {
    calculateTotalOutcomeTokensPosition();
  }, [marketContractValues, isConnected]);

  const { t } = useTranslation(["prompt-wars"]);

  return (
    <Card className={clsx(styles["outcome-tokens-position__card"], className)}>
      <Card.Content className={styles["outcome-tokens-position__card--content"]}>
        <Typography.MiniDescription align="right">Your position</Typography.MiniDescription>
        {outcomeTokensExtended?.length ? (
          <>
            {outcomeTokensExtended?.map((token) => (
              <div className={styles["outcome-tokens-position__row"]} key={token.outcome_id}>
                <Typography.Description flat className={styles["outcome-tokens-position__col"]}>
                  {token.value}
                </Typography.Description>
                <Typography.Description flat className={styles["outcome-tokens-position__col"]}>
                  {currency.convert.fromUIntAmount(
                    token.balance_of!,
                    marketContractValues?.collateralTokenMetadata.decimals!,
                  )}
                </Typography.Description>
                <Typography.Description flat className={styles["outcome-tokens-position__col"]}>
                  {token.position?.toFixed(2)}%
                </Typography.Description>
              </div>
            ))}
          </>
        ) : (
          <Typography.MiniDescription align="center">
            {t("promptWars.OutcomeTokensPosition.miniDescription")}
          </Typography.MiniDescription>
        )}
      </Card.Content>
    </Card>
  );
};
