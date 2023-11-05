import initTrace from "../../debug.ts";
import { ListElementSize } from "../list_element_size.ts";
import { _ListCtor, List } from "./list.ts";
import { getContent } from "./pointer.ts";

const trace = initTrace("capnp:list:composite");
trace("load");

export class Float32List extends List<number> {
  static readonly _capnp: _ListCtor = {
    displayName: "List<Float32>" as string,
    size: ListElementSize.BYTE_4,
  };

  get(index: number): number {
    const c = getContent(this);

    return c.segment.getFloat32(c.byteOffset + index * 4);
  }

  set(index: number, value: number): void {
    const c = getContent(this);

    c.segment.setFloat32(c.byteOffset + index * 4, value);
  }

  toString(): string {
    return `Float32_${super.toString()}`;
  }
}
