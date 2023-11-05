import {
  assert,
  assertEquals,
  assertFalse,
  assertInstanceOf,
  assertThrows,
} from "../test_utils.ts";
import * as capnp from "../mod.ts";
import { compareBuffers, readFileBuffer } from "../test_utils.ts";
import { AddressBook, Person } from "./serialization_demo.ts";

const SERIALIZATION_DEMO = readFileBuffer("serialization_demo.bin");

Deno.test("write address book", async (t) => {
  const message = new capnp.Message();
  const addressBook = message.initRoot(AddressBook);

  assertInstanceOf(addressBook, AddressBook);

  const people = addressBook.initPeople(2);

  assertInstanceOf(people, AddressBook.People);

  const alice = people.get(0);

  assertInstanceOf(alice, Person);

  alice.setId(456);
  alice.setName("Alice");
  alice.setEmail("alice@example.com");

  // t.comment("should not crash while calling setters");

  const alicePhones = alice.initPhones(1);

  assertInstanceOf(alicePhones, Person.Phones);

  alicePhones.get(0).setNumber("555-1212");
  alicePhones.get(0).setType(Person.PhoneNumber.Type.MOBILE);

  // t.comment("should not crash while chaining getter calls");

  alice.getEmployment().setSchool("MIT");

  // t.comment("should not crash while accessing groups and unions");

  const bob = people.get(1);

  assertInstanceOf(bob, Person);

  bob.setId(456);
  bob.setName("Bob");
  bob.setEmail("bob@example.com");

  // t.comment(
  //   "should not crash while calling setters on composite struct with nonzero index",
  // );

  const bobPhones = bob.initPhones(2);

  assertInstanceOf(bobPhones, Person.Phones);

  bobPhones.get(0).setNumber("555-4567");
  bobPhones.get(0).setType(Person.PhoneNumber.Type.HOME);
  bobPhones.get(1).setNumber("555-7654");
  bobPhones.get(1).setType(Person.PhoneNumber.Type.WORK);

  // t.comment("should not crash while chaining getters");

  bob.getEmployment().setUnemployed();

  // t.comment("should not crash while setting void union");

  const out = message.toArrayBuffer();

  await compareBuffers(t, out, SERIALIZATION_DEMO);
});

Deno.test("read address book", () => {
  const message = new capnp.Message(SERIALIZATION_DEMO, false);

  const addressBook = message.getRoot(AddressBook);

  const people = addressBook.getPeople();

  assertEquals(people.getLength(), 2);

  const alice = people.get(0);

  assertEquals(alice.getId(), 456);
  assertEquals(alice.getName(), "Alice");
  assertEquals(alice.getEmail(), "alice@example.com");

  const alicePhones = alice.getPhones();

  assertEquals(alicePhones.getLength(), 1);

  assertEquals(alicePhones.get(0).getNumber(), "555-1212");
  assertEquals(alicePhones.get(0).getType(), Person.PhoneNumber.Type.MOBILE);

  const aliceEmployment = alice.getEmployment();

  assertEquals(aliceEmployment.which(), Person.Employment.SCHOOL);
  assert(aliceEmployment.isSchool());
  assertEquals(aliceEmployment.getSchool(), "MIT");

  const bob = people.get(1);

  assertEquals(bob.getId(), 456);
  assertEquals(bob.getName(), "Bob");
  assertEquals(bob.getEmail(), "bob@example.com");

  const bobPhones = bob.getPhones();

  assertEquals(bobPhones.getLength(), 2);

  assertEquals(bobPhones.get(0).getNumber(), "555-4567");
  assertEquals(bobPhones.get(0).getType(), Person.PhoneNumber.Type.HOME);
  assertEquals(bobPhones.get(1).getNumber(), "555-7654");
  assertEquals(bobPhones.get(1).getType(), Person.PhoneNumber.Type.WORK);

  const bobEmployment = bob.getEmployment();

  assertEquals(bobEmployment.which(), Person.Employment.UNEMPLOYED);
  assert(bobEmployment.isUnemployed());
});

Deno.test("copy pointers from other message", () => {
  const message1 = new capnp.Message();
  const addressBook1 = message1.initRoot(AddressBook);
  const people1 = addressBook1.initPeople(2);
  const alice1 = people1.get(1);

  alice1.setName("Alice");
  alice1.setEmail("alice@example.com");
  alice1.setId(456);

  const message2 = new capnp.Message();
  const addressBook2 = message2.initRoot(AddressBook);

  addressBook2.setPeople(people1);

  const people2 = addressBook2.getPeople();
  const alice2 = people2.get(1);

  assertEquals(people2.getLength(), 2);
  assertEquals(alice2.getName(), "Alice");
  assertEquals(alice2.getEmail(), "alice@example.com");
  assertEquals(alice2.getId(), 456);
});

Deno.test("adoption", () => {
  const m = new capnp.Message();
  const s = m.getSegment(0);
  const addressBook = m.initRoot(AddressBook);
  const people1 = addressBook.initPeople(1);
  const alice1 = people1.get(0);

  alice1.setName("Alice");
  alice1.setEmail("alice@example.com");
  alice1.setId(456);

  const o = addressBook.disownPeople();

  assert(s.isWordZero(0x08), "should null the pointer");
  assertFalse(
    s.isWordZero(0x10),
    "should not wipe out the composite list tag word",
  );
  assertFalse(s.isWordZero(0x40), "should not touch the content");
  assert(capnp.Pointer.isNull(people1), "should null the original pointer");

  addressBook.adoptPeople(o);

  const people2 = addressBook.getPeople();
  const alice2 = people2.get(0);

  assertEquals(alice2.getName(), "Alice");
  assertEquals(alice2.getEmail(), "alice@example.com");
  assertEquals(alice2.getId(), 456);
  assertEquals(alice1.getId(), 456);

  assertThrows(
    () => addressBook.adoptPeople(o),
    "should not allow multiple adoption",
  );
});

Deno.test("overwrite", () => {
  const m = new capnp.Message();
  const s = m.getSegment(0);
  const addressBook = m.initRoot(AddressBook);
  const alice = addressBook.initPeople(1).get(0);

  alice.setName("Alex");
  alice.setName("Alice");

  assert(s.isWordZero(0x40), "should zero out the old string");

  addressBook.initPeople(1);

  assert(s.isWordZero(0x40), "should zero out every string");
  assert(s.isWordZero(0x48), "should zero out every string");
});
