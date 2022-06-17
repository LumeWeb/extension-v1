import { createRequire } from "module";
import WSReconnect from "./ws.js";
import { resolver } from "./common.js";
import { JSONPortalList } from "@lumeweb/resolver";

// tslint:disable-next-line:no-var-requires
const { SkynetClient } = require("@lumeweb/skynet-js");
// tslint:disable-next-line:no-var-requires
const { hashDataKey } = require("@lumeweb/skynet-js/dist/mjs/crypto.js");
// tslint:disable-next-line:no-var-requires
const { toHexString } = require("@lumeweb/skynet-js/dist/mjs/utils/string.js");

const portalListName = "community-portals";
const portalListOwner =
  "86c7421160eb5cb4a39495fc3e3ae25a60b330fff717e06aab978ad353722014";

/*
 TODO: Use kernel code to use many different portals and not hard code a portal
 */
let portalConnection: WSReconnect;
const portalClient = new SkynetClient("https://web3portal.com");

async function fetchPortals() {
  const portals: JSONPortalList = (
    await portalClient.dbV2.getJSON(portalListOwner, portalListName)
  ).data as JSONPortalList;

  resolver.registerPortalsFromJson(portals);
  resolver.connect();
}

export function setupPortalListSubscription() {
  portalConnection = new WSReconnect(
    "wss://web3portal.com/skynet/registry/subscription"
  );
  portalConnection.on("connect", () => {
    portalConnection.send(
      JSON.stringify({
        action: "subscribe",
        pubkey: `ed25519:${portalListOwner}`,
        datakey: toHexString(hashDataKey(portalListName)),
      })
    );
  });
  portalConnection.on("message", fetchPortals);
  portalConnection.start();
  fetchPortals();
}
