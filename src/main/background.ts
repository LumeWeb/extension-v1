import { resolver } from "../common.js";
import tldEnum from "@lumeweb/tld-enum";
import "whatwg-fetch";
import "../hooks/menu.js";
import "../hooks/modify_headers.js";
import "../hooks/redirect_proxy.js";
import "../hooks/api.js";

tldEnum.list.push("localhost");
(async () => {
  resolver.registerPortalsFromJson({
    "fileportal.org": {
      supports: ["dns", "registry"],
      pubkey:
        "Omkq3gTKAil75U-p1CeyEoq-pQWFKYH5Z31x9GiQvOM.OLWIuw8_h4o03HtNnc7x_egpxW5Q5LaBK9u-8mI7QNg",
    },
    "direct.fileportal.org": {
      supports: ["web3link"],
    },
  });

  resolver.connect();
})();
