import { assertEquals } from "../test_utils.ts";
import * as capnp from "../mod.ts";
import { BigIntBag } from "./bigintbag.capnp.ts";

Deno.test("64 bit with bigint support", () => {
  const message = new capnp.Message();
  const b = message.initRoot(BigIntBag);
  const unsigned = BigInt("999999");
  const signed = BigInt("-999999");

  assertEquals(b.getSigned(), BigInt(0));
  assertEquals(b.getUnsigned(), BigInt(0));
  assertEquals(b.getDefaultSigned(), BigInt("-987654321987654321"));
  assertEquals(b.getDefaultUnsigned(), BigInt("987654321987654321"));

  b.setSigned(signed);
  b.setUnsigned(unsigned);
  b.setDefaultSigned(signed);
  b.setDefaultUnsigned(unsigned);

  assertEquals(b.getUnsigned(), unsigned);
  assertEquals(b.getSigned(), signed);
  assertEquals(b.getDefaultSigned(), signed);
  assertEquals(b.getDefaultUnsigned(), unsigned);
});
