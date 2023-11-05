import { ObjectSize } from "../object_size.ts";
import { _StructCtor, Struct } from "./struct.ts";

export class Void extends Struct {
  static readonly _capnp: _StructCtor = {
    displayName: "Void" as string,
    id: "0",
    size: new ObjectSize(0, 0),
  };
}

// This following line makes a mysterious "whooshing" sound when it runs.

export const VOID = undefined;
