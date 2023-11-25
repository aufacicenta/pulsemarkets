import clsx from "clsx";
import Head from "next/head";
import { useRouter } from "next/router";

import { MainPanel } from "ui/mainpanel/MainPanel";
import { ToastContextController } from "context/toast/ToastContextController";
import { FileContextController } from "context/file/FileContextController";
import { MessageContextController } from "context/message/MessageContextController";
import { FormContextController } from "context/form/FormContextController";
import { Navbar } from "ui/fileagent/navbar/Navbar";
import { AuthorizationContextController } from "context/authorization/AuthorizationContextController";
import { ThemeContextController } from "context/theme/ThemeContextController";
import { ChatSidebar } from "ui/fileagent/chat-sidebar/ChatSidebar";
import { ChatSidebarContextController } from "context/chat-sidebar/ChatSidebarContextController";
import { Sheet } from "ui/shadcn/sheet/Sheet";

import { ChatLayoutProps } from "./ChatLayout.types";
import styles from "./ChatLayout.module.scss";

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta property="og:image" content="/shared/pulse.png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale} />
      </Head>
      <ThemeContextController>
        <ToastContextController>
          <ChatSidebarContextController>
            <MessageContextController>
              <AuthorizationContextController>
                <FileContextController>
                  <FormContextController>
                    <div id="modal-root" />
                    <div id="dropdown-portal" />
                    <div className={clsx(styles["chat-layout"])}>
                      <Sheet>
                        <Navbar />

                        <MainPanel>
                          <ChatSidebar />

                          {children}
                        </MainPanel>
                      </Sheet>
                    </div>
                  </FormContextController>
                </FileContextController>
              </AuthorizationContextController>
            </MessageContextController>
          </ChatSidebarContextController>
        </ToastContextController>
      </ThemeContextController>
    </>
  );
};
