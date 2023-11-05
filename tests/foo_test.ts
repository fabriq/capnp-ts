import * as capnp from "../mod.ts";

import { Foo as OldFoo } from "./foo.capnp.ts";
import { Foo as NewFoo } from "./foo_new.capnp.ts";

Deno.test("foo regression", () => {
  const oldMessage = new capnp.Message();
  const oldFoo = oldMessage.initRoot(OldFoo);

  oldFoo.setBar("bar");

  const packed = new Uint8Array(oldMessage.toPackedArrayBuffer());

  const newMessage = new capnp.Message(packed);
  newMessage.getRoot(NewFoo);

  // t.pass("should not 💩 the 🛏");
});

Deno.test("foo regression with composite initializer", () => {
  const oldMessage = new capnp.Message();
  oldMessage.initRoot(OldFoo);

  const packed = new Uint8Array(oldMessage.toPackedArrayBuffer());

  const newMessage = new capnp.Message(packed);
  newMessage.getRoot(NewFoo);
});
