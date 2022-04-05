import browser, {
  runtime,
  WebRequest,
  Proxy,
  // @ts-ignore
} from "@lumeweb/webextension-polyfill";
import resolver, {
  isDomain,
  isIp,
  normalizeDomain,
  Portal,
} from "@lumeweb/resolver";

import tldEnum from "@lumeweb/tld-enum";
import dnsCache from "../cache";
const isFirefox = typeof browser?.proxy?.onRequest?.addListener !== "undefined";

if (isFirefox) {
  browser.proxy.onRequest.addListener(proxyHandler, { urls: ["<all_urls>"] });
}

browser.webRequest.onBeforeRequest.addListener(
  handler,
  { urls: ["<all_urls>"] },
  ["blocking"]
);

function handler(
  details: WebRequest.OnBeforeRequestDetailsType
): WebRequest.BlockingResponse {
  const originalUrl = new URL(details.url);
  const hostname = normalizeDomain(originalUrl.hostname);

  const port = originalUrl.protocol === "https:" ? "443" : "80";
  const access = originalUrl.protocol === "https:" ? "HTTPS" : "PROXY";

  const tld = hostname.includes(".")
    ? hostname.split(".")[hostname.split(".").length - 1]
    : hostname;

  if (tldEnum.list.includes(tld)) {
    return {};
  }

  const resolverDir = runtime.getURL("/");
  const resolverPage = runtime.getURL("/dns.html");

  if (
    details.url.toLowerCase().includes(resolverDir) ||
    details.url.toLowerCase().includes("/dns")
  ) {
    return {};
  }

  if (!(hostname in dnsCache)) {
    const resolverPageUrl = new URL(resolverPage);
    resolverPageUrl.searchParams.append(
      "url",
      encodeURI(originalUrl.toString())
    );
    return { redirectUrl: resolverPageUrl.toString() };
  }

  let script;
  const target = dnsCache[hostname];
  const portal: Portal = resolver.getRandomPortal("web3link") as Portal;

  if (!portal) {
    return {};
  }

  if (!isFirefox) {
    if (isIp(target) || isDomain(target)) {
      script = `function FindProxyForURL(url, host) {
  if ('${portal.host}' === host){ return 'DIRECT';}
  if (host=== '${hostname}'){
    return '${access} ${target}:${port}';}
  return 'DIRECT';
}`;
    } else {
      script = `function FindProxyForURL(url, host) {
  if ('${portal.host}' === host){ return 'DIRECT';}
  if (host=== '${hostname}'){
    return '${access} ${portal.host}:${port}';}
  return 'DIRECT';
}`;
    }

    const config = {
      mode: "pac_script",
      pacScript: {
        data: script,
      },
    };

    browser.proxy.settings.set({ value: config, scope: "regular" });
  }

  if (!isIp(target) && "https:" === originalUrl.protocol) {
    originalUrl.protocol = "http:";
    return { redirectUrl: originalUrl.toString() };
  }
  if (hostname !== originalUrl.hostname) {
    originalUrl.hostname = hostname;
    return { redirectUrl: originalUrl.toString() };
  }

  return {};
}

function proxyHandler(details: Proxy.OnRequestDetailsType) {
  const originalUrl = new URL(details.url);
  const hostname = normalizeDomain(originalUrl.hostname);

  const port = "80";
  const access = "HTTP";

  const tld = hostname.includes(".")
    ? hostname.split(".")[hostname.split(".").length - 1]
    : hostname;

  if (tldEnum.list.includes(tld)) {
    return { type: "direct" };
  }

  if (hostname in dnsCache) {
    const target = dnsCache[hostname];

    if (isIp(target) || isDomain(target)) {
      return { type: access, port, host: target };
    }

    const portal: Portal = resolver.getRandomPortal("web3link") as Portal;

    if (!portal) {
      return { type: "direct" };
    }

    return { type: access, port, host: portal.host };
  }

  return { type: "direct" };
}
