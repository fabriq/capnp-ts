import { dirname } from "./path_utils.ts";
import * as s from "../lib/std/schema.capnp.ts";
import initTrace from "../lib/debug.ts";
import ts from "./typescript.ts";

import { CodeGeneratorContext } from "./code_generator_context.ts";
import { CodeGeneratorFileContext } from "./code_generator_file_context.ts";
import { SOURCE_COMMENT } from "./constants.ts";
import { loadRequestedFile, lookupNode } from "./file.ts";
import {
  generateCapnpImport,
  generateConcreteListInitializer,
  generateFileId,
  generateNestedImports,
  generateNode,
} from "./generators.ts";

const trace = initTrace("capnpc:compile");
trace("load");

export function compile(ctx: CodeGeneratorFileContext): string {
  generateCapnpImport(ctx);

  generateNestedImports(ctx);

  generateFileId(ctx);

  lookupNode(ctx, ctx.file)
    .getNestedNodes()
    .map((n) => lookupNode(ctx, n))
    .forEach((n) => generateNode(ctx, n));

  ctx.concreteLists.forEach(([fullClassName, field]) =>
    generateConcreteListInitializer(ctx, fullClassName, field)
  );

  const sourceFile = ts.createSourceFile(
    ctx.tsPath,
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const printer = ts.createPrinter();
  const source =
    ctx.statements.map((s) =>
      printer.printNode(ts.EmitHint.Unspecified, s, sourceFile)
    ).join("\n") + "\n";

  return SOURCE_COMMENT + source;
}

export function loadRequest(req: s.CodeGeneratorRequest): CodeGeneratorContext {
  trace("loadRequest(%s)", req);

  const ctx = new CodeGeneratorContext();

  ctx.files = req.getRequestedFiles().map((file) =>
    loadRequestedFile(req, file)
  );

  return ctx;
}

export function printSourceFiles(ctx: CodeGeneratorContext): string[] {
  trace("printSourceFiles()");

  return ctx.files.map(compile);
}

export function writeTsFiles(ctx: CodeGeneratorContext): void {
  trace("writeTsFiles()");

  ctx.files.forEach((f) => {
    trace("writing %s", f.tsPath);

    Deno.mkdirSync(dirname(f.tsPath), { recursive: true });
    Deno.writeTextFileSync(f.tsPath, compile(f));
  });
}
