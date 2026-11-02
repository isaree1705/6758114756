import { cookies } from "next/headers";
import { isConfigured, listIdeas, type Idea } from "../lib/db";
import { readVoter, voterCookieName } from "../lib/voter";
import { IdeaForm, VoteForm } from "./forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  let ideas: Idea[] = [];
  let available = false;
  const configured = isConfigured();
  if (configured) {
    const jar = await cookies();
    const voter = readVoter(jar.get(voterCookieName)?.value, process.env.VOTER_COOKIE_SECRET!);
    try {
      ideas = await listIdeas(voter);
      available = true;
    } catch {
      // Show a safe outage state without exposing connection details.
    }
  }
  return (
    <main className="container">
      <header>
        <span className="eyebrow">A LITTLE SPACE FOR BIG POSSIBILITIES</span>
        <h1>Good ideas start here.</h1>
        <p>Share a thought. Find inspiration. Help the best ideas grow.</p>
      </header>
      <div className="board-layout">
        <section aria-labelledby="ideas-heading">
          <div className="section-heading"><h2 id="ideas-heading">The idea board</h2><span>{available ? `${ideas.length}${ideas.length === 100 ? "+" : ""} ideas` : "Not connected"}</span></div>
          {!available ? (
            <div className="empty-state" role="status">
              <span className="spark" aria-hidden="true">✦</span>
              <h3>{configured ? "The board is taking a break" : "Almost ready for your ideas"}</h3>
              <p>{configured ? "We couldn’t load the ideas. Please refresh in a moment." : "Ideas and voting will be available once the database connection is configured."}</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="empty-state"><span className="spark" aria-hidden="true">✦</span><h3>Room for your first idea</h3><p>Have something in mind? Share it and get the conversation started.</p></div>
          ) : (
            <div className="ideas">
              {ideas.map(idea => (
                <article className="idea-card" key={idea.id}>
                  <h3>{idea.title}</h3>
                  <p className="idea-description">{idea.description}</p>
                  <div className="idea-meta"><span>Shared by {idea.author_nickname}</span><VoteForm id={idea.id} count={idea.votes} voted={idea.voted} /></div>
                </article>
              ))}
              {ideas.length === 100 && <small>Showing the 100 newest ideas.</small>}
            </div>
          )}
        </section>
        <aside className="compose" aria-labelledby="submit-heading">
          <h2 id="submit-heading">Plant an idea</h2>
          <p>It doesn’t have to be perfect. Just give it a little room to grow.</p>
          <IdeaForm enabled={available} />
        </aside>
      </div>
      <footer>A small thought today. Something better tomorrow.<br />Voting uses a browser cookie. No account needed.</footer>
    </main>
  );
}
