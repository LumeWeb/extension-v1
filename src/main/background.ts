import resolver from "@lumeweb/resolver";
import tldEnum from "@lumeweb/tld-enum";
import "whatwg-fetch";
import "../hooks/menu.js";
import "../hooks/modify_headers.js";
import "../hooks/redirect_proxy.js";
import "../hooks/api.js";

tldEnum.list.push("localhost");
resolver.registerPortal(
  "skynet.derrickhammer.com",
  ["dns", "registry", "download"],
  "0odMB49AQllK7aSqJiDrv9OUCW-tQGiecFVROwdBTUY.v3KCBG8oguJgfT050iMA42QRNkiqlqslSs0Xb2-3iU8"
);
