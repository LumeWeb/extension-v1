// @ts-ignore
import browser from "@lumeweb/webextension-polyfill";
import { attachPostMessageContentListener } from "../router/content.js";

const scriptUrl = browser.runtime.getURL("content_api.js");

const el = document.createElement("script");
el.src = scriptUrl;
el.setAttribute("id", "lumeweb");
el.setAttribute("type", "module");
el.onload = () => {
  window.dispatchEvent(new Event("lumeWebLoaded"));
};

(document.head || document.documentElement).appendChild(el);

attachPostMessageContentListener();
