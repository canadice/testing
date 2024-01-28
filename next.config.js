/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'swagger-ui-react',
    'swagger-client',
    'react-syntax-highlighter',
  ],
  env: {},
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: ['preset-default'],
            },
            dimensions: false,
            memo: true,
            svgProps: {
              role: 'img',
            },
          },
        },
      ],
    });
    return config;
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;
