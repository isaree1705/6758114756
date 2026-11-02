"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, isConfigured } from "../lib/db";
import { readVoter, signVoter, voterCookieName } from "../lib/voter";
import { validateIdea, validIdeaId } from "../lib/validation";

export type ActionState = { message: string; ok: boolean };

export async function submitIdea(_previous: ActionState, form: FormData): Promise<ActionState> {
  const idea = validateIdea(form);
  if (!idea) return { ok: false, message: "Enter a title (1–120 characters), description (1–2000), and nickname (1–40)." };
  if (!isConfigured()) return { ok: false, message: "The board is not connected yet." };
  try {
    await db()`insert into public.ideas (title, description, author_nickname) values (${idea.title}, ${idea.description}, ${idea.nickname})`;
  } catch {
    // Database errors can contain credentials; never send them to clients or logs.
    return { ok: false, message: "Could not save your idea. Please try again later." };
  }
  revalidatePath("/");
  return { ok: true, message: "Your idea is on the board!" };
}

export async function voteForIdea(_previous: ActionState, form: FormData): Promise<ActionState> {
  const ideaId = form.get("ideaId");
  if (!validIdeaId(ideaId)) return { ok: false, message: "That idea could not be found." };
  if (!isConfigured()) return { ok: false, message: "The board is not connected yet." };
  const secret = process.env.VOTER_COOKIE_SECRET!;
  const jar = await cookies();
  const voter = readVoter(jar.get(voterCookieName)?.value, secret) ?? randomUUID();
  jar.set(voterCookieName, signVoter(voter, secret), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 60 * 60 * 24 * 365,
  });
  try {
    const result = await db()`
      insert into public.votes (idea_id, voter_id) values (${ideaId}, ${voter})
      on conflict (idea_id, voter_id) do nothing returning idea_id
    `;
    revalidatePath("/");
    return { ok: true, message: result.length ? "Vote added!" : "You already voted for this idea." };
  } catch {
    return { ok: false, message: "Could not add your vote. Refresh the page and try again." };
  }
}
