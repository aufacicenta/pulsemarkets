import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

import { Button } from "../button/Button";
import { BalancePill } from "ui/pulse/sidebar/balance-pill/BalancePill";
import { Typography } from "ui/typography/Typography";
import { Icon } from "ui/icon/Icon";

import styles from "./WalletSelector.module.scss";
import { WalletSelectorProps } from "./WalletSelector.types";

export const WalletSelectorMobile: React.FC<WalletSelectorProps> = ({ className }) => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  const { t } = useTranslation(["prompt-wars"]);

  const handleOnConnectWalletClick = () => {
    if (isConnected) {
      open({ view: "Account" });
    } else {
      open();
    }
  };

  return (
    <div className={clsx(styles["wallet-selector__mobile"], className)}>
      <Button
        size="s"
        color="primary"
        variant="outlined"
        onClick={handleOnConnectWalletClick}
        className={styles["wallet-selector__mobile--button"]}
        animate={undefined}
        rightIcon={<Icon name={address ? "icon-power" : "icon-power-crossed"} />}
      >
        {isConnected ? (
          <Typography.Text inline truncate flat>
            {address}
          </Typography.Text>
        ) : (
          <>{t("promptWars.connectWallet")}</>
        )}
      </Button>

      {isConnected ? <BalancePill /> : null}

      {isConnected ? (
        <Typography.Description
          flat
          onClick={handleOnConnectWalletClick}
          className={styles["wallet-selector__mobile--logout"]}
        >
          {t("promptWars.disconnect")}
        </Typography.Description>
      ) : null}
    </div>
  );
};
