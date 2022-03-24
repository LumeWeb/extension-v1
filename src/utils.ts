import { startsWithSkylinkRegExp } from "@lumeweb/resolver";
import { ipfsPath as isIPFS, ipnsPath as isIPNS } from "is-ipfs";
import {
  CONTENT_TYPE_IPFS,
  CONTENT_TYPE_IPNS,
  CONTENT_TYPE_SKYLINK,
} from "./constants";
import fetchBuilder, { RequestInitWithRetry } from "fetch-retry";

export function getContentType(identifier: string): string | boolean {
  if (startsWithSkylinkRegExp.test(identifier)) {
    return CONTENT_TYPE_SKYLINK;
  }

  const pathType = `/${identifier.replace("://", "/")}`;

  if (isIPFS(pathType)) {
    return CONTENT_TYPE_IPFS;
  }

  if (isIPNS(pathType)) {
    return CONTENT_TYPE_IPNS;
  }

  return false;
}

function getFetch(): (
  input: RequestInfo,
  init?: RequestInitWithRetry
) => Promise<Response> {
  return fetchBuilder(window.fetch);
}
