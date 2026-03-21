import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: ["stitch_anonymous_chat_main_page/**"]
  }
];

export default config;
