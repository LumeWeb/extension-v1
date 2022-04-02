// @ts-ignore
import browser, { Runtime } from "@lumeweb/webextension-polyfill";
import { receiveRequest } from "../router/content.js";
import { RPCRequest } from "../router/shared.js";
import "../api/dns_handler.js";

browser.runtime.onMessage.addListener(handler);

async function handler(message: any): Promise<any> {
  return receiveRequest(message as RPCRequest);
}
