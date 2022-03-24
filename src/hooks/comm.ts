import browser from "@lumeweb/webextension-polyfill";
import resolver, { isDomain, isIp, normalizeDomain } from "@lumeweb/resolver";
import { getContentType } from "../utils.js";
import dnsCache from "../cache.js";

browser.runtime.onMessage.addListener(handleCommunication);

async function handleCommunication(data: {
  action: string;
  url: string;
  force?: boolean;
}) {
  if ("resolve" === data.action) {
    if (!data.url || data.url.length === 0) {
      return false;
    }
  } else {
    return;
  }
  const originalUrl = new URL(data.url);
  const hostname = normalizeDomain(originalUrl.hostname);

  const force = data.force ?? false;

  let target;
  try {
    target = await resolver.resolve(hostname, {}, force);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log(e);
    return false;
  }

  if (target) {
  }
}
