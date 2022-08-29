import clsx from "clsx";
import { Form as RFForm } from "react-final-form";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";

import { Modal } from "ui/modal/Modal";
import { Typography } from "ui/typography/Typography";
import { Card } from "ui/card/Card";
import { Form } from "ui/form/Form";
import { Grid } from "ui/grid/Grid";
import { Button } from "ui/button/Button";
import { Icon } from "ui/icon/Icon";
import pulse from "providers/pulse";
import timezones from "providers/date/timezones.json";
import { CategoryPills } from "ui/category-pills/CategoryPills";
import date from "providers/date";
import near from "providers/near";
import {
  DEFAULT_CLAIMING_WINDOW_DAY_SPAN,
  DEFAULT_FEE_RATIO,
  DEFAULT_NETWORK_ENV,
  DEFAULT_RESOLUTION_WINDOW_DAY_SPAN,
} from "providers/near/getConfig";
import { useToastContext } from "hooks/useToastContext/useToastContext";
import useNearMarketFactoryContract from "providers/near/contracts/market-factory/useNearMarketFactoryContract";
import { DeployMarketContractArgs } from "providers/near/contracts/market-factory/market-factory.types";

import styles from "./CreateMarketModal.module.scss";
import { CreateMarketModalForm, CreateMarketModalProps } from "./CreateMarketModal.types";

