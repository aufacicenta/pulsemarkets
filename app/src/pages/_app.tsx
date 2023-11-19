import { appWithTranslation } from "next-i18next";
import { AppProps } from "next/app";
import { setConfiguration } from "react-grid-system";
import "../theme/globals.scss";
import Script from "next/script";
import { useEffect } from "react";

import { Web3Modal } from "../context/Web3Modal";

setConfiguration({ containerWidths: [540, 740, 960, 1280, 1540], gutterWidth: 32 });

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loader = document.querySelector<HTMLElement>("#global-loader");

      if (loader) {
        loader.style.display = "none";
      }
    }
  }, []);

  return (
    <>
      <Web3Modal>
        <Component {...pageProps} />
      </Web3Modal>
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-T6PR3QEEGR" />
      <Script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-T6PR3QEEGR');`,
        }}
      />
    </>
  );
}

export default appWithTranslation(MyApp);
