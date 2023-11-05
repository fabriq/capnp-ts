import { assertEquals, assertInstanceOf } from "../test_utils.ts";
import * as capnp from "../mod.ts";
import { CodeGeneratorRequest } from "../lib/std/schema.capnp.ts";
import { compareBuffers, readFileBuffer } from "../test_utils.ts";

const SCHEMA_MESSAGE = readFileBuffer("schema.bin");

const SCHEMA_FILE_ID = BigInt("0xa93fc509624c72d9");

Deno.test("schema roundtrip", async (t) => {
  const message = new capnp.Message(SCHEMA_MESSAGE, false);
  const req = message.getRoot(CodeGeneratorRequest);

  assertInstanceOf(req, CodeGeneratorRequest);

  const capnpVersion = req.getCapnpVersion();

  assertEquals(capnpVersion.getMajor(), 0);
  assertEquals(capnpVersion.getMinor(), 6);
  assertEquals(capnpVersion.getMicro(), 0);

  const requestedFiles = req.getRequestedFiles();

  assertEquals(requestedFiles.getLength(), 1);

  const requestedFile = requestedFiles.get(0);
  const filename = requestedFile.getFilename();

  // FIXME: Fix this, it should be lib/std/schema.capnp
  assertEquals(filename, "packages/capnp-ts/src/std/schema.capnp");

  const requestedFileId = requestedFile.getId();

  assertEquals(requestedFileId, SCHEMA_FILE_ID);

  const out = message.toArrayBuffer();

  await compareBuffers(t, out, SCHEMA_MESSAGE);
});
