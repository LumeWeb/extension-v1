import { resolve } from "../api/dns.js";
import { attachPostMessageWebPageListener } from "../router/browser.js";

// @ts-ignore
window.lume = {
  dns: {
    resolve,
  },
};

attachPostMessageWebPageListener();
