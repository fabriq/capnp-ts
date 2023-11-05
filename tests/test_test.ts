import { assert, assertEquals } from "../test_utils.ts";
import * as capnp from "../mod.ts";
import * as T from "./test.capnp.ts";

const FLOAT_TOLERANCE = 0.000001;

Deno.test("TestEnum", () => {
  assertEquals(T.TestEnum.FOO, 0);
  assertEquals(T.TestEnum.BAR, 1);
  assertEquals(T.TestEnum.BAZ, 2);
  assertEquals(T.TestEnum.QUX, 3);
  assertEquals(T.TestEnum.QUUX, 4);
  assertEquals(T.TestEnum.CORGE, 5);
  assertEquals(T.TestEnum.GRAULT, 6);
  assertEquals(T.TestEnum.GARPLY, 7);
});

Deno.test("TestAllTypes", () => {
  const allTypes = new capnp.Message().initRoot(T.TestAllTypes);

  allTypes.setBoolField(true);
  assertEquals(allTypes.getBoolField(), true);

  allTypes.setInt8Field(-8);
  assertEquals(allTypes.getInt8Field(), -8);

  allTypes.setInt16Field(-10000);
  assertEquals(allTypes.getInt16Field(), -10000);

  allTypes.setInt32Field(-1000000);
  assertEquals(allTypes.getInt32Field(), -1000000);

  allTypes.setInt64Field(BigInt(-0xc54c72d9));
  assertEquals(allTypes.getInt64Field(), BigInt(-0xc54c72d9));

  allTypes.setUInt8Field(8);
  assertEquals(allTypes.getUInt8Field(), 8);

  allTypes.setUInt16Field(65525);
  assertEquals(allTypes.getUInt16Field(), 65525);

  allTypes.setUInt32Field(99999999);
  assertEquals(allTypes.getUInt32Field(), 99999999);

  allTypes.setUInt64Field(BigInt(1099511627775));
  assertEquals(allTypes.getUInt64Field(), BigInt(1099511627775));

  allTypes.setFloat32Field(-9.999);
  assert(Math.abs(allTypes.getFloat32Field() - -9.999) < FLOAT_TOLERANCE);

  allTypes.setFloat64Field(-999999999999.9);
  assert(
    Math.abs(allTypes.getFloat64Field() - -999999999999.9) < FLOAT_TOLERANCE,
  );

  allTypes.setTextField("text");
  assertEquals(allTypes.getTextField(), "text");

  allTypes.initStructField().setInt32Field(-999);
  assertEquals(allTypes.getStructField().getInt32Field(), -999);

  allTypes.setEnumField(T.TestEnum.CORGE);
  assertEquals(allTypes.getEnumField(), T.TestEnum.CORGE);

  allTypes.initVoidList(10);
  assertEquals(allTypes.getVoidList().getLength(), 10);

  allTypes.initBoolList(2).set(1, true);
  assertEquals(allTypes.getBoolList().get(1), true);

  allTypes.initInt8List(3).set(2, -8);
  assertEquals(allTypes.getInt8List().get(2), -8);

  allTypes.initInt16List(3).set(2, -88);
  assertEquals(allTypes.getInt16List().get(2), -88);

  allTypes.initInt32List(3).set(2, -888);
  assertEquals(allTypes.getInt32List().get(2), -888);

  allTypes.initInt64List(3).set(2, BigInt(-8888));
  assertEquals(allTypes.getInt64List().get(2), BigInt(-8888));

  allTypes.initUInt8List(3).set(2, 8);
  assertEquals(allTypes.getUInt8List().get(2), 8);

  allTypes.initUInt16List(3).set(2, 88);
  assertEquals(allTypes.getUInt16List().get(2), 88);

  allTypes.initUInt32List(3).set(2, 888);
  assertEquals(allTypes.getUInt32List().get(2), 888);

  allTypes.initUInt64List(3).set(2, BigInt(8888));
  assertEquals(allTypes.getUInt64List().get(2), BigInt(8888));

  allTypes.initTextList(4).set(2, "hi");
  assertEquals(allTypes.getTextList().get(2), "hi");

  allTypes.initStructList(3).get(1).setUInt32Field(9999);
  assertEquals(allTypes.getStructList().get(1).getUInt32Field(), 9999);

  allTypes.initEnumList(2).set(1, T.TestEnum.FOO);
  assertEquals(allTypes.getEnumList().get(1), T.TestEnum.FOO);
});
