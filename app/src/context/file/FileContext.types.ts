import { ReactNode } from "react";
import { FileObject as SupabaseFileObject } from "@supabase/storage-js/src/lib/types";

import { DropzoneFileExtended } from "ui/dropzone/Dropzone.types";

export type FileContextControllerProps = {
  children: ReactNode;
};

export type FileObject = SupabaseFileObject;

export type FileContextType = {
  extendFileObjects: (files: Array<DropzoneFileExtended>) => Array<DropzoneFileExtended>;
  upload: (file: DropzoneFileExtended) => void;
  queue: () => void;
  getStorageBucketName: () => string;
  getUserFiles: () => void;
  userFiles: FileObject[];
};
