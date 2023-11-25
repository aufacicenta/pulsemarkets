import { GetServerSidePropsContext, NextPage } from "next";
import { i18n } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

import { AccountId } from "providers/near/contracts/market/market.types";
import { ChatLayout } from "layouts/chat-layout/ChatLayout";
import { DropboxChatContainer } from "app/chat/dropbox-chat/DropboxChatContainer";

const Index: NextPage<{ marketId: AccountId }> = () => (
  // const { t } = useTranslation("head");

  <ChatLayout>
    <DropboxChatContainer />
    <Head>
      {/* <title>{t("head.og.title")}</title>
        <meta name="description" content={t("head.og.description")} />
        <meta property="og:title" content={t("head.og.title")} />
        <meta property="og:description" content={t("head.og.description")} />
        <meta property="og:url" content="https://app.pulsemarkets.org/" /> */}
    </Head>
  </ChatLayout>
);
export const getServerSideProps = async ({ locale }: GetServerSidePropsContext) => {
  await i18n?.reloadResources();

  return {
    props: {
      ...(await serverSideTranslations(locale!, ["common", "head", "chat"])),
    },
  };
};

export default Index;
