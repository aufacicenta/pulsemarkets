import clsx from "clsx";
import { Field, Form as RFForm } from "react-final-form";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useAccount } from "wagmi";

import { Card } from "ui/card/Card";
import { Typography } from "ui/typography/Typography";
import { Button } from "ui/button/Button";
import { Icon } from "ui/icon/Icon";
import { PromptWarsMarketContractStatus } from "providers/near/contracts/prompt-wars/prompt-wars.types";
import currency from "providers/currency";
import pulse from "providers/pulse";
import { useNearPromptWarsMarketContractContext } from "context/near/prompt-wars-market-contract/useNearPromptWarsMarketContractContext";

import { PromptInputCardProps } from "./PromptInputCard.types";
import styles from "./PromptInputCard.module.scss";

const handleOnDisplayWidgetClick = () => undefined;

export const PromptInputCard: React.FC<PromptInputCardProps> = ({
  onSubmit,
  className,
  onClickFAQsButton,
  marketContractValues,
}) => {
  const [isNegativePromptFieldVisible, displayNegativePromptField] = useState(false);
  const { isConnected } = useAccount();

  const { actions } = useNearPromptWarsMarketContractContext();

  const { status, fees, collateralToken } = marketContractValues;

  const isDisabled = status !== PromptWarsMarketContractStatus.OPEN;

  const { t } = useTranslation(["prompt-wars"]);

  return (
    <RFForm
      onSubmit={onSubmit}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Card className={clsx(styles["prompt-input-card"], className)} withSpotlightEffect>
            <Card.Content>
              <Typography.Headline3 className={styles["prompt-input-card__title"]}>
                {t("promptWars.headline.writePromptHere")}
              </Typography.Headline3>
              <Field
                name="value"
                component="textarea"
                className={clsx(styles["prompt-input-card__input"], "input-field", "materialize-textarea")}
                placeholder={t("promptWars.placeholder.writePromptHere")}
                disabled={isDisabled}
              />
              <Typography.Description
                onClick={() => displayNegativePromptField(!isNegativePromptFieldVisible)}
                className={styles["prompt-input-card__negative-prompt--trigger"]}
              >
                <Icon name={isNegativePromptFieldVisible ? "icon-chevron-down" : "icon-chevron-right"} />
                {t("promptWars.negativePrompt.add")}
              </Typography.Description>
              <div
                className={clsx(styles["prompt-input-card__negative-prompt"], {
                  [styles["prompt-input-card__negative-prompt--visible"]]: isNegativePromptFieldVisible,
                })}
              >
                <Field
                  name="negative_prompt"
                  component="textarea"
                  className={clsx(
                    styles["prompt-input-card__input"],
                    styles["prompt-input-card__input--hidden"],
                    "input-field",
                    "materialize-textarea",
                  )}
                  placeholder={t("promptWars.headline.writeNegativePromptHere")}
                  disabled={isDisabled}
                />
              </div>
            </Card.Content>
            <Card.Actions className={styles["prompt-input-card__actions"]}>
              <div>
                {!isConnected ? (
                  <Button color="secondary" variant="outlined" onClick={handleOnDisplayWidgetClick}>
                    {t("promptWars.button.connectToPlay")}
                  </Button>
                ) : (
                  <Button type="submit" disabled={isDisabled}>
                    {actions.ftTransferCall.isLoading
                      ? t("promptWars.button.submitPrompt.loading")
                      : t("promptWars.button.submitPrompt")}
                  </Button>
                )}
                <Typography.Description flat>
                  {t("promptWars.description.submittingChargesUsdt")}{" "}
                  {currency.convert.toDecimalsPrecisionString(fees.price, collateralToken.decimals)}{" "}
                  <code>{pulse.getConfig().COLLATERAL_TOKENS[0].accountId}</code>{" "}
                  {t("promptWars.description.coverStorageFee")}{" "}
                  <Typography.Anchor onClick={onClickFAQsButton} href="#">
                    {t("promptWars.faqs")}
                  </Typography.Anchor>
                </Typography.Description>
              </div>
            </Card.Actions>
          </Card>
        </form>
      )}
    />
  );
};
