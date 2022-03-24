import browser from "@lumeweb/webextension-polyfill";

window.addEventListener("lumeWebLoaded", async () => {
  const params = new URL(decodeURI(window.location.href)).searchParams;
  const targetUrl = new URL(params.get("url") as string);
  const force = params.get("force") === "1" ?? false;
  // eslint-disable-next-line no-undef
  // @ts-ignore
  const response = await window.lume.dns.resolve(targetUrl.hostname, {}, force);

  const location = response
    ? targetUrl?.toString()
    : browser.runtime.getURL("/error.html");

  const el = document.getElementById("success");
  el?.classList.add("animate__animated");
  el?.classList.add("animate__bounceIn");

  setTimeout(() => {
    window.location.href = location as string;
  }, 1000);
});
