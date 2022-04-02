// @ts-ignore
import browser from "@lumeweb/webextension-polyfill";
import * as uuid from "uuid";
import {
  contentPageResponses,
  JSONData,
  RPCMethodResponse,
  RPCRequest,
  validPostMessageEvent,
} from "./shared.js";

type RPCMethod = (request: JSONData) => Promise<RPCMethodResponse>;

const registeredRoutes: {
  [method: string]: RPCMethod;
} = {};

/*let extensionId: string | null = null;

export function extractExtensionId(): string {
  if (null !== extensionId) {
    return extensionId;
  }

  const url = new URL(
    document.getElementById("lumeweb")?.getAttribute("src") as string
  );
  extensionId = url.hostname;

  return extensionId;
}*/

export async function receiveRequest(
  request: RPCRequest
): Promise<JSONData | void> {
  if (!isValidMethod(request.method)) {
    return;
  }

  const func = registeredRoutes[request.method];

  return func(request.data);
}

function isValidMethod(method: string) {
  return method && 0 < method.length && registeredRoutes.hasOwnProperty(method);
}

export async function sendRequest(
  method: string,
  data: JSONData
): Promise<JSONData | void> {
  const request: RPCRequest = {
    method,
    data,
  };

  return browser.runtime.sendMessage(browser.runtime.id, request);
}

export function registerMethod(method: string, func: RPCMethod): void {
  registeredRoutes[method] = func;
}

export function attachPostMessageContentListener() {
  window.addEventListener("message", postMessageContentScriptListener);
}

async function postMessageContentScriptListener(e: MessageEvent) {
  if (!validPostMessageEvent(e)) {
    return;
  }

  const data = e.data;

  if (data.reply) {
    return;
  }

  const rpcMessage = data.message as RPCRequest;

  const resp = await sendRequest(rpcMessage.method, rpcMessage.data);
  if (resp !== undefined) {
    window.postMessage({
      id: data.id,
      message: resp,
      reply: true,
    });
  }
}
