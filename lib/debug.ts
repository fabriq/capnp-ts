import { format } from "./utils.ts";

export type TraceFn = (message: string, ...args: any[]) => void;

interface NamespaceSelection {
  keeps: RegExp[];
  skips: RegExp[];
}

function loadNamespaceSelection(): NamespaceSelection {
  const keeps: RegExp[] = [];
  const skips: RegExp[] = [];

  const input = Deno.permissions.querySync({ name: "env", variable: "DEBUG" })
      .state === "granted"
    ? Deno.env.get("DEBUG")
    : undefined;

  if (input) {
    const selectors = input.split(/[\s,]+/);
    for (let selector of selectors) {
      let array = keeps;
      if (selector[0] === "-") {
        selector = selector.slice(1);
        array = skips;
      }
      array.push(new RegExp("^" + selector.replace(/\*/g, ".*?") + "$"));
    }
  }

  return { keeps, skips };
}

function isNamespaceSelected(
  selection: NamespaceSelection,
  namespace: string,
): boolean {
  for (const skip of selection.skips) {
    if (skip.test(namespace)) {
      return false;
    }
  }

  for (const keep of selection.keeps) {
    if (keep.test(namespace)) {
      return true;
    }
  }

  return false;
}

export default function initTrace(namespace: string): TraceFn {
  const selection = loadNamespaceSelection();
  if (isNamespaceSelected(selection, namespace)) {
    return function trace(message: string, ...args: any[]) {
      return console.error(`${namespace}: ${format(message, ...args)}`);
    };
  }
  return function trace() {};
}
