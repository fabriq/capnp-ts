import { Interface } from "./interface.ts";
import { ListCtor } from "./list.ts";
import { PointerList } from "./pointer_list.ts";

export const InterfaceList: ListCtor<Interface> = PointerList(Interface);
