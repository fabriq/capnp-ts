import { Data } from "./data.ts";
import { ListCtor } from "./list.ts";
import { PointerList } from "./pointer_list.ts";

export const DataList: ListCtor<Data> = PointerList(Data);
