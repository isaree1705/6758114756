import "server-only";
import postgres from "postgres";

let connection: ReturnType<typeof postgres> | undefined;

export function isConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && (process.env.VOTER_COOKIE_SECRET?.length ?? 0) >= 32);
}

export function db() {
  if (connection) return connection;
  if (!process.env.DATABASE_URL) throw new Error("Database configuration missing");
  const parsed = new URL(process.env.DATABASE_URL);
  if (!/^idea_board_app(?:\.[a-z0-9]+)?$/.test(decodeURIComponent(parsed.username))) {
    throw new Error("Use the restricted idea_board_app database account");
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) throw new Error("Invalid database URL protocol");
  // Prevent URL SSL parameters from disabling certificate verification.
  parsed.search = "";
  connection = postgres(parsed.toString(), {
    ssl: { rejectUnauthorized: true },
    max: 1,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
    onnotice: () => {},
  });
  return connection;
}

export type Idea = {
  id: string; title: string; description: string; author_nickname: string;
  votes: number; voted: boolean;
};

export async function listIdeas(voter: string | null): Promise<Idea[]> {
  return db()<Idea[]>`
    select i.id, i.title, i.description, i.author_nickname,
      (select count(*)::integer from public.votes v where v.idea_id = i.id) as votes,
      exists(select 1 from public.votes v where v.idea_id = i.id and v.voter_id = ${voter}::uuid) as voted
    from public.ideas i
    order by i.created_at desc, i.id desc
    limit 100
  `;
}
