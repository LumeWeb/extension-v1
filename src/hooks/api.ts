import browser, { Runtime } from "@lumeweb/webextension-polyfill";
import { receiveRequest, RPCRequest } from "../router.js";
import "../api/dns_handler.js";

browser.runtime.onMessage.addListener(handler);

async function handler(message: any): Promise<any> {
  return receiveRequest(message as RPCRequest);
}
