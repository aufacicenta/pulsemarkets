import { ReactNode } from "react";

export type ChatSidebarContextControllerProps = {
  children: ReactNode;
};

export type ChatSidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};
