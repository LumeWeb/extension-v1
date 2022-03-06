import browser, { runtime } from "webextension-polyfill";
import resolver from "@lumeweb/resolver";
import "whatwg-fetch";
import fetchBuilder, { RequestInitWithRetry } from "fetch-retry";
import { ipfsPath as isIPFS, ipnsPath as isIPNS } from "is-ipfs";
import {
  isIp,
  normalizeDomain,
  startsWithSkylinkRegExp,
} from "@lumeweb/resolver";
// import OnBeforeRequestDetailsType = WebRequest.OnBeforeRequestDetailsType;
// import BlockingResponse = WebRequest.BlockingResponse;
// import OnBeforeSendHeadersDetailsType = WebRequest.OnBeforeSendHeadersDetailsType;
// import HttpHeaders = WebRequest.HttpHeaders;
// import OnInstalledDetailsType = Runtime.OnInstalledDetailsType;

const CONTENT_TYPE_SKYLINK = "skylink";
const CONTENT_TYPE_IPFS = "ipfs";
const CONTENT_TYPE_IPNS = "ipns";

browser.webRequest.onBeforeRequest.addListener(
  maybeRedirectRequest,
  { urls: ["<all_urls>"] },
  ["blocking"]
);

browser.webRequest.onBeforeSendHeaders.addListener(
  maybeInjectContentHeader,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

browser.runtime.onInstalled.addListener(setupExtension);
browser.runtime.onMessage.addListener(handleCommunication);

const dnsCache: { [domain: string]: string } = {};
let tldList: string[] = [];

resolver.registerPortal("skynet.derrickhammer.com");

function maybeInjectContentHeader(
  // @ts-ignore
  details: OnBeforeSendHeadersDetailsType
  // @ts-ignore
): BlockingResponse {
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
  }

  return { requestHeaders: headers };
}

function getContentType(identifier: string): string | boolean {
  if (startsWithSkylinkRegExp.test(identifier)) {
    return CONTENT_TYPE_SKYLINK;
  }

  const pathType = `/${identifier.replace("://", "/")}`;

  if (isIPFS(pathType)) {
    return CONTENT_TYPE_IPFS;
  }

  if (isIPNS(pathType)) {
    return CONTENT_TYPE_IPNS;
  }

  return false;
}

// @ts-ignore
function maybeRedirectRequest(
  // @ts-ignore
  details: OnBeforeRequestDetailsType
  // @ts-ignore
): BlockingResponse {
  const originalUrl = new URL(details.url);
  const hostname = normalizeDomain(originalUrl.hostname);

  const port = originalUrl.protocol === "https:" ? "443" : "80";
  const access = originalUrl.protocol === "https:" ? "HTTPS" : "PROXY";

  const tld = hostname.includes(".")
    ? hostname.split(".")[hostname.split(".").length - 1]
    : hostname;

  if (tldList.includes(tld)) {
    return {};
  }

  const resolverDir = runtime.getURL("/");
  const resolverPage = runtime.getURL("/dns.html");

  if (
    details.url.toLowerCase().includes(resolverDir) ||
    details.url.toLowerCase().includes("rpc") ||
    hostname.includes("githubusercontent.com")
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
  const portal = resolver.getPortal();

  if (isIp(target)) {
    script = `function FindProxyForURL(url, host) {
  if ('${portal}' === host){ return 'DIRECT';}
  if (host=== '${hostname}'){
    return '${access} ${target}:${port}';}
  return 'DIRECT';
}`;
  } else {
    script = `function FindProxyForURL(url, host) {
  if ('${portal}' === host){ return 'DIRECT';}
  if (host=== '${hostname}'){
    return '${access} ${portal}:${port}';}
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

async function handleCommunication(data: { action: string; url: string }) {
  if ("resolve" === data.action) {
    if (!data.url || data.url.length === 0) {
      return false;
    }
  } else {
    return;
  }
  const originalUrl = new URL(data.url);
  const hostname = normalizeDomain(originalUrl.hostname);

  let target;
  try {
    target = await resolver.resolve(hostname);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log(e);
    return false;
  }

  if (target) {
    if (Array.isArray(target)) {
      target = target.pop();
    }

    let valid = false;
    let type;

    if (getContentType(target)) {
      valid = true;
      type = "content";
    }

    if (isIp(target)) {
      valid = true;
    }

    if (valid) {
      dnsCache[hostname] = target;
      return target;
    }
  }
}

// @ts-ignore
async function setupExtension(details: OnInstalledDetailsType) {
  downloadTlds();
}

async function downloadTlds() {
  // @ts-ignore
  const fetch = getFetch();

  if (tldList.length) {
    return;
  }

  const list = await fetch(
    "https://raw.githubusercontent.com/LumeWeb/list-of-top-level-domains/master/formats/json/tld-list.json",
    { mode: "no-cors" }
  );

  tldList = JSON.parse(await list.text());
  tldList.push("localhost");
}

function getFetch(): (
  input: RequestInfo,
  init?: RequestInitWithRetry
) => Promise<Response> {
  return fetchBuilder(window.fetch);
}
