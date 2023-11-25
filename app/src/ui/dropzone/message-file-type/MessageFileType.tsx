import clsx from "clsx";

import { useFormContext } from "context/form/useFormContext";
import { useSubscription } from "hooks/useSubscription/useSubscription";
import { useTypingSimulation } from "hooks/useTypingSimulation/useTypingSimulation";
import { Button } from "ui/button/Button";
import { CircularProgress } from "ui/circular-progress/CircularProgress";
import { Icon } from "ui/icon/Icon";
import { Typography } from "ui/typography/Typography";

import styles from "./MessageFileType.module.scss";
import { MessageFilTypeOptionsProps, MessageFileTypeProps } from "./MessageFileType.types";

export const MessageFileType = ({ message, className }: MessageFileTypeProps) => {
  const isSimulationEnabled = message.role === "assistant" && !message.hasInnerHtml;

  const { simulationEnded } = useTypingSimulation(message.content, isSimulationEnabled, `#${message.id}`);

  const progress: number = useSubscription(0, message.file.progressObservable);

  return (
    <div className={clsx(styles["message-file-type"], className)}>
      <div>
        <div className={styles["message-file-type__avatar"]}>
          <div className={styles["message-file-type__avatar-box"]}>
            {progress === 100 ? (
              <Icon name="icon-file-check" />
            ) : (
              <CircularProgress color="#ffd74b" percentage={progress} fontSize="21px" />
            )}
          </div>
        </div>
        <div className={styles["message-file-type__content"]}>
          {message.beforeContentComponent && simulationEnded && message.beforeContentComponent}

          {!isSimulationEnabled ? (
            <Typography.Text>{message.content}</Typography.Text>
          ) : (
            <Typography.Text id={message.id} />
          )}

          {message.afterContentComponent && simulationEnded && message.afterContentComponent}
        </div>
      </div>
    </div>
  );
};

const Options = ({ fieldName, file }: MessageFilTypeOptionsProps) => {
  const formContext = useFormContext();

  const onClickExtractContent = () => {
    formContext.setFieldValue(fieldName, `Extract and explain the content from the file "${file.name}"`);
  };

  const onClickDropboxESign = () => {
    formContext.setFieldValue(
      fieldName,
      `Generate an embedded Dropbox Sign™ request for "${file.name}" with the following details:

Title: My Signature Request
Subject: Please sign this document
Message: A message
Signers: First Last [email@email.com], First Last [email@email.com]`,
    );
  };

  return (
    <div className={styles["message-file-type__options"]}>
      <Button
        className={styles["message-file-type__options--dropbox-button"]}
        color="secondary"
        variant="outlined"
        size="s"
        onClick={onClickDropboxESign}
      >
        E-Sign with Dropbox
      </Button>
      <Button color="secondary" variant="outlined" size="s" onClick={onClickExtractContent}>
        Extract content
      </Button>
      {/* <Button color="secondary" variant="outlined" size="s">
        Share
      </Button>
      <Button color="danger" variant="outlined" size="s">
        Delete
      </Button> */}
    </div>
  );
};

MessageFileType.Options = Options;
