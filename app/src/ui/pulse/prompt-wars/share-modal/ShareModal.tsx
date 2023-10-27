import clsx from "clsx";
import ClipboardJS from "clipboard";
import { useLayoutEffect, useState } from "react";

import { Modal } from "ui/modal/Modal";
import { Typography } from "ui/typography/Typography";
import { Button } from "ui/button/Button";
import { Icon } from "ui/icon/Icon";

import styles from "./ShareModal.module.scss";
import { ShareModalProps } from "./ShareModal.types";

export const ShareModal: React.FC<ShareModalProps> = ({ onClose, className }) => {
  const [isClipboardSuccess, setIsClipboardSuccess] = useState(false);

  useLayoutEffect(() => {
    const clipboard = new ClipboardJS("#share-button");

    clipboard.on("success", () => {
      setIsClipboardSuccess(true);

      setTimeout(() => {
        setIsClipboardSuccess(false);
      }, 2000);
    });
  }, []);

  return (
    <Modal
      className={clsx(styles["share-modal"], className)}
      isOpened
      aria-labelledby="Prompt Wars Share Modal Window"
      onClose={onClose}
    >
      <Modal.Header onClose={onClose}>
        <Typography.Headline2 flat>Challenge your friends!</Typography.Headline2>
      </Modal.Header>
      <Modal.Content>
        <Button
          size="l"
          variant="outlined"
          color="success"
          fullWidth
          id="share-button"
          data-clipboard-text={window.location.href}
        >
          {isClipboardSuccess ? (
            "Link Copied to clipboard!"
          ) : (
            <>
              Tap to copy link & share&nbsp;
              <Icon name="icon-paper-plane" />
            </>
          )}
        </Button>
      </Modal.Content>
    </Modal>
  );
};
