import browser from "@lumeweb/webextension-polyfill";
import { attachPostMessageContentListener } from "../router.js";

const scriptUrl = browser.runtime.getURL("content_api.js");
const extensionContext = new URL(scriptUrl).origin === window.location.origin;

const el = document.createElement("script");
el.src = scriptUrl;
el.setAttribute("id", "lumeweb");
el.setAttribute("type", "module");
el.onload = () => {
  window.dispatchEvent(new Event("lumeWebLoaded"));
};

(document.head || document.documentElement).appendChild(el);

attachPostMessageContentListener();
