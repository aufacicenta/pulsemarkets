import clsx from "clsx";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { MainPanel } from "ui/mainpanel/MainPanel";
import { WalletSelectorNavbar } from "ui/wallet-selector-navbar/WalletSelectorNavbar";
import { ToastContextController } from "context/toast/ToastContextController";
import { PulseSidebar } from "ui/pulse/sidebar/PulseSidebar";
import { NearWalletSelectorContextController } from "context/near/wallet-selector/NearWalletSelectorContextController";
import { WalletStateContextController } from "context/wallet/state/WalletStateContextController";
import { NearMarketFactoryContractContextController } from "context/near/market-factory-contract/NearMarketFactoryContractContextController";
import { NearPromptWarsMarketContractContextController } from "context/near/prompt-wars-market-contract/NearPromptWarsMarketContractContextController";
import { Footer } from "ui/footer/Footer";
import { LocaleSelector } from "ui/locale-selector/LocaleSelector";
import { useLocalStorage } from "hooks/useLocalStorage/useLocalStorage";

import { DashboardLayoutProps } from "./DashboardLayout.types";
import styles from "./DashboardLayout.module.scss";

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, marketId }) => {
  const [isSidebarOpen, setSidebarVisibility] = useState(false);

  const { locale } = useRouter();

  const ls = useLocalStorage();

  useEffect(() => {
    // @todo set with a toggle button from navbar or footer
    document.body.dataset.theme = "dark";
  }, []);

  useEffect(() => {
    if (ls.get("promptwars_wallet_auth_key") === null) {
      console.log(`PulseSidebar: displaying guest connection pulse`);

      setSidebarVisibility(true);
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta property="og:image" content="/shared/pulse.png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale} />
      </Head>
      <WalletStateContextController>
        <NearWalletSelectorContextController>
          <ToastContextController>
            <NearMarketFactoryContractContextController>
              <NearPromptWarsMarketContractContextController marketId={marketId}>
                <div id="modal-root" />
                <div id="dropdown-portal" />
                <div
                  className={clsx(styles["dashboard-layout"], {
                    [styles["dashboard-layout__with-top-alert"]]: false,
                  })}
                >
                  <WalletSelectorNavbar onClickSidebarVisibility={() => setSidebarVisibility(true)} />

                  <LocaleSelector />

                  <PulseSidebar
                    isOpen={isSidebarOpen}
                    handleOpen={() => setSidebarVisibility(true)}
                    handleClose={() => setSidebarVisibility(false)}
                  />

                  <MainPanel withNavBar>
                    {children}

                    <Footer />
                  </MainPanel>
                </div>
              </NearPromptWarsMarketContractContextController>
            </NearMarketFactoryContractContextController>
          </ToastContextController>
        </NearWalletSelectorContextController>
      </WalletStateContextController>
    </>
  );
};
