import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

import loader from "ui/generic-loader/generic-loader";
import { LoadingSpinner } from "ui/icons/LoadingSpinner";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta property="og:image" content="/prompt-wars/reddit-ad.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/prompt-wars/reddit-ad.png" />

        <style>{loader}</style>

        {process.env.NODE_ENV === "production" && (
          <>
            <Script async src="https://www.googletagmanager.com/gtag/js?id=G-FKZJ5CT2JZ" />
            <Script id="google-analytics">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-FKZJ5CT2JZ');
            `}
            </Script>
          </>
        )}
      </Head>
      <body>
        <div id="global-loader">
          <LoadingSpinner className="spinner" />
        </div>

        <Main />

        <NextScript />
      </body>
    </Html>
  );
}
