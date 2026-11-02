export default function Home() {
  return (
    <main className="container">
      <header>
        <span className="eyebrow">A LITTLE SPACE FOR BIG POSSIBILITIES</span>
        <h1>Good ideas start here.</h1>
        <p>Share a thought. Find inspiration. Help the best ideas grow.</p>
      </header>
      <div className="board-layout">
        <section aria-labelledby="ideas-heading">
          <div className="section-heading"><h2 id="ideas-heading">The idea board</h2><span>0 ideas</span></div>
          <div className="empty-state">
            <span className="spark" aria-hidden="true">✦</span>
            <h3>Room for your first idea</h3>
            <p>Once the database is connected, shared ideas and their votes will appear here.</p>
          </div>
        </section>
        <aside className="compose" aria-labelledby="submit-heading">
          <h2 id="submit-heading">Plant an idea</h2>
          <p>It doesn’t have to be perfect. Just give it a little room to grow.</p>
          <form aria-describedby="connection-status">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" placeholder="What’s your idea?" maxLength={120} required />
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" placeholder="Tell us a little more…" maxLength={2000} rows={5} required />
            <label htmlFor="nickname">Your nickname</label>
            <input id="nickname" name="nickname" placeholder="What should we call you?" maxLength={40} autoComplete="nickname" required />
            <button type="submit" disabled>Share idea <span aria-hidden="true">↗</span></button>
            <small id="connection-status">Submission will be enabled after database setup.</small>
          </form>
        </aside>
      </div>
      <footer>A small thought today. Something better tomorrow.</footer>
    </main>
  );
}
