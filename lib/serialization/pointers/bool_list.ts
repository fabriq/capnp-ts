import initTrace from "../../debug.ts";

import { ListElementSize } from "../list_element_size.ts";
import { _ListCtor, List } from "./list.ts";
import { getContent } from "./pointer.ts";

const trace = initTrace("capnp:list:composite");
trace("load");

export class BoolList extends List<boolean> {
  static readonly _capnp: _ListCtor = {
    displayName: "List<boolean>" as string,
    size: ListElementSize.BIT,
  };

  get(index: number): boolean {
    const bitMask = 1 << index % 8;
    const byteOffset = index >>> 3;
    const c = getContent(this);
    const v = c.segment.getUint8(c.byteOffset + byteOffset);

    return (v & bitMask) !== 0;
  }

  set(index: number, value: boolean): void {
    const bitMask = 1 << index % 8;
    const c = getContent(this);
    const byteOffset = c.byteOffset + (index >>> 3);
    const v = c.segment.getUint8(byteOffset);

    c.segment.setUint8(byteOffset, value ? v | bitMask : v & ~bitMask);
  }

  toString(): string {
    return `Bool_${super.toString()}`;
  }
}
