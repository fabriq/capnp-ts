import { check, CheckOptions, Property } from "npm:testcheck@1.0.0-rc.2";
import {
  assert,
  assertEquals,
  fail,
} from "https://deno.land/std@0.205.0/assert/mod.ts";
import {
  fromFileUrl,
  join,
  resolve,
} from "https://deno.land/std@0.205.0/path/mod.ts";

import { dumpBuffer, format, pad } from "./lib/utils.ts";
import initTrace from "./lib/debug.ts";

export * from "https://deno.land/std@0.205.0/assert/mod.ts";

const trace = initTrace("capnp-ts-test:util");

const testdataDir = resolve(
  fromFileUrl(import.meta.url),
  "..",
  "testdata",
);

function diffHex(found: ArrayBuffer, wanted: ArrayBuffer): string {
  const a = new Uint8Array(found);
  const b = new Uint8Array(wanted);

  for (let i = 0; i < a.byteLength && i < b.byteLength; i++) {
    if (a[i] !== b[i]) {
      trace(dumpBuffer(found));
      trace(dumpBuffer(wanted));
      return format(
        "addr:%a,found:%s,wanted:%s",
        i,
        pad(a[i].toString(16), 2),
        pad(b[i].toString(16), 2),
      );
    }
  }

  if (a.byteLength > b.byteLength) {
    return format(
      "addr:%a,found:%s,wanted:EOF",
      b.byteLength,
      pad(a[b.byteLength].toString(16), 2),
    );
  } else if (b.byteLength > a.byteLength) {
    return format(
      "addr:%a,found:EOF,wanted:%s",
      a.byteLength,
      pad(b[a.byteLength].toString(16), 2),
    );
  }

  return "equal";
}

export async function compareBuffers(
  t: Deno.TestContext,
  found: ArrayBuffer,
  wanted: ArrayBuffer,
  name = "should have the same buffer contents",
): Promise<void> {
  await t.step(name, () => {
    assertEquals(
      found.byteLength,
      wanted.byteLength,
      `should have the same byte length (diff=${diffHex(found, wanted)}).`,
    );

    // End the comparison prematurely if the buffer lengths differ.

    if (found.byteLength !== wanted.byteLength) {
      return;
    }

    const a = new Uint8Array(found);
    const b = new Uint8Array(wanted);

    for (let i = 0; i < a.byteLength; i++) {
      if (a[i] !== b[i]) {
        fail(`bytes are not equal (${diffHex(found, wanted)})`);

        // Don't check any of the other bytes or else we might flood with failures.

        return;
      }
    }
  });
}

export function readFileBuffer(filename: string): ArrayBuffer {
  const absoluteFilePath = join(testdataDir, filename);
  const buffer = Deno.readFileSync(absoluteFilePath);
  return buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export function readTextFile(filename: string): string {
  const absoluteFilePath = join(testdataDir, filename);
  return Deno.readTextFileSync(absoluteFilePath);
}

export async function runTestCheck<TArgs>(
  t: Deno.TestContext,
  property: Property<TArgs>,
  options?: CheckOptions,
  name = "should satisfy property check",
): Promise<void> {
  await t.step(name, () => {
    const out = check(property, options);

    assertEquals(
      out.result,
      true,
      `property check failed ${JSON.stringify(out)}`,
    );
  });
}

export function assertDoesNotThrow(fn: () => unknown, message?: string) {
  // TODO: Better assertion
  try {
    fn();
  } catch (_error) {
    assert(false, message ?? "expected to not throw");
  }
}
