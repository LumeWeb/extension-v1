import browser, { runtime, Tabs, Menus } from "@lumeweb/webextension-polyfill";
import dnsCache from "../cache.js";

browser.contextMenus.create({
  enabled: true,
  id: "clear",
  title: "Clear DNS Cache",
});

browser.contextMenus.onClicked.addListener(clickHandler);
browser.tabs.onUpdated.addListener(updateHandler);

async function clickHandler(changeInfo: Menus.OnClickData, tab?: Tabs.Tab) {
  if (changeInfo.menuItemId === "clear") {
    const resolverPage = runtime.getURL("/dns.html");
    const resolverPageUrl = new URL(resolverPage);
    resolverPageUrl.searchParams.append("url", encodeURI(tab!.url!.toString()));
    resolverPageUrl.searchParams.append("force", "1");

    browser.tabs.update(tab!.id, { url: resolverPageUrl.toString() });
  }
}

async function updateHandler(
  tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tab: Tabs.Tab
) {
  if (!(tab && tab.active) || !(tab.url && tab.url.trim().length)) {
    return;
  }

  const url = new URL(tab.url.trim());

  browser.contextMenus.update("clear", { visible: url.host in dnsCache });
}
