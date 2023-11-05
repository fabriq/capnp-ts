/**
 * Why would anyone **SANE** ever use this!?
 */

import { ListCtor } from "./list.ts";
import { PointerList } from "./pointer_list.ts";
import { Void } from "./void.ts";

export const VoidList: ListCtor<Void> = PointerList(Void);
