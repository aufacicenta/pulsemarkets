import { useEffect, useState } from "react";
import { filesize } from "filesize";
import clsx from "clsx";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "ui/shadcn/dropdown-menu/DropdownMenu";
import { useChatSidebarContext } from "context/chat-sidebar/useChatSidebarContext";
import { useAuthorizationContext } from "context/authorization/useAuthorizationContext";
import { useLocalStorage } from "hooks/useLocalStorage/useLocalStorage";
import { ChatContextMessage } from "context/message/MessageContext.types";
import { LocalStorageKeys } from "hooks/useLocalStorage/useLocalStorage.types";
import { useMessageContext } from "context/message/useMessageContext";
import { useFileContext } from "context/file/useFileContext";
import { Button } from "ui/button/Button";
import { SheetContent, SheetFooter } from "ui/shadcn/sheet/Sheet";
import { Typography } from "ui/typography/Typography";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "ui/shadcn/accordion/Accordion";
import { LocaleSelector } from "ui/locale-selector/LocaleSelector";
import { ThemeSelector } from "ui/theme-selector/ThemeSelector";
import { FileObject } from "context/file/FileContext.types";
import { useFormContext } from "context/form/useFormContext";
import { FormFieldNames } from "app/chat/dropbox-chat/DropboxChat.types";

import styles from "./ChatSidebar.module.scss";
import { ChatSidebarProps } from "./ChatSidebar.types";

// @TODO Add an "extractions" section
// labels: 250 USDT, P1
export const ChatSidebar: React.FC<ChatSidebarProps> = () => {
  const [threads, setThreads] = useState<ChatContextMessage[][]>([]);

  const authContext = useAuthorizationContext();

  const chatSidebarContext = useChatSidebarContext();

  const messageContext = useMessageContext();

  const formContext = useFormContext();

  const fileContext = useFileContext();

  const ls = useLocalStorage();

  useEffect(() => {
    if (!chatSidebarContext.isOpen) {
      return;
    }

    setThreads(ls.get<ChatContextMessage[][]>(LocalStorageKeys.threads) || []);
  }, [chatSidebarContext.isOpen]);

  useEffect(() => {
    if (!chatSidebarContext.isOpen) {
      return;
    }

    fileContext.getUserFiles();
  }, [chatSidebarContext.isOpen]);

  const onClickFileInquire = (file: FileObject) => {
    formContext.setFieldValue(FormFieldNames.message, `Let's work with this file: "${file.name}"`);

    chatSidebarContext.close();
  };

  return (
    <SheetContent side="left" className={clsx(styles["chat-sidebar"], styles["chat-sidebar__sheet-content"])}>
      <div className={styles["chat-sidebar__header"]} />
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <Typography.Headline6 flat>Files</Typography.Headline6>
          </AccordionTrigger>
          <AccordionContent>
            <div className={styles["chat-sidebar__files"]}>
              {fileContext.userFiles.map((file) => (
                <div className={styles["chat-sidebar__file--item"]} key={file.id}>
                  <Typography.Description flat truncate>
                    {file.name}
                  </Typography.Description>
                  <div className={styles["chat-sidebar__file--item-options"]}>
                    <Typography.MiniDescription flat>{filesize(file.metadata.size)} </Typography.MiniDescription>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="text" size="xs" color="secondary">
                          Options
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>File Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => onClickFileInquire(file)}>Inquire</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <Typography.Headline6 flat>Authorizations</Typography.Headline6>
          </AccordionTrigger>
          <AccordionContent>
            {authContext.authItems.map((item) => (
              <div className={styles["chat-sidebar__file--item"]} key={item.name.trim()}>
                <Typography.Description flat>{item.name}</Typography.Description>
                <div className={styles["chat-sidebar__file--item-options"]}>
                  <Typography.MiniDescription flat>
                    {item.isAuthorized ? "Authorized" : <span>Authorize</span>}
                  </Typography.MiniDescription>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="text" size="xs" color="secondary">
                        Options
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => authContext.revokeAuth(item.key)}>Revoke</DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <Typography.Headline6 flat>Threads</Typography.Headline6>
          </AccordionTrigger>
          <AccordionContent>
            {threads.map((item, index) => (
              <div
                className={styles["chat-sidebar__thread--item"]}
                key={item[0].id}
                onClick={() => messageContext.loadMessageThread(index)}
                role="button"
                tabIndex={0}
                onKeyPress={() => undefined}
              >
                <Typography.Description flat truncate>
                  {item[1].content}
                </Typography.Description>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SheetFooter className={styles["chat-sidebar__sheet-footer"]}>
        <LocaleSelector />
        <ThemeSelector />
      </SheetFooter>
    </SheetContent>
  );
};
