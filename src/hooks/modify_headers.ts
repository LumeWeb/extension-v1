import { isIp, normalizeDomain } from "@lumeweb/resolver";
// @ts-ignore
import browser, { WebRequest } from "@lumeweb/webextension-polyfill";
import dnsCache from "../cache.js";
import { getContentType } from "../utils.js";

const isFirefox = typeof browser?.proxy?.onRequest?.addListener !== "undefined";

browser.webRequest.onBeforeSendHeaders.addListener(
  handler,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

function handler(
  details: WebRequest.OnBeforeSendHeadersDetailsType
): WebRequest.BlockingResponse {
  const originalUrl = new URL(details.url);
  const hostname = normalizeDomain(originalUrl.hostname);
  // @ts-ignore
  const headers: HttpHeaders = [];

  if (hostname in dnsCache) {
    const contentPath: string = dnsCache[hostname];

    if (isIp(contentPath)) {
      return {};
    }

    let contentHash: string = contentPath;
    if (contentPath.includes("://")) {
      contentHash = contentPath.split("://").pop() as string;
    }
    if (isFirefox) {
      headers.push({
        name: "Host",
        value: hostname,
      });
      headers.push({
        name: "User-Agent",
        value: navigator.userAgent,
      });
    }
    headers.push({
      name: "X-Content-Hash",
      value: contentHash,
    });
    const type = getContentType(contentPath);

    if (type) {
      headers.push({
        name: "X-Content-Hash-Type",
        value: type,
      });
    }

    return { requestHeaders: headers };
  }

  return {};
}
