import { assertEquals, assertThrows } from "../../test_utils.ts";
import * as C from "../constants.ts";
import { Message } from "./mod.ts";
import { MultiSegmentArena } from "./arena/mod.ts";
import { getFramedSegments, preallocateSegments } from "./message.ts";
import { Person } from "../../tests/serialization_demo.ts";
import { compareBuffers, readFileBuffer } from "../../test_utils.ts";

const SEGMENTED_PACKED = readFileBuffer("segmented_packed.bin");
const SEGMENTED_UNPACKED = readFileBuffer("segmented.bin");

Deno.test("new Message(ArrayBuffer, false)", async (t) => {
  const message = new Message(SEGMENTED_UNPACKED, false);

  await compareBuffers(
    t,
    message.toArrayBuffer(),
    SEGMENTED_UNPACKED,
    "should read segmented messages",
  );
});

Deno.test("new Message(Buffer, false)", async (t) => {
  const message = new Message(new Uint8Array(SEGMENTED_UNPACKED), false);

  await compareBuffers(
    t,
    message.toArrayBuffer(),
    SEGMENTED_UNPACKED,
    "should read messages from a Buffer",
  );
});

Deno.test("new Message(ArrayBuffer)", async (t) => {
  const message = new Message(SEGMENTED_PACKED);

  await compareBuffers(
    t,
    message.toArrayBuffer(),
    SEGMENTED_UNPACKED,
    "should read packed messages",
  );
});

Deno.test("new Message(Buffer)", async (t) => {
  const message = new Message(new Uint8Array(SEGMENTED_PACKED));

  await compareBuffers(
    t,
    message.toArrayBuffer(),
    SEGMENTED_UNPACKED,
    "should read packed messages from a Buffer",
  );
});

Deno.test("getFramedSegments()", () => {
  assertThrows(
    () =>
      getFramedSegments(
        new Uint8Array([
          0x00,
          0x00,
          0x00,
          0x00, // need at least 4 more bytes for an empty message
        ]).buffer,
      ),
    "should throw when segment counts are missing",
  );

  assertThrows(
    () =>
      getFramedSegments(
        new Uint8Array([
          0x00,
          0x00,
          0x00,
          0x01,
          0x00,
          0x00,
          0x00,
          0x00, // need at least 4 more bytes for the second segment length
        ]).buffer,
      ),
    "should throw when there are not enough segment counts",
  );

  assertThrows(
    () =>
      getFramedSegments(
        new Uint8Array([
          0x00,
          0x00,
          0x00,
          0x00,
          0x10,
          0x00,
          0x00,
          0x00, // should have 16 words in a single segment
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00, // but only get 2
        ]).buffer,
      ),
    "should throw when message is truncated",
  );
});

Deno.test("Message.allocateSegment()", () => {
  const length = C.DEFAULT_BUFFER_SIZE;

  const m1 = new Message();

  m1.allocateSegment(length);
  m1.allocateSegment(length);

  assertThrows(() => m1.getSegment(1));

  // Single segment arenas always grow by slightly more than what was allocated.

  assertEquals(
    m1.getSegment(0).buffer.byteLength,
    length * 2 + C.MIN_SINGLE_SEGMENT_GROWTH,
    "should replace existing segments",
  );

  const m2 = new Message(new MultiSegmentArena());

  m2.allocateSegment(length);
  m2.allocateSegment(length);

  assertEquals(
    m2.getSegment(1).buffer.byteLength,
    length,
    "should allocate new segments",
  );
});

Deno.test("Message.dump()", () => {
  const m1 = new Message(new MultiSegmentArena());

  assertEquals(
    m1.dump(),
    `================
No Segments
================
`,
    "should print an empty message",
  );

  const m2 = new Message();

  m2.allocateSegment(16).allocate(16);

  assertEquals(
    m2.dump(),
    `================
Segment #0
================

=== buffer[16] ===
00000000: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00    ················
`,
    "should print messages",
  );
});

Deno.test("Message.getSegment()", () => {
  const s = new Message(new MultiSegmentArena()).getSegment(0);

  assertEquals(s.byteLength, 8, "should preallocate segment 0");

  assertThrows(
    () => new Message().getSegment(1),
    "should throw when getting out of range segments",
  );

  const m = new Message(new MultiSegmentArena([new ArrayBuffer(2)])); // this is too small to hold the root pointer

  assertThrows(
    () => m.getSegment(0),
    "should throw when segment 0 is too small",
  );
});

Deno.test("Message.onCreatePointer()", () => {
  // This is why you should cache the result of `getList()` calls and use `List.toArray()` liberally...

  const m = new Message();
  const p = m.initRoot(Person);

  assertThrows(
    () => {
      for (let i = 0; i < C.DEFAULT_TRAVERSE_LIMIT + 1; i++) p.getPhones();
    },
    "should throw when exceeding the pointer traversal limit",
  );
});

Deno.test("Message.toArrayBuffer()", () => {
  assertEquals(
    new Message().toArrayBuffer().byteLength,
    16,
    "should allocate segment 0 before converting",
  );
});

Deno.test("Message.toPackedArrayBuffer()", async (t) => {
  const message = new Message(SEGMENTED_UNPACKED, false);

  await compareBuffers(
    t,
    message.toPackedArrayBuffer(),
    SEGMENTED_PACKED,
    "should pack messages properly",
  );
});

Deno.test("preallocateSegments()", () => {
  assertThrows(
    () => {
      const message = new Message(new MultiSegmentArena());

      preallocateSegments(message);
    },
    "should throw when preallocating an empty arena",
  );
});
