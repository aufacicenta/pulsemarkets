import clsx from "clsx";
import { Field, Form as RFForm, useFormState } from "react-final-form";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import { Card } from "ui/card/Card";
import { Typography } from "ui/typography/Typography";
import { Button } from "ui/button/Button";
import { Icon } from "ui/icon/Icon";
import { PromptWarsMarketContractStatus } from "providers/near/contracts/prompt-wars/prompt-wars.types";
import { useWalletStateContext } from "context/wallet/state/useWalletStateContext";
import { useNearWalletSelectorContext } from "context/near/wallet-selector/useNearWalletSelectorContext";
import currency from "providers/currency";
import pulse from "providers/pulse";
import { useNearPromptWarsMarketContractContext } from "context/near/prompt-wars-market-contract/useNearPromptWarsMarketContractContext";
import { Modal } from "ui/modal/Modal";

import { PromptInputCardProps } from "./PromptInputCard.types";
import styles from "./PromptInputCard.module.scss";

type PreviewModalProps = {
  onClose: () => void;
};

const PreviewModal: React.FC<PreviewModalProps> = ({ onClose }) => {
  const formState = useFormState();
  const prompt = formState.values.value;
  const negativePrompt = formState.values.negative_prompt;
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageScore, setImageScore] = useState<number>(0);

  useEffect(() => {
    if (prompt) {
      fetch("/api/prompt-wars/preview", {
        method: "POST",
        body: JSON.stringify({ prompt, negative_prompt: negativePrompt }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.imageUrl) {
            setImageUrl(data.imageUrl);
            setImageScore(data?.score ?? 0);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log("Something Went Wrong", error);
          setIsLoading(false);
        });
    }
  }, []);

  return (
    <Modal isOpened aria-labelledby="Prompt Wars Preview Prompt" onClose={onClose}>
      <Modal.Header onClose={onClose}>
        <Typography.Headline2 flat>Preview Of Your Prompt</Typography.Headline2>
      </Modal.Header>
      {!prompt ? (
        <Modal.Content>
          <Typography.Headline3 className={styles["prompt-input-card__title"]}>
            Please enter a prompt
          </Typography.Headline3>
        </Modal.Content>
      ) : (
        <Modal.Content>
          {isLoading && <p>Loading...</p>}
          {!isLoading && imageUrl && <img src={imageUrl} alt="preview" />}
          {!isLoading && <p>Score is: {imageScore}</p>}
        </Modal.Content>
      )}
    </Modal>
  );
};
export const PromptInputCard: React.FC<PromptInputCardProps> = ({
  onSubmit,
  className,
  onClickFAQsButton,
  marketContractValues,
}) => {
  const [isNegativePromptFieldVisible, displayNegativePromptField] = useState(false);
  const [isPreviewModalVisible, setPreviewModalVisible] = useState(false);

  const wallet = useWalletStateContext();
  const nearWalletSelectorContext = useNearWalletSelectorContext();

  const { actions } = useNearPromptWarsMarketContractContext();

  const { status, fees, collateralToken } = marketContractValues;
  console.log("status", status);

  const isDisabled = status !== PromptWarsMarketContractStatus.OPEN;

  const handleOnDisplayWidgetClick = () => {
    nearWalletSelectorContext.modal?.show();
  };

  const { t } = useTranslation(["prompt-wars"]);

  const onClickPreviewButton = () => {
    setPreviewModalVisible(true);
  };

  const onClosePreviewModal = () => {
    setPreviewModalVisible(false);
  };

  return (
    <>
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
                  {!wallet.isConnected ? (
                    <Button color="secondary" variant="outlined" onClick={handleOnDisplayWidgetClick}>
                      {t("promptWars.button.connectToPlay")}
                    </Button>
                  ) : (
                    <div>
                      <Button disabled={!isDisabled} onClick={onClickPreviewButton}>
                        {t("promptWars.button.preview")}
                      </Button>
                      <Button type="submit" disabled={isDisabled}>
                        {actions.ftTransferCall.isLoading
                          ? t("promptWars.button.submitPrompt.loading")
                          : t("promptWars.button.submitPrompt")}
                      </Button>
                    </div>
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
            {isPreviewModalVisible && <PreviewModal onClose={onClosePreviewModal} />}
          </form>
        )}
      />
    </>
  );
};
