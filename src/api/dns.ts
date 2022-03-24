import { sendContentRequest } from "../router.js";

export async function resolve(
  input: string,
  params: { [key: string]: any },
  force: boolean = false
): Promise<string | boolean> {
  return sendContentRequest("dns.resolve", { input, params, force }) as Promise<
    string | boolean
  >;
}
