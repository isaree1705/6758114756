export type IdeaInput = { title: string; description: string; nickname: string };

export function validateIdea(form: FormData): IdeaInput | null {
  const limits = { title: 120, description: 2000, nickname: 40 } as const;
  const values: Partial<IdeaInput> = {};
  for (const name of Object.keys(limits) as (keyof IdeaInput)[]) {
    const raw = form.get(name);
    if (typeof raw !== "string") return null;
    const value = raw.trim();
    // PostgreSQL char_length counts Unicode code points, not UTF-16 units.
    if (!value || Array.from(value).length > limits[name] || value.includes("\0")) return null;
    values[name] = value;
  }
  return values as IdeaInput;
}

export function validIdeaId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
