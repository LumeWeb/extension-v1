import * as uuid from "uuid";

export const contentPageResponses: { [id: string]: (data: any) => void } = {};

export type RPCMethodResponse = Promise<JSONData | void>;
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

export function validPostMessageEvent(e: MessageEvent) {
  const data = e.data;

  if (!(data.id && uuid.validate(data.id))) {
    return false;
  }
  if (undefined === data.message) {
    return false;
  }

  if (e.source !== window) {
    return false;
  }

  return true;
}
