import browser from "@lumeweb/webextension-polyfill";
import * as uuid from "uuid";
const registeredRoutes: {
  [method: string]: RPCMethod;
} = {};

const contentPageResponses: { [id: string]: (data: any) => void } = {};

export type RPCMethodResponse = Promise<JSONData | void>;

type RPCMethod = (request: JSONData) => Promise<RPCMethodResponse>;

type JSONObject = { [key: string]: JSONData };

export type JSONData =
  | string[]
  | number[]
  | string
  | number
  | boolean
  | JSONObject;

export type RPCRequest = {
  method: string;
  data: JSONData;
};

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

async function listenForContentResponse(id: string): Promise<JSONData | void> {
  return new Promise((resolve) => {
    contentPageResponses[id] = resolve;
  });
}

export async function sendContentRequest(
  method: string,
  data: JSONData
): Promise<JSONData | void> {
  const request = {
    id: uuid.v4(),
    message: {
      method,
      data,
    },
  };

  window.postMessage(request);
  return listenForContentResponse(request.id);
}

export function processContentResponse(id: string, data: JSONData) {
  if (!contentPageResponses.hasOwnProperty(id)) {
    return;
  }

  contentPageResponses[id](data);
  delete contentPageResponses[id];
}

export function registerMethod(method: string, func: RPCMethod): void {
  registeredRoutes[method] = func;
}

export function attachPostMessageContentListener() {
  window.addEventListener("message", postMessageContentScriptListener);
}

export function attachPostMessageWebPageListener() {
  window.addEventListener("message", postMessageWebPageListener);
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
  if (resp) {
    window.postMessage({
      id: data.id,
      message: resp,
      reply: true,
    });
  }
}

function postMessageWebPageListener(e: MessageEvent) {
  if (!validPostMessageEvent(e)) {
    return;
  }

  const data = e.data;

  if (!data.reply) {
    return;
  }

  processContentResponse(data.id, data.message);
}

function validPostMessageEvent(e: MessageEvent) {
  const data = e.data;

  if (!(data.id && uuid.validate(data.id))) {
    return false;
  }
  if (!data.message) {
    return false;
  }

  if (e.source !== window) {
    return false;
  }

  return true;
}
