import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

import { Button } from "../button/Button";
import { Typography } from "ui/typography/Typography";
import { Icon } from "ui/icon/Icon";
// import { useNearWalletSelectorContext } from "context/near/wallet-selector/useNearWalletSelectorContext";
// import { useWalletStateContext } from "context/wallet/state/useWalletStateContext";

import { WalletSelectorProps } from "./WalletSelector.types";
import styles from "./WalletSelector.module.scss";

import "@near-wallet-selector/modal-ui/styles.css";

export const WalletSelector: React.FC<WalletSelectorProps> = ({ className }) => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  const handleOnDisplayWidgetClick = () => {
    if (isConnected) {
      open({ view: "Account" });
    } else {
      open();
    }
  };

  const { t } = useTranslation(["prompt-wars"]);

  return (
    <div className={clsx(styles["wallet-selector"], className)}>
      <Button
        // color={wallet.actions.isGettingGuestWallet ? "success" : "primary"}
        color="primary"
        variant="outlined"
        onClick={handleOnDisplayWidgetClick}
        rightIcon={<Icon name={address ? "icon-power" : "icon-power-crossed"} />}
        className={styles["wallet-selector__button"]}
        // animate={wallet.actions.isGettingGuestWallet ? "pulse" : undefined}
        size="s"
      >
        {isConnected ? (
          <Typography.Text inline truncate flat>
            {address}
          </Typography.Text>
        ) : (
          <>
            {/* {wallet.actions.isGettingGuestWallet
              ? t("promptWars.walletSelector.isSettingGuestWallet")
              : t("promptWars.connectWallet")} */}
            {t("promptWars.connectWallet")}
          </>
        )}
      </Button>
    </div>
  );
};
