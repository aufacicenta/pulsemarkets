import clsx from "clsx";
import DropzoneJS from "dropzone";
import { useEffect } from "react";

import { Typography } from "ui/typography/Typography";
import { Icon } from "ui/icon/Icon";
import { useFileContext } from "context/file/useFileContext";

import styles from "./Dropzone.module.scss";
import { DropzoneFileExtended, DropzoneProps } from "./Dropzone.types";

let dropzone: DropzoneJS | undefined;

export const Dropzone: React.FC<DropzoneProps> = ({ className }) => {
  const fileContext = useFileContext();

  const onAddedFiles = (files: DropzoneJS.DropzoneFile[]) => {
    fileContext.extendFileObjects(files as Array<DropzoneFileExtended>);
    fileContext.queue();
  };

  useEffect(() => {
    if (dropzone) {
      return;
    }

    try {
      dropzone = new DropzoneJS("#dropzone", {
        url: "/",
        parallelUploads: 10,
        createImageThumbnails: false,
        uploadMultiple: true,
      });

      dropzone.on("addedfiles", onAddedFiles);
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className={clsx(styles.dropzone, className, "dropzone")} id="dropzone">
      <Typography.Text flat className={clsx(styles.dropzone__message, "dz-message")}>
        <Icon name="icon-file-add" />
        &nbsp;Drop files here or&nbsp;<em>click to upload</em>
      </Typography.Text>
    </div>
  );
};
