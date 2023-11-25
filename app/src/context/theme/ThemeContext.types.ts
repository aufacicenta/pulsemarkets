import { ReactNode } from "react";

import { Theme } from "ui/theme-selector/ThemeSelector.types";

export type ThemeContextControllerProps = {
  children: ReactNode;
};

export type ThemeContextType = {
  theme: Theme;
  handleOnThemeChange: () => void;
};
