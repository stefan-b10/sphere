import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  permissions: ["storage", "activeTab", "tabs", "webRequest"],
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon-34.png",
  },
  icons: {
    "128": "icon-128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      // KEY for cache invalidation
      css: [],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "src/pages/content/index.js",
        "src/pages/injected/index.js",
        "icon-128.png",
        "icon-34.png",
      ],
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
    },
  ],
};

export default manifest;
