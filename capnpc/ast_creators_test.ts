import { assertEquals, fail } from "../test_utils.ts";
import ts from "./typescript.ts";
import { readFileBuffer } from "../test_utils.ts";
import * as capnp from "../mod.ts";
import * as Schema from "../lib/std/schema.capnp.ts";
import { createValueExpression } from "./ast_creators.ts";

const TEST_REQUEST = readFileBuffer("test_request.bin");

Deno.test("createValueExpression", () => {
  const m = new capnp.Message(TEST_REQUEST, false);

  // Find a node with a default pointer value to play around with.
  const node = m
    .getRoot(Schema.CodeGeneratorRequest)
    .getNodes()
    .find((n) => n.getDisplayName().split(":")[1] === "TestDefaults");

  if (node === undefined) {
    fail();
  }

  const value = node.getStruct().getFields().get(29).getSlot()
    .getDefaultValue();
  const printer = ts.createPrinter();
  const sourceFile = ts.createSourceFile("", "", ts.ScriptTarget.ES2017);

  assertEquals(
    printer.printNode(
      ts.EmitHint.Expression,
      createValueExpression(value),
      sourceFile,
    ),
    "capnp.readRawPointer(new Uint8Array([0x10, 0x07, 0x11, 0x01, 0x1e, 0x11, 0x09, 0x32, 0x11, 0x09, 0x32, " +
      "0x11, 0x09, 0x2a, 0x1f, 0x70, 0x6c, 0x75, 0x67, 0x68, 0x1f, 0x78, 0x79, 0x7a, 0x7a, 0x79, 0x0f, 0x74, 0x68, " +
      "0x75, 0x64]).buffer)",
  );
});
