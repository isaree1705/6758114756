import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("PostgreSQL schema enforces vote uniqueness, RLS, and least privilege", async () => {
  const db = new PGlite();
  try {
    // Supabase provides these browser roles; emulate them in this isolated database.
    await db.exec("create role anon; create role authenticated;");
    await db.exec(await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"));
    const { rows: roles } = await db.query("select rolsuper, rolbypassrls from pg_roles where rolname = 'idea_board_app'");
    assert.equal(roles[0].rolsuper, false);
    assert.equal(roles[0].rolbypassrls, false);
    const { rows: tables } = await db.query("select relrowsecurity from pg_class where oid in ('public.ideas'::regclass, 'public.votes'::regclass)");
    assert.equal(tables.length, 2);
    assert.ok(tables.every(row => row.relrowsecurity));

    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query("select * from public.ideas"), { code: "42501" });
      await assert.rejects(db.query("insert into public.ideas (title, description, author_nickname) values ('x', 'x', 'x')"), { code: "42501" });
      await assert.rejects(db.query("select * from public.votes"), { code: "42501" });
      await assert.rejects(db.query("insert into public.votes (idea_id, voter_id) values ($1, $2)", [randomUUID(), randomUUID()]), { code: "42501" });
      await db.exec("reset role");
    }

    await db.exec("set role idea_board_app");
    const { rows } = await db.query("insert into public.ideas (title, description, author_nickname) values ($1, $2, $3) returning id", ["A shared idea", "Description", "Reader"]);
    const idea = rows[0].id;
    const voter = randomUUID();
    await db.query("insert into public.votes (idea_id, voter_id) values ($1, $2)", [idea, voter]);
    await assert.rejects(db.query("insert into public.votes (idea_id, voter_id) values ($1, $2)", [idea, voter]), { code: "23505" });
    const duplicate = await db.query("insert into public.votes (idea_id, voter_id) values ($1, $2) on conflict (idea_id, voter_id) do nothing returning idea_id", [idea, voter]);
    assert.equal(duplicate.rows.length, 0);
    await db.query("insert into public.votes (idea_id, voter_id) values ($1, $2)", [idea, randomUUID()]);
    const count = await db.query("select count(*)::integer as votes from public.votes where idea_id = $1", [idea]);
    assert.equal(count.rows[0].votes, 2);
    await assert.rejects(db.query("insert into public.votes (idea_id, voter_id) values ($1, $2)", [randomUUID(), voter]), { code: "23503" });
    await assert.rejects(db.query("insert into public.ideas (title, description, author_nickname) values (' ', 'x', 'x')"), { code: "23514" });
    await assert.rejects(db.query("insert into public.ideas (title, description, author_nickname) values ($1, 'x', 'x')", ["x".repeat(121)]), { code: "23514" });
    for (const table of ["ideas", "votes"]) {
      await assert.rejects(db.query(`delete from public.${table}`), { code: "42501" });
      await assert.rejects(db.query(`update public.${table} set created_at = now()`), { code: "42501" });
    }
    await assert.rejects(db.exec("alter table public.ideas disable row level security"), { code: "42501" });
  } finally {
    await db.close();
  }
});
