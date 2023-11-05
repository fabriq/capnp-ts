import initTrace from "../../debug.ts";

import { ListElementSize } from "../list_element_size.ts";
import { _ListCtor, List } from "./list.ts";
import { getContent } from "./pointer.ts";

const trace = initTrace("capnp:list:composite");
trace("load");

export class Uint64List extends List<bigint> {
  static readonly _capnp: _ListCtor = {
    displayName: "List<Uint64>" as string,
    size: ListElementSize.BYTE_8,
  };

  get(index: number): bigint {
    const c = getContent(this);
    return c.segment.getUint64(c.byteOffset + index * 8);
  }

  set(index: number, value: bigint): void {
    const c = getContent(this);
    c.segment.setUint64(c.byteOffset + index * 8, value);
  }

  toString(): string {
    return `Uint64_${super.toString()}`;
  }
}
