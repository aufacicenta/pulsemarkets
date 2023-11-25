import clsx from "clsx";
import React from "react";

import styles from "./MainPanel.module.scss";
import { MainPanelContainerProps, MainPanelProps } from "./MainPanel.types";

export const MainPanel = ({ children, className, withNavBar }: MainPanelProps) => (
  <main
    className={clsx(styles["main-panel"], className, {
      [styles["main-panel--with-navbar"]]: withNavBar,
    })}
  >
    {children}
  </main>
);

const Container: React.FC<MainPanelContainerProps> = ({ children, className, paddingX }) => (
  <div
    className={clsx(styles["main-panel__container"], className, {
      [styles["main-panel__container--paddingX"]]: paddingX,
    })}
  >
    {children}
  </div>
);

MainPanel.Container = Container;
