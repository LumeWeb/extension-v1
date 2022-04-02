import {
  contentPageResponses,
  JSONData,
  validPostMessageEvent,
} from "./shared.js";
import * as uuid from "uuid";

export function attachPostMessageWebPageListener() {
  window.addEventListener("message", postMessageWebPageListener);
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

export function processContentResponse(id: string, data: JSONData) {
  if (!contentPageResponses.hasOwnProperty(id)) {
    return;
  }

  contentPageResponses[id](data);
  delete contentPageResponses[id];
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

async function listenForContentResponse(id: string): Promise<JSONData | void> {
  return new Promise((resolve) => {
    contentPageResponses[id] = resolve;
  });
}