const generateTimezoneOffsetString = (offset: number, suffix: string) => `${offset}_${suffix}`;
const getTimezoneOffsetString = (input: string) => input.match(/.*?(?=_|$)/i)![0];

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ className, onClose }) => {
  const [collateralTokenSymbol, setCollateralTokenSymbol] = useState(pulse.getConfig().COLLATERAL_TOKENS[0].symbol);
  const [marketEndTimezoneOffset, setMarketEndTimezoneOffset] = useState(
    generateTimezoneOffsetString(timezones[0].offset, timezones[0].value),
  );

  const { t } = useTranslation(["latest-trends", "common"]);
  const toast = useToastContext();

  const MarketFactoryContract = useNearMarketFactoryContract();

  const onSubmit = async (values: CreateMarketModalForm) => {
    try {
      const timezoneOffset = Number(getTimezoneOffsetString(marketEndTimezoneOffset));

      const startsAt = date.parseFromFormat(`${values.marketStartDate} ${values.marketStartTime}`, "YYYY-MM-DD HH:mm");

      const endsAt = date.parseFromFormat(`${values.marketEndDate} ${values.marketEndTime}`, "YYYY-MM-DD HH:mm");

      const resolutionWindow = endsAt.clone().add(DEFAULT_RESOLUTION_WINDOW_DAY_SPAN, "days");
      const claimingWindow = resolutionWindow.clone().add(DEFAULT_CLAIMING_WINDOW_DAY_SPAN, "days");

      const daoAccountId = near.getConfig(DEFAULT_NETWORK_ENV).marketDaoAccountId;
      const collateralTokenAccountId = pulse.getCollateralTokenBySymbol(collateralTokenSymbol).accountId;

      const args: DeployMarketContractArgs = {
        market: {
          description: values.marketDescription,
          info: "market info",
          category: values.marketCategory,
          options: [values.defaultMarketOption, ...values.marketOptions],
          // @TODO validate that date is in the future, otherwise "publish" throws error
          starts_at: date.toNanoseconds(startsAt.valueOf()),
          ends_at: date.toNanoseconds(endsAt.valueOf()),
          utc_offset: timezoneOffset,
        },
        dao_account_id: daoAccountId,
        collateral_token_account_id: collateralTokenAccountId,
        fee_ratio: DEFAULT_FEE_RATIO,
        resolution_window: date.toNanoseconds(resolutionWindow.valueOf()),
        claiming_window: date.toNanoseconds(claimingWindow.valueOf()),
        collateral_token_decimals: pulse.getCollateralTokenByAccountId(collateralTokenAccountId).decimals,
      };

      // @TODO validate args, highlight fields if something's missing

      await MarketFactoryContract.createMarket(args);
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        title: "Oops, our bad.",
        children: <Typography.Text>While creating the market. Try again?</Typography.Text>,
      });
    }
  };

  return (
    <Modal
      className={clsx(styles["create-market-modal"], className)}
      isOpened
      aria-labelledby="Create Market Modal Window"
      onClose={onClose}
    >
      <RFForm
        onSubmit={onSubmit}
        mutators={{
          ...arrayMutators,
        }}
        render={({
          handleSubmit,
          form: {
            mutators: { push, remove },
          },
        }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Header onClose={onClose}>
              <Typography.Headline2 flat>{t("latestTrends.createMarketModal.title")}</Typography.Headline2>
            </Modal.Header>
            <Modal.Content className={styles["create-market-modal__modal-content"]}>
              <div className={styles["create-market-modal__categories"]}>
                <Typography.Headline3>{t("latestTrends.createMarketModal.selectCategories")}</Typography.Headline3>
                <CategoryPills>
                  {pulse.getConfig().MARKET_CATEGORIES.map((category) => (
                    <CategoryPills.Pill
                      name="marketCategory"
                      type="radio"
                      id={category.value}
                      label={category.label}
                      key={category.value}
                      icon={
                        <Typography.Text inline flat>
                          {category.icon}
                        </Typography.Text>
                      }
                    />
                  ))}
                </CategoryPills>
              </div>
              <Card className={styles["create-market-modal__market-details-card"]}>
                <Card.Content>
                  <Typography.Headline3>{t("latestTrends.createMarketModal.marketDetails")}</Typography.Headline3>
                  <Grid.Row>
                    <Grid.Col lg={8} xs={12}>
                      <Form.Label htmlFor="marketDescription">
                        {t("latestTrends.createMarketModal.input.descriptionOfTheMarket")}
                      </Form.Label>
                      <Form.TextInput
                        id="marketDescription"
                        type="text"
                        placeholder={t("latestTrends.createMarketModal.input.descriptionOfTheMarket.placeholder")}
                      />
                    </Grid.Col>
                    <Grid.Col lg={4} xs={12}>
                      <Form.Label htmlFor="collateralToken">
                        {t("latestTrends.createMarketModal.input.collateralToken")}
                      </Form.Label>
                      <Form.Select
                        id="collateralToken"
                        inputProps={{
                          onChange: (value) => {
                            setCollateralTokenSymbol(value as string);
                          },
                          value: collateralTokenSymbol,
                        }}
                      >
                        {pulse.getConfig().COLLATERAL_TOKENS.map((token) => (
                          <Form.Select.Item value={token.symbol} key={token.symbol}>
                            <Typography.Text flat className={styles["create-market-modal__token"]}>
                              <span className={styles["create-market-modal__token--icon-box"]}>
                                <img
                                  src={token.icon}
                                  className={styles["create-market-modal__token--icon"]}
                                  alt="token-icon"
                                />
                              </span>{" "}
                              {token.symbol}
                            </Typography.Text>
                          </Form.Select.Item>
                        ))}
                      </Form.Select>
                    </Grid.Col>
                  </Grid.Row>
                  <div className={styles["create-market-modal__market-options"]}>
                    <Form.Label id="marketOptions">
                      {t("latestTrends.createMarketModal.input.marketOptions")}
                    </Form.Label>
                    <div className={styles["create-market-modal__market-options--option"]}>
                      <div className={styles["create-market-modal__market-options--option-input"]}>
                        <Form.TextInput
                          id="defaultMarketOption"
                          type="text"
                          placeholder={`${t("latestTrends.createMarketModal.input.marketOptions.placeholder")} 1`}
                        />
                      </div>
                      <Button
                        color="secondary"
                        className={styles["create-market-modal__market-options--option-add-remove"]}
                        onClick={() => push("marketOptions", undefined)}
                      >
                        <Icon name="icon-plus-square" />
                      </Button>
                    </div>
                    <FieldArray name="marketOptions">
                      {({ fields }) =>
                        fields.map((name: string, index: number) => (
                          <div className={styles["create-market-modal__market-options--option"]} key={name}>
                            <div className={styles["create-market-modal__market-options--option-input"]}>
                              <Form.TextInput
                                id={name}
                                type="text"
                                placeholder={`${t("latestTrends.createMarketModal.input.marketOptions.placeholder")} ${
                                  index + 2
                                }`}
                              />
                            </div>
                            <Button
                              color="secondary"
                              className={styles["create-market-modal__market-options--option-add-remove"]}
                              onClick={() => remove("marketOptions", name)}
                            >
                              <Icon name="icon-minus-square" />
                            </Button>
                          </div>
                        ))
                      }
                    </FieldArray>
                  </div>
                  <div className={styles["create-market-modal__spacer"]} />
                  <Typography.Headline3>
                    {t("latestTrends.createMarketModal.input.marketStartDatetime")}
                  </Typography.Headline3>
                  <Grid.Row>
                    <Grid.Col lg={4} xs={12}>
                      <Form.Label htmlFor="marketStartDate">
                        {t("latestTrends.createMarketModal.input.marketStartDate")}
                      </Form.Label>
                      <Form.TextInput id="marketStartDate" type="date" />
                    </Grid.Col>
                    <Grid.Col lg={3} xs={12}>
                      <Form.Label htmlFor="marketStartTime">
                        {t("latestTrends.createMarketModal.input.marketStartTime")}
                      </Form.Label>
                      <Form.TextInput id="marketStartTime" type="time" />
                    </Grid.Col>
                  </Grid.Row>
                  <div className={styles["create-market-modal__spacer"]} />
                  <Typography.Headline3>
                    {t("latestTrends.createMarketModal.input.marketEndDatetime")}
                  </Typography.Headline3>
                  <Grid.Row>
                    <Grid.Col lg={4} xs={12}>
                      <Form.Label htmlFor="marketEndDate">
                        {t("latestTrends.createMarketModal.input.marketEndDate")}
                      </Form.Label>
                      <Form.TextInput id="marketEndDate" type="date" />
                    </Grid.Col>
                    <Grid.Col lg={3} xs={12}>
                      <Form.Label htmlFor="marketEndTime">
                        {t("latestTrends.createMarketModal.input.marketEndTime")}
                      </Form.Label>
                      <Form.TextInput id="marketEndTime" type="time" />
                    </Grid.Col>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Col lg={12} xs={12}>
                      <Form.Label htmlFor="marketEndTimezone">
                        {t("latestTrends.createMarketModal.input.marketEndTimezone")}
                      </Form.Label>
                      <Form.Select
                        id="marketEndTimezone"
                        inputProps={{
                          onChange: (value) => {
                            setMarketEndTimezoneOffset(value as string);
                          },
                          value: marketEndTimezoneOffset,
                        }}
                      >
                        {timezones.map((timezone, index) => (
                          <Form.Select.Item
                            value={generateTimezoneOffsetString(timezone.offset, timezone.value)}
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${timezone.abbr}-${index}`}
                          >
                            <Typography.Text flat className={styles["create-market-modal__token"]}>
                              {timezone.text}
                            </Typography.Text>
                          </Form.Select.Item>
                        ))}
                      </Form.Select>
                    </Grid.Col>
                  </Grid.Row>
                </Card.Content>
              </Card>
            </Modal.Content>
            <Modal.Actions>
              <Button type="submit">{t("latestTrends.createMarketModal.form.submit")}</Button>
            </Modal.Actions>
          </form>
        )}
      />
    </Modal>
  );
};
