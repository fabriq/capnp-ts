/**
 * A collection of tests regarding protocol upgrade/downgrade behavior.
 */

import { assert, assertEquals } from "../test_utils.ts";
import * as capnp from "../mod.ts";
import { Upgrade as UpgradeV1 } from "./upgrade_v1.capnp.ts";
import { Upgrade as UpgradeV2 } from "./upgrade_v2.capnp.ts";
import { assertDoesNotThrow } from "../test_utils.ts";

Deno.test("schema upgrade with legacy data", () => {
  // This test creates a message with a legacy version of a struct, then attempts to read that same struct data using a
  // newer version of the schema (it has more data fields). This should force the library to shallow copy and reallocate
  // space for the struct so that there's enough space to write to the new fields. Additionally they should default to
  // the equivalent zero value for each of those fields. The test is repeated once for Message's `getRoot` and again for
  // `getSelfReference` in the UpgradeV2 class.

  const m = new capnp.Message();
  const u1 = m.initRoot(UpgradeV1);

  u1.setLegacyId(0x5555);
  u1.setLegacyName("hi");

  const v1Child = u1.initSelfReference();
  v1Child.setLegacyId(0x6666);
  v1Child.setLegacyName("hihi");

  const v1ListChild = u1.initSelfReferences(1).get(0);
  v1ListChild.setLegacyId(0x9999);
  v1ListChild.setLegacyName("hihihi");

  const u2 = m.getRoot(UpgradeV2);

  // t.comment("should null out the self-reference pointers");
  assert(
    capnp.Pointer.isNull(v1Child),
    "should null out the self-reference pointer",
  );
  assert(
    m.getSegment(0).isWordZero(0x18),
    "should null out the self-reference pointer",
  );

  // t.comment("should still be able to access the legacy data from both classes");
  assertEquals(u1.getLegacyId(), 0x5555);
  assertEquals(u1.getLegacyName(), "hi");
  assertEquals(u2.getLegacyId(), 0x5555);
  assertEquals(u2.getLegacyName(), "hi");

  // t.comment("should be able to set new fields");
  assertDoesNotThrow(() => {
    u2.setNewHotnessId(0x7777);
    u2.setNewHotnessName("HI");
  });

  const v2Child = u2.getSelfReference();

  // The child should have been resized now. Make sure the old contents were erased, the old data is still intact and
  // that there's room for the new fields now.

  assertDoesNotThrow(() => {
    v2Child.setNewHotnessId(0x8888);
    v2Child.setNewHotnessName("HIHI");
  }, "should be able to set new child fields");

  assert(
    capnp.Pointer.isNull(v1Child),
    "should not be able to access the old child",
  );
  assertEquals(
    v2Child.getLegacyId(),
    0x6666,
    "should preserve the child's legacy id",
  );
  assertEquals(
    v2Child.getLegacyName(),
    "hihi",
    "should preserve the child's legacy name",
  );

  // Make sure that composite lists get resized too.
  const v2ListChild = u2.getSelfReferences().get(0);

  assertDoesNotThrow(() => {
    v2ListChild.setNewHotnessId(0xaaaa);
    v2ListChild.setNewHotnessName("HIHIHI");
  }, "should be able to set new composite list fields");

  // t.comment("should preserve composite list data");
  assertEquals(
    v2ListChild.getLegacyId(),
    0x9999,
    "should preserve composite list data",
  );
  assertEquals(
    v2ListChild.getLegacyName(),
    "hihihi",
    "should preserve composite list data",
  );
});
