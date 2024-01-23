import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import { MainPanel } from "ui/mainpanel/MainPanel";
import { PromptWarsLogo } from "ui/icons/PromptWarsLogo";
import { Grid } from "ui/grid/Grid";
import { Typography } from "ui/typography/Typography";
import { GenericLoader } from "ui/generic-loader/GenericLoader";
import { FaqsModal } from "ui/pulse/prompt-wars/faqs-modal/FaqsModal";
import { useToastContext } from "hooks/useToastContext/useToastContext";
import { ResultsModal } from "ui/pulse/prompt-wars/results-modal/ResultsModal";
import { ShareModal } from "ui/pulse/prompt-wars/share-modal/ShareModal";
import { useEVMPromptWarsMarketContractContext } from "context/evm/prompt-wars-market-contract/useEVMPromptWarsMarketContractContext";
import { ImgPromptCard } from "ui/pulse/img-prompt-card/ImgPromptCard";

import styles from "./PromptWars.module.scss";
import { PromptWarsProps } from "./PromptWars.types";

export const PromptWars: React.FC<PromptWarsProps> = ({ marketId, className }) => {
  const [isShareModalVisible, displayShareModal] = useState(false);
  const [isFAQsModalVisible, displayFAQsModal] = useState(false);
  const [isResultsModalVisible, displayResultsModal] = useState(false);

  const { marketContractValues, fetchMarketContractValues, ftTransferCall, sell, create, actions } =
    useEVMPromptWarsMarketContractContext();

  const { t } = useTranslation(["prompt-wars"]);

  const toast = useToastContext();

  useEffect(() => {
    fetchMarketContractValues();
  }, [marketId]);

  useEffect(() => {
    if (actions.ftTransferCall.success) {
      displayShareModal(true);
    }
  }, [actions.ftTransferCall.success]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketContractValues();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [marketId]);

  if (!marketContractValues || actions.create.isLoading) {
    // @TODO render PriceMarket skeleton template
    return <GenericLoader />;
  }

  const onSubmit = async (prompt: string) => {
    if (!marketContractValues.isBeforeMarketEnds) {
      toast.trigger({
        variant: "error",
        title: t("promptWars.marketisover.title"),
        children: <Typography.Text>{t("promptwars.marketisover.description")}</Typography.Text>,
      });

      return;
    }

    await ftTransferCall(prompt);
  };

  const onClaimDepositUnresolved = async () => {
    await sell();
  };

  const onClickCloseShareModal = () => {
    displayShareModal(false);
  };

  const onClickCloseFAQsModal = () => {
    displayFAQsModal(false);
  };

  const onClickFAQsButton = () => {
    displayFAQsModal(true);
  };

  const onClickCloseResultsModal = () => {
    displayResultsModal(false);
  };

  const onClickSeeResults = () => {
    displayResultsModal(true);
  };

  const onClickCreateNewGame = async () => {
    await create();
  };

  return (
    <>
      <MainPanel.Container className={clsx(styles["prompt-wars"], className)}>
        <Grid.Container>
          <div className={styles["prompt-wars__title-row"]}>
            <PromptWarsLogo className={styles["prompt-wars__logo"]} />
            <div className={styles["prompt-wars__title-row--description"]}>
              <Typography.Description flat>
                {t("promptWars.description")}{" "}
                <Typography.Anchor onClick={onClickFAQsButton} href="#">
                  {t("promptWars.faqs")}
                </Typography.Anchor>
              </Typography.Description>
            </div>
          </div>

          <div className={styles["prompt-wars__game-row"]}>
            <Grid.Row>
              <Grid.Col lg={7} xs={12} className={styles["prompt-wars__game-row--col-left"]}>
                <ImgPromptCard
                  marketId={marketId}
                  marketContractValues={marketContractValues}
                  datesElement={<></>}
                  onClaimDepositUnresolved={onClaimDepositUnresolved}
                  onClickSeeResults={onClickSeeResults}
                  onClickCreateNewGame={onClickCreateNewGame}
                />
              </Grid.Col>
              <Grid.Col lg={5} xs={12}>
                {/* <PromptInputCard
                  onSubmit={onSubmit}
                  onClickFAQsButton={onClickFAQsButton}
                  marketContractValues={marketContractValues}
                /> */}
              </Grid.Col>
            </Grid.Row>
          </div>
        </Grid.Container>
      </MainPanel.Container>

      {isShareModalVisible && <ShareModal onClose={onClickCloseShareModal} />}

      {isFAQsModalVisible && <FaqsModal onClose={onClickCloseFAQsModal} />}

      {isResultsModalVisible && (
        <ResultsModal onClose={onClickCloseResultsModal} marketContractValues={marketContractValues} />
      )}
    </>
  );
};
