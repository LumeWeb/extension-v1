import { resolver } from "../common.js";
import tldEnum from "@lumeweb/tld-enum";
import "whatwg-fetch";
import "../hooks/menu.js";
import "../hooks/modify_headers.js";
import "../hooks/redirect_proxy.js";
import "../hooks/api.js";
import { JSONPortalList } from "@lumeweb/resolver";

tldEnum.list.push("localhost");
(async () => {
  const portals: JSONPortalList = await (
    await fetch(
      "https://fileportal.org/AAAX9dhosKlz909-949eOExfsJMLijz_VEOjGVhdwi8lKQ"
    )
  ).json();
  resolver.registerPortalsFromJson(portals);

  resolver.connect();
})();
