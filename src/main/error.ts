import browser from "@lumeweb/webextension-polyfill";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URL(decodeURI(window.location.href)).searchParams;
  const targetUrl = params.get("url");
  const forceDnsUrl = new URL(browser.runtime.getURL("/dns.html"));
  forceDnsUrl.searchParams.set("url", targetUrl as string);
  forceDnsUrl.searchParams.set("force", "1");

  document
    .getElementById("back")
    ?.addEventListener("click", () => window.history.go(-1));
  document
    .getElementById("force_refresh")
    ?.addEventListener("click", () => window.location.replace(forceDnsUrl));
});
