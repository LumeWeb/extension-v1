import { resolver } from "../common.js";
import tldEnum from "@lumeweb/tld-enum";
import "whatwg-fetch";
import "../hooks/menu.js";
import "../hooks/modify_headers.js";
import "../hooks/redirect_proxy.js";
import "../hooks/api.js";
import { setupPortalListSubscription } from "../portal.js";

tldEnum.list.push("localhost");
resolver.connect();
setupPortalListSubscription();
