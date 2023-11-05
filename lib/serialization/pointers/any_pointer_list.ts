import { ListCtor } from "./list.ts";
import { Pointer } from "./pointer.ts";
import { PointerList } from "./pointer_list.ts";

export const AnyPointerList: ListCtor<Pointer> = PointerList(Pointer);
