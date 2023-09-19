import { GetServerSidePropsContext, NextPage } from "next";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

import { DashboardLayout } from "layouts/dashboard-layout/DashboardLayout";
import { PriceMarketContainerProps } from "app/market/price-market/PriceMarket.types";
import { PromptWarsContainer } from "app/prompt-wars/PromptWarsContainer";

const Page: NextPage<PriceMarketContainerProps> = ({ marketId }) => {
  const { t } = useTranslation("head");

  return (
    <DashboardLayout marketId={marketId}>
      <Head>
        <title>{t("head.og.title")}</title>
        <meta name="description" content={t("head.og.description")} />
        <meta property="og:title" content={t("head.og.title")} />
        <meta property="og:description" content={t("head.og.description")} />
        <meta property="og:url" content="https://promptwars.xyz/" />
      </Head>

      <PromptWarsContainer marketId={marketId} />
    </DashboardLayout>
  );
};

export const getServerSideProps = async ({ locale, params }: GetServerSidePropsContext) => {
  await i18n?.reloadResources();

  const marketId = params?.marketId;

  return {
    props: {
      ...(await serverSideTranslations(locale!, ["common", "head", "prompt-wars"])),
      marketId,
    },
  };
};

export default Page;
