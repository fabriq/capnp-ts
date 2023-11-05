import * as capnp from "../mod.ts";
import { Baz } from "./import_bar.capnp.ts";
import { Foo } from "./import_foo.capnp.ts";
import { assertDoesNotThrow } from "../test_utils.ts";

Deno.test("schema imports", () => {
  assertDoesNotThrow(() => {
    new capnp.Message().initRoot(Baz).setBar("bar");
    new capnp.Message().initRoot(Foo).initBaz().setBar("bar");
  });
});
