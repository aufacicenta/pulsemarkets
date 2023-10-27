import clsx from "clsx";
import Countdown from "react-countdown";
import { useTranslation } from "next-i18next";

import { Card } from "ui/card/Card";
import { Grid } from "ui/grid/Grid";
import { Typography } from "ui/typography/Typography";
import { Icon } from "ui/icon/Icon";
import near from "providers/near";
import currency from "providers/currency";
import { PromptWarsMarketContractStatus } from "providers/near/contracts/prompt-wars/prompt-wars.types";
import ipfs from "providers/ipfs";
import { useWalletStateContext } from "context/wallet/state/useWalletStateContext";
import { Button } from "ui/button/Button";

import { ImgPromptCardProps } from "./ImgPromptCard.types";
import styles from "./ImgPromptCard.module.scss";

export const ImgPromptCard: React.FC<ImgPromptCardProps> = ({
  marketId,
  marketContractValues,
  className,
  datesElement,
  onClaimDepositUnresolved,
  onClickSeeResults,
  onClickCreateNewGame,
}) => {
  const walletState = useWalletStateContext();

  const { market, resolution, outcomeIds, collateralToken, status } = marketContractValues;

  const { t } = useTranslation(["prompt-wars"]);

  const getDatesElement = () => datesElement;

  const getStatusElement = () => {
    if (status === PromptWarsMarketContractStatus.REVEALING) {
      return (
        <>
          <Typography.Text flat className={styles["img-prompt-card__status--text"]}>
            {t(`promptWars.status.${status}`)} <span>(closest to 0 wins)</span>
          </Typography.Text>
          <Typography.MiniDescription onClick={onClickSeeResults}>
            {t("promptWars.status.miniDescription.seeResults")}
          </Typography.MiniDescription>
        </>
      );
    }

    if (status === PromptWarsMarketContractStatus.RESOLVING) {
      return (
        <>
          <Typography.Text flat>{t(`promptWars.status.${status}`)}</Typography.Text>
          <Typography.MiniDescription>
            <Countdown date={resolution.window} />
          </Typography.MiniDescription>
        </>
      );
    }

    if (status === PromptWarsMarketContractStatus.RESOLVED) {
      return (
        <>
          <Typography.Text flat>
            {t(`promptWars.status.${status}`)} 🎉
            <br />
            <span className={styles["img-prompt-card__status--winner"]}>{resolution?.result}</span>
          </Typography.Text>
          <Typography.MiniDescription onClick={onClickSeeResults}>See results</Typography.MiniDescription>
        </>
      );
    }

    if (status === PromptWarsMarketContractStatus.UNRESOLVED) {
      return (
        <>
          <Typography.Text flat>{t(`promptWars.status.${status}`)}</Typography.Text>
          <Typography.MiniDescription onClick={onClaimDepositUnresolved}>
            {t("promptWars.status.miniDescription.claimBackDeposit")}
          </Typography.MiniDescription>
        </>
      );
    }

    return <Typography.Text>{t(`promptWars.status.${status}`)}</Typography.Text>;
  };

  return (
    <Card className={clsx(styles["img-prompt-card"], className)} withSpotlightEffect>
      <Card.Content>
        <Grid.Row>
          <Grid.Col lg={7}>
            <Card withSpotlightEffect className={styles["img-prompt-card__current-img-card"]}>
              <Card.Content className={styles["img-prompt-card__current-img-card--box"]}>
                <div className={styles["img-prompt-card__current-img-card--file"]}>
                  <img src={ipfs.asHttpsURL(market.image_uri)} alt="current" />
                </div>
              </Card.Content>
            </Card>
          </Grid.Col>
          <Grid.Col lg={5}>
            <div className={styles["img-prompt-card__right-column"]}>
              <Card className={styles["img-prompt-card__countdown"]}>
                <Card.Content className={styles["img-prompt-card__countdown--content"]}>
                  <Typography.Description>{t("promptWars.status.description.timeLeft")}</Typography.Description>
                  <Typography.Headline3 flat>
                    <Countdown date={market.ends_at} />
                  </Typography.Headline3>
                  {marketContractValues.isResolutionWindowExpired && (
                    <Button
                      variant="outlined"
                      color="success"
                      size="xs"
                      className={styles["img-prompt-card__countdown--button"]}
                      onClick={onClickCreateNewGame}
                    >
                      {t("promptWars.button.createNewGame")}
                    </Button>
                  )}
                </Card.Content>
              </Card>
              <div className={styles["img-prompt-card__start-end-time"]}>
                {getDatesElement()}

                <Card className={styles["img-prompt-card__stats"]} withSpotlightEffect>
                  <Card.Content className={styles["img-prompt-card__stats--content"]}>
                    <Typography.Description>{t("promptWars.status.description.status")}</Typography.Description>
                    {getStatusElement()}
                    <Typography.Description>{t("promptWars.status.description.participants")}</Typography.Description>
                    <Typography.Text flat={outcomeIds.includes(walletState.address as string)}>
                      {outcomeIds.length}
                    </Typography.Text>
                    <Typography.MiniDescription>
                      {outcomeIds.includes(walletState.address as string)
                        ? t("promptWars.status.description.youReIn")
                        : null}
                    </Typography.MiniDescription>
                    <Typography.Description>{t("promptWars.status.description.totalPriceBag")}</Typography.Description>
                    <Typography.Text flat>
                      {t("promptWars.description.usdt")}{" "}
                      {currency.convert.toDecimalsPrecisionString(collateralToken.balance, collateralToken.decimals)}
                    </Typography.Text>
                  </Card.Content>
                </Card>
              </div>
            </div>
          </Grid.Col>
        </Grid.Row>
      </Card.Content>
      <Card.Actions>
        <div className={styles["img-prompt-card__start-end-time--resolution"]}>
          <Typography.Description flat>{t("promptWars.status.description.contract")}</Typography.Description>
          <Typography.Anchor href={`${near.getConfig().explorerUrl}/accounts/${marketId}`} target="_blank">
            {marketId} <Icon name="icon-launch" />
          </Typography.Anchor>
        </div>
      </Card.Actions>
    </Card>
  );
};
