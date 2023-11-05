import initTrace from "../../debug.ts";
import { ListElementSize } from "../list_element_size.ts";
import { _ListCtor, List, ListCtor } from "./list.ts";
import { Struct, StructCtor } from "./struct.ts";
import { copyFrom } from "./pointer.ts";

const trace = initTrace("capnp:list:composite");
trace("load");

export function CompositeList<T extends Struct>(
  CompositeClass: StructCtor<T>,
): ListCtor<T> {
  return class extends List<T> {
    static readonly _capnp: _ListCtor = {
      compositeSize: CompositeClass._capnp.size,
      displayName: `List<${CompositeClass._capnp.displayName}>`,
      size: ListElementSize.COMPOSITE,
    };

    get(index: number): T {
      return new CompositeClass(
        this.segment,
        this.byteOffset,
        this._capnp.depthLimit - 1,
        index,
      );
    }

    set(index: number, value: T): void {
      copyFrom(value, this.get(index));
    }

    toString(): string {
      return `Composite_${super.toString()},cls:${CompositeClass.toString()}`;
    }
  };
}
