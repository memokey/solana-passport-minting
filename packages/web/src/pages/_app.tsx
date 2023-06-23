import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

import '../styles/index.less';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'></link>
        <link href='https://fonts.googleapis.com/css?family=Outfit' rel='stylesheet'></link>
        <title>Passport NFT Mint</title>
      </Head>
      <div id="root">
        <Component {...pageProps} />
      </div>
    </>
  );
}
