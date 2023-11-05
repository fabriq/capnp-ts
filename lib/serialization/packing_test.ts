import {
  getHammingWeight,
  getTagByte,
  getUnpackedByteLength,
  getZeroByteCount,
  pack,
  unpack,
} from "./packing.ts";
import { compareBuffers, readFileBuffer } from "../../test_utils.ts";
import { assertEquals, assertThrows } from "../../test_utils.ts";

type Word = [number, number, number, number, number, number, number, number];
type TagData = { tag: number; weight: number; word: Word }[];

const TAG_DATA: TagData = [
  {
    tag: 0b00000000,
    weight: 0,
    word: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  },
  {
    tag: 0b00110001,
    weight: 3,
    word: [0x09, 0x00, 0x00, 0x00, 0x04, 0x01, 0x00, 0x00],
  },
  {
    tag: 0b00000001,
    weight: 1,
    word: [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  },
  {
    tag: 0b11111111,
    weight: 8,
    word: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
  },
  {
    tag: 0b10000000,
    weight: 1,
    word: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff],
  },
  {
    tag: 0b11111111,
    weight: 8,
    word: [0x0a, 0x15, 0x01, 0xac, 0x6d, 0x9f, 0x03, 0xf2],
  },
  {
    tag: 0b00111111,
    weight: 6,
    word: [0x41, 0x53, 0x53, 0x48, 0x41, 0x54, 0x00, 0x00],
  },
];

// NOTE: for these tests to work `PACK_SPAN_THRESHOLD` must be set to `2`.

const PACKING_DATA = [
  {
    name: "flat",
    packed: readFileBuffer("flat_packed.bin"),
    unpacked: readFileBuffer("flat.bin"),
  },
  {
    name: "span",
    packed: readFileBuffer("span_packed.bin"),
    unpacked: readFileBuffer("span.bin"),
  },
  {
    name: "test",
    packed: readFileBuffer("test_packed.bin"),
    unpacked: readFileBuffer("test.bin"),
  },
  {
    name: "zero",
    packed: readFileBuffer("zero_packed.bin"),
    unpacked: readFileBuffer("zero.bin"),
  },
];

Deno.test("getHammingWeight()", () => {
  TAG_DATA.forEach((d) => assertEquals(getHammingWeight(d.tag), d.weight));
});

Deno.test("getTagByte()", () => {
  TAG_DATA.forEach((d) => assertEquals(getTagByte(...d.word), d.tag));
});

Deno.test("getUnpackedByteLength()", () => {
  PACKING_DATA.forEach(({ name, packed, unpacked }) => {
    assertEquals(getUnpackedByteLength(packed), unpacked.byteLength, name);
  });
});

Deno.test("getZeroByteCount()", () => {
  TAG_DATA.forEach((d) =>
    assertEquals(getZeroByteCount(...d.word), 8 - d.weight)
  );
});

Deno.test("pack()", async (t) => {
  for (const { name, packed, unpacked } of PACKING_DATA) {
    await compareBuffers(t, pack(unpacked), packed, name);
  }

  assertThrows(() => pack(new ArrayBuffer(7)));
});

Deno.test("unpack()", async (t) => {
  for (const { name, packed, unpacked } of PACKING_DATA) {
    await compareBuffers(t, unpack(packed), unpacked, name);
  }
});
