import "../styles/globals.css";
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
  <>
    <Head>
      <title>Genni – Prototype in Seconds with AI</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    </Head>
    <Component {...pageProps} />
  </>);
}

export default MyApp;
