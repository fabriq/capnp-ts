import * as capnp from "../mod.ts";
import { decodeUtf8 } from "../lib/utils.ts";
import { AddressBook } from "./serialization_demo.ts";
import { readFileBuffer, readTextFile } from "../test_utils.ts";

const jsonBuffer = new Uint8Array(
  readFileBuffer("serialization_demo.json"),
);

const jsonString = readTextFile("serialization_demo.json");

const messageSegment = readFileBuffer("serialization_demo.bin");

Deno.bench("JSON.parse(decodeUtf8(m))", {
  group: "iteration over deeply nested lists",
}, () => {
  const addressBook = JSON.parse(decodeUtf8(jsonBuffer));

  addressBook.people.forEach((person: { phones: [] }) => {
    person.phones.forEach((phone: { number: string }) => {
      phone.number.toUpperCase();
    });
  });
});

Deno.bench(
  "JSON.parse(m)",
  { group: "iteration over deeply nested lists" },
  () => {
    const addressBook = JSON.parse(jsonString);

    addressBook.people.forEach((person: { phones: [] }) => {
      person.phones.forEach((phone: { number: string }) => {
        phone.number.toUpperCase();
      });
    });
  },
);

Deno.bench(
  "capnp.Message(m)",
  { group: "iteration over deeply nested lists" },
  () => {
    const message = new capnp.Message(messageSegment, false, true);

    const addressBook = message.getRoot(AddressBook);

    addressBook.getPeople().forEach((person) => {
      person.getPhones().forEach((phone) => {
        phone.getNumber().toUpperCase();
      });
    });
  },
);

Deno.bench("JSON.parse(decodeUtf8(m))", {
  group: "top level list length access",
}, () => {
  const addressBook = JSON.parse(decodeUtf8(jsonBuffer));

  addressBook.people.length.toFixed(0);
});

Deno.bench("JSON.parse(m)", { group: "top level list length access" }, () => {
  const addressBook = JSON.parse(jsonString);

  addressBook.people.length.toFixed(0);
});

Deno.bench(
  "capnp.Message(m)",
  { group: "top level list length access" },
  () => {
    const message = new capnp.Message(messageSegment, false, true);

    const addressBook = message.getRoot(AddressBook);

    addressBook.getPeople().getLength().toFixed(0);
  },
);

Deno.bench("JSON.parse(decodeUtf8(m))", { group: "parse" }, () => {
  JSON.parse(decodeUtf8(jsonBuffer));
});

Deno.bench("JSON.parse(m)", { group: "parse" }, () => {
  JSON.parse(jsonString);
});

Deno.bench("capnp.Message(m).getRoot(A)", { group: "parse" }, () => {
  // Okay, this isn't fair. Cap'n Proto only does "parsing" at access time. :)

  new capnp.Message(messageSegment, false, true).getRoot(AddressBook);
});
