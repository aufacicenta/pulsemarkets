import clsx from "clsx";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { MainPanel } from "ui/mainpanel/MainPanel";
import { WalletSelectorNavbar } from "ui/wallet-selector-navbar/WalletSelectorNavbar";
import { ToastContextController } from "context/toast/ToastContextController";
import { PulseSidebar } from "ui/pulse/sidebar/PulseSidebar";
import { NearMarketFactoryContractContextController } from "context/near/market-factory-contract/NearMarketFactoryContractContextController";
import { NearPromptWarsMarketContractContextController } from "context/near/prompt-wars-market-contract/NearPromptWarsMarketContractContextController";
import { Footer } from "ui/footer/Footer";
import { useLocalStorage } from "hooks/useLocalStorage/useLocalStorage";
import { ThemeContextController } from "context/theme/ThemeContextController";
import { LocaleSelector } from "ui/locale-selector/LocaleSelector";
import { EvmWalletSelectorContextController } from "context/evm/wallet-selector/EvmWalletSelectorContextController";
import { PromptWarsMarketContractContextController } from "context/evm/prompt-wars-market-contract/PromptWarsMarketContractContextController";

import { DashboardLayoutProps } from "./DashboardLayout.types";
import styles from "./DashboardLayout.module.scss";

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, marketId }) => {
  const [isSidebarOpen, setSidebarVisibility] = useState(false);

  const { locale } = useRouter();

  const ls = useLocalStorage();

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
        <meta property="og:image" content="/shared/pulse.png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale} />
      </Head>
      <ThemeContextController>
        <EvmWalletSelectorContextController>
          <ToastContextController>
            <NearMarketFactoryContractContextController>
              <NearPromptWarsMarketContractContextController marketId={marketId}>
                <PromptWarsMarketContractContextController marketId={marketId}>
                  <div id="modal-root" />
                  <div id="dropdown-portal" />
                  <div
                    className={clsx(styles["dashboard-layout"], {
                      [styles["dashboard-layout__with-top-alert"]]: false,
                    })}
                  >
                    <WalletSelectorNavbar onClickSidebarVisibility={() => setSidebarVisibility(true)} />

                    <LocaleSelector fixed />

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
                </PromptWarsMarketContractContextController>
              </NearPromptWarsMarketContractContextController>
            </NearMarketFactoryContractContextController>
          </ToastContextController>
        </EvmWalletSelectorContextController>
      </ThemeContextController>
    </>
  );
};
