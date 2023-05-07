// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ['static.vecteezy.com',
      'https://static.vecteezy.com/system/resources/previews/018/764/128/original/chatgpt-logo-open-ai-icon-with-chatbot-artificial-intelligence-openai-chatbot-icon-chatgpt-openai-icon-artificial-intelligence-smart-ai-virtual-smart-assistant-bot-free-vector.jpg'],
  },
  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};
export default config;
