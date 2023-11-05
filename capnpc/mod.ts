import { toArrayBuffer } from "https://deno.land/std@0.205.0/streams/mod.ts";
import * as capnp from "../mod.ts";
import * as s from "../lib/std/schema.capnp.ts";
import initTrace from "../lib/debug.ts";
import { loadRequest, writeTsFiles } from "./compiler.ts";

const trace = initTrace("capnpc");
trace("load");

export async function main(): Promise<void> {
  try {
    await run();
  } catch (err) {
    console.error(err);
    Deno.exit(1);
  }
}

export async function run(): Promise<void> {
  // Read the input data as Uint8Array
  const chunks = await toArrayBuffer(Deno.stdin.readable);
  trace("reading data chunk (%d bytes)", chunks.byteLength);

  const reqBuffer = new Uint8Array(chunks);

  trace("reqBuffer (length: %d)", reqBuffer.length, reqBuffer);

  const message = new capnp.Message(reqBuffer, false);

  trace("message: %s", message.dump());

  const req = message.getRoot(s.CodeGeneratorRequest);

  trace("%s", req);

  const ctx = loadRequest(req);

  writeTsFiles(ctx);
}
