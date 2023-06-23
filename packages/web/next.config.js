const withPlugins = require('next-compose-plugins');
const withLess = require('next-with-less');

const assetPrefix = process.env.ASSET_PREFIX || '';

// /** eslint-disable @typescript-eslint/no-var-requires */
// const withTM = require("next-transpile-modules")([
//   "@solana/wallet-adapter-base",
//   "@solana/wallet-adapter-wallets",
//   // "web3",
//   // Uncomment wallets you want to use
//   // "@solana/wallet-adapter-bitpie",
//   // "@solana/wallet-adapter-coin98",
//   "@solana/wallet-adapter-ledger",
//   "@solana/wallet-adapter-mathwallet",
//   "@solana/wallet-adapter-phantom",
//   "@solana/wallet-adapter-slope",
//   "@solana/wallet-adapter-react",

//   "@solana/wallet-adapter-solflare",
//   "@solana/wallet-adapter-sollet",
//   "@solana/wallet-adapter-solong",
//   "@solana/wallet-adapter-torus",
//   // "@solana/wallet-adapter-wallets",
//   "@project-serum/sol-wallet-adapter",
//   // "@solana/wallet-adapter-ant-design",
// ]);

const plugins = [
  [
    withLess,
    {
      lessLoaderOptions: {
        lessOptions: {
          modifyVars: {
            '@primary-color': '#768BF9',
            '@text-color': 'rgba(255, 255, 255)',
            '@assetPrefix': assetPrefix || "''",
          },
          javascriptEnabled: true,
        },
      },
    },
  ],
];

module.exports = withPlugins(plugins, {
  disDir: "build",
  assetPrefix,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // exportPathMap: async function (
  //   defaultPathMap,
  //   { dev, dir, outDir, distDir, buildId }
  // ) {
  //   return {
  //     '/': { page: '/' },
  //     '/mint/:mintAddress': { page: '/', query: { mintAddress: 'HVSDRsstmXWV3fsPAZrRsi5J3To9Geajgwao5GhLYC35' } },
  //     '/profile': { page: '/' },
  //   }
  // },
  images: {
    domains: ["i.pravatar.cc", "arweave.net", "res.cloudinary.com"],
  },
  async rewrites() {
    return [
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  },
});
