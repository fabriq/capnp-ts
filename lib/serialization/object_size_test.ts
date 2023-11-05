import { assertEquals } from "../../test_utils.ts";
import { ObjectSize } from "../../mod.ts";

Deno.test("ObjectSize.toString()", () => {
  assertEquals(new ObjectSize(8, 1).toString(), "ObjectSize_dw:1,pc:1");
});
