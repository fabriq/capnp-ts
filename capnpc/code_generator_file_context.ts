import * as s from "../lib/std/schema.capnp.ts";
import ts from "./typescript.ts";

export class CodeGeneratorFileContext {
  concreteLists: Array<[string, s.Field]>;
  file: s.CodeGeneratorRequest_RequestedFile;
  generatedNodeIds: string[];
  imports: s.CodeGeneratorRequest_RequestedFile_Import[];
  nodes: s.Node[];
  req: s.CodeGeneratorRequest;
  statements: ts.Statement[];
  tsPath: string;

  constructor(
    req: s.CodeGeneratorRequest,
    file: s.CodeGeneratorRequest_RequestedFile,
  ) {
    this.req = req;
    this.file = file;
    this.nodes = req.getNodes().toArray();
    this.concreteLists = [];
    this.generatedNodeIds = [];
    this.statements = [];
    this.tsPath = "";
    this.imports = file.getImports().toArray();
  }

  toString(): string {
    return this.file ? this.file.getFilename() : "CodeGeneratorFileContext()";
  }
}
