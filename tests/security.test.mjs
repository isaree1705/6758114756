import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { signVoter, readVoter } from "../lib/voter.ts";
import { validateIdea, validIdeaId } from "../lib/validation.ts";

const secret = randomBytes(32).toString("hex");

test("signed voter survives a reload and rejects a forged identity or signature", () => {
  const id = randomUUID();
  const signed = signVoter(id, secret);
  assert.equal(readVoter(signed, secret), id);
  assert.equal(readVoter(signed.replace(id, randomUUID()), secret), null);
  assert.equal(readVoter(signed, randomBytes(32).toString("hex")), null);
  assert.equal(readVoter(`${id}.${"0".repeat(64)}`, secret), null);
});

test("malformed and missing cookies fail closed without crashing", () => {
  for (const value of [undefined, "", randomUUID(), "a.b", "a.b.c", "x".repeat(10000)]) {
    assert.equal(readVoter(value, secret), null);
  }
  assert.throws(() => signVoter(randomUUID(), "short"));
});

function form(values = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: "A title", description: "A description", nickname: "Reader", ...values })) data.set(key, value);
  return data;
}

test("idea input trims whitespace and enforces all database length limits", () => {
  assert.equal(validateIdea(form({ title: "  Hello  " })).title, "Hello");
  for (const values of [{ title: " " }, { title: "x".repeat(121) }, { description: "x".repeat(2001) }, { nickname: "x".repeat(41) }, { description: "a\0b" }]) {
    assert.equal(validateIdea(form(values)), null);
  }
  assert.ok(validateIdea(form({ title: "🌱".repeat(120) })));
  const missing = form(); missing.delete("nickname");
  assert.equal(validateIdea(missing), null);
  const file = form(); file.set("title", new Blob(["oops"]), "title.txt");
  assert.equal(validateIdea(file), null);
});

test("only UUID idea IDs reach the database", () => {
  assert.ok(validIdeaId(randomUUID()));
  for (const value of [null, "", "1", "'; drop table ideas;--", 123]) assert.equal(validIdeaId(value), false);
});
