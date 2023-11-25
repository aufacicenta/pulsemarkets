import { DropzoneFile } from "dropzone";
import { ReactNode } from "react";
import { Observable } from "rxjs";

export type DropzoneProps = {
  children?: ReactNode;
  className?: string;
};

export type DropzoneFileExtended = {
  progressObservable: Observable<number>;
  setProgress: (key: string, value: number) => void;
} & DropzoneFile;
