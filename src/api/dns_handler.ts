import { JSONData, RPCMethodResponse } from "../router/shared.js";
import { registerMethod } from "../router/content.js";
import { isDomain, isIp, normalizeDomain } from "@lumeweb/resolver";
import { getContentType } from "../utils.js";
import dnsCache from "../cache.js";
import { resolver } from "../common.js";

// @ts-ignore
registerMethod("dns.resolve", handler);

type HandlerData = {
  input: string;
  params: { [key: string]: JSONData };
  force?: boolean;
};

async function handler(request: HandlerData): RPCMethodResponse {
  if (!request.input) {
    return;
  }

  let response;

  const input = normalizeDomain(request.input);

  try {
    response = await resolver.resolve(input, request.params, request.force);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log(e);
    return false;
  }

  if (Array.isArray(response)) {
    response = response.pop();
  }

  if (typeof response !== "string") {
    return false;
  }

  let valid = false;

  if (getContentType(response)) {
    valid = true;
  }

  if (isIp(response) || isDomain(response)) {
    valid = true;
    response = normalizeDomain(response);
  }

  if (valid) {
    dnsCache[input] = response;
    return response;
  }

  return false;
}
