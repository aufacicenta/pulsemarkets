import { ReactNode } from "react";

export type ShareModalProps = {
  onClose: () => void;
  children?: ReactNode;
  className?: string;
};
