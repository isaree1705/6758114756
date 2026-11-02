import { createHmac, timingSafeEqual } from "node:crypto";

export const voterCookieName = "idea_board_voter";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function signVoter(id: string, secret: string): string {
  if (!uuid.test(id) || secret.length < 32) throw new Error("Invalid voter configuration");
  return `${id}.${createHmac("sha256", secret).update(id).digest("hex")}`;
}

export function readVoter(value: string | undefined, secret: string): string | null {
  if (!value || secret.length < 32) return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !uuid.test(parts[0]) || !/^[0-9a-f]{64}$/.test(parts[1])) return null;
  const expected = signVoter(parts[0], secret).split(".")[1];
  return timingSafeEqual(Buffer.from(parts[1], "hex"), Buffer.from(expected, "hex")) ? parts[0] : null;
}
