import { Html, Head, Main, NextScript } from 'next/document'
import "../globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css"

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Default SEO */}
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Iftekher" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}