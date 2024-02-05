import { ReactNode } from "react";

export type ThemeSelectorProps = {
  children?: ReactNode;
  className?: string;
  fixed?: boolean;
};

export type Theme = "dark" | "light" | "fileagent" | "fileagent-dark";
