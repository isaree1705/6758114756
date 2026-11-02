"use client";

import { useActionState } from "react";
import { submitIdea, voteForIdea } from "./actions";

const initial = { ok: false, message: "" };

export function IdeaForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(submitIdea, initial);
  return (
    <form action={action} aria-describedby="submit-status">
      <label htmlFor="title">Title</label>
      <input id="title" name="title" placeholder="What’s your idea?" maxLength={120} required />
      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" placeholder="Tell us a little more…" maxLength={2000} rows={5} required />
      <label htmlFor="nickname">Your nickname</label>
      <input id="nickname" name="nickname" placeholder="What should we call you?" maxLength={40} autoComplete="nickname" required />
      <button type="submit" disabled={!enabled || pending}>{pending ? "Sharing…" : "Share idea"}<span aria-hidden="true">→</span></button>
      <small id="submit-status" role="status" className={state.message && !state.ok ? "error" : ""}>
        {state.message || (enabled ? "Your nickname and idea will be public." : "Submission is unavailable until the board is connected.")}
      </small>
    </form>
  );
}

export function VoteForm({ id, count, voted }: { id: string; count: number; voted: boolean }) {
  const [state, action, pending] = useActionState(voteForIdea, initial);
  const hasVoted = voted || state.ok;
  return (
    <form action={action} className="vote-form">
      <input type="hidden" name="ideaId" value={id} />
      <button type="submit" disabled={hasVoted || pending} aria-label={`${hasVoted ? "Already voted" : "Vote for this idea"}, ${count} votes`}>
        <span aria-hidden="true">↑</span> {count} {count === 1 ? "vote" : "votes"}{hasVoted ? " · Voted" : ""}
      </button>
      <small role="status" className={!state.ok ? "error" : ""}>{state.message || (pending ? "Saving vote…" : "")}</small>
    </form>
  );
}
