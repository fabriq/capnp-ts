```
      ██████╗ █████╗ ██████╗ ██╗███╗   ██╗
     ██╔════╝██╔══██╗██╔══██╗██║████╗  ██║
     ██║     ███████║██████╔╝╚═╝██╔██╗ ██║
     ██║     ██╔══██║██╔═══╝    ██║╚██╗██║
     ╚██████╗██║  ██║██║        ██║ ╚████║
      ╚═════╝╚═╝  ╚═╝╚═╝        ╚═╝  ╚═══╝
 ██████╗ ██████╗  ██████╗ ████████╗ ██████╗
 ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗
 ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║
 ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║
 ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝

                         infinitely
                           faster!

-- TypeScript Edition, for Deno
```

This is a fork of jdiaz5513' capnp-ts for Deno.

## Project Status

The project is stable enough to be used for serialization and code generation
(although they may be missing features). It will not include the RPC protocol,
although contributions are welcome.

The goal of the fork is to provide a seamless experience for Deno users, and to
eventually support Node.js and Web browsers as well from the same codebase.

## Installation

The serialization library can be imported from `deno.land/x`:

```ts
import * as capnp from "https://deno.land/x/capnp_ts@VERSION/mod.ts";
```

You might need the schema compiler as well (global installation recommended):

```shell
deno install https://deno.land/x/capnp_ts@VERSION/capnpc-ts
```

The schema compiler is a
[Cap'n Proto plugin](https://capnproto.org/otherlang.html#how-to-write-compiler-plugins)
and requires the `capnpc` binary in order to do anything useful; follow the
[Cap'n Proto installation instructions](https://capnproto.org/install.html) to
install it on your system.

## Implementation Notes

> These notes are provided for people who are familiar with the C++
> implementation, or implementations for other languages. Those who are new to
> Cap'n Proto may skip this section.

This implementation differs in a big way from the C++ reference implementation:
there are no separate Builder or Reader classes. All pointers are essentially
treated as Builders.

This has some major benefits for simplicity's sake, but there is a bigger reason
for this decision (which was not made lightly). Everything is backed by
`ArrayBuffer`s and there is no practical way to prevent mutating the data, even
in a dedicated Reader class. The result of such mutations could be disastrous,
and more importantly there is no way to reap much performance from making things
read-only.

## Usage

### Compiling Schema Files

Run the following to compile a schema file into TypeScript source code:

```shell
capnpc -o ts path/to/myschema.capnp
```

Running that command will create a file named `path/to/myschema.capnp.ts`.

> These instructions assume `capnpc-ts` was installed globally and is available
> from `$PATH`. If not, change the `-o` option to something like
> `-o custom/path/to/capnpc-ts` so it points to your local `capnpc-ts` install.

To write the compiled source to a different directory:

```shell
capnpc -o ts:/tmp/some-dir/ path/to/myschema.capnp
```

That will generate a file at `/tmp/some-dir/path/to/myschema.capnp.ts`.

### Reading Messages

To read a message, do something like the following:

```typescript
import * as capnp from "https://deno.land/x/capnp_ts@VERSION/mod.ts";

import { MyStruct } from "./myschema.capnp.ts";

export function loadMessage(buffer: ArrayBuffer): MyStruct {
  const message = new capnp.Message(buffer);

  return message.getRoot(MyStruct);
}
```

### Usage in a Web Browser

One can use a bundle or transpiler in order to get the library and generated
code to run in Web browser.

**Note that this library has not yet been tested in a web browser.**

## Testing

In order to be able to run the tests, you will need to generate TypeScript code
first. You will need to have `capnpc` and `make` installed, then run
`make build`.

Then, you can run `deno test`. You also run `deno bench` for a couple of
benchmarks.

## Debugging

Some debug trace functionality is provided by a utility module similar to the
library [debug](https://www.npmjs.com/package/debug) on npm.

To see trace messages in Deno, export the following environment variable:

```bash
export DEBUG='capnp*'
```

Trace messages can get rather noisy, so tweak the `DEBUG` variable as you see
fit.

All messages also have a handy `.dump()` method that returns a hex dump of the
first 8 KiB for each segment in the message:

```
> console.log(message.dump());

================
Segment #0
================

=== buffer[64] ===
00000000: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
00000010: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
00000020: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
00000030: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00 ················
```

## License

[MIT](/LICENSE.md)
