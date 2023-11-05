import { assert, assertEquals, assertThrows } from "../../../test_utils.ts";
import { Message, Pointer } from "../../../mod.ts";
import * as C from "../../constants.ts";

Deno.test("new Pointer()", () => {
  const m = new Message();
  const s = m.getSegment(0);

  const initialTraversalLimit = m._capnp.traversalLimit;

  assertThrows(
    () => {
      new Pointer(s, 0, 0);
    },
    "should throw when exceeding the depth limit",
  );

  const p = new Pointer(s, 4);

  assertEquals(
    m._capnp.traversalLimit,
    initialTraversalLimit - 8,
    "should track pointer allocation in the message",
  );

  assertThrows(
    () => {
      new Pointer(s, -1);
    },
    "should throw with a negative offset",
  );

  assertThrows(
    () => {
      new Pointer(s, 100);
    },
    "should throw when exceeding segment bounds",
  );

  assertEquals(s.byteLength, 8);
  assert(
    new Pointer(s, 8),
    "should allow creating pointers at the end of the segment",
  );

  assertEquals(p.segment, s);
  assertEquals(p.byteOffset, 4);
  assertEquals(p._capnp.depthLimit, C.MAX_DEPTH);
});

Deno.test("Pointer.adopt(), Pointer.disown()", () => {
  const m = new Message();
  const s = m.getSegment(0);
  const p = new Pointer(s, 0);

  // Empty bit list.
  s.setUint32(0, 0x00000001);
  s.setUint32(4, 0x00000001);

  const o = Pointer.disown(p);

  assertEquals(s.getUint32(0), 0x00000000);
  assertEquals(s.getUint32(4), 0x00000000);

  Pointer.adopt(o, p);

  assertEquals(s.getUint32(0), 0x00000001);
  assertEquals(s.getUint32(4), 0x00000001);
});

Deno.test("Pointer.dump()", () => {
  const m = new Message();
  const s = m.getSegment(0);
  const p = new Pointer(s, 0);

  s.setUint32(0, 0x00000001);
  s.setUint32(4, 0x00000002);

  assertEquals(Pointer.dump(p), "[01 00 00 00 02 00 00 00]");
});

Deno.test("Pointer.toString()", () => {
  const m = new Message();
  const s = m.getSegment(0);
  const p = new Pointer(s, 0);

  s.setUint32(0, 0x00000001);
  s.setUint32(4, 0x00000002);

  assertEquals(p.toString(), "->0@0x00000000[01 00 00 00 02 00 00 00]");
});
