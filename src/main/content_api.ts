import { resolve } from "../api/dns.js";
import {
  attachPostMessageContentListener,
  attachPostMessageWebPageListener,
} from "../router.js";
// @ts-ignore
window.lume = {
  dns: {
    resolve,
  },
};

attachPostMessageWebPageListener();
