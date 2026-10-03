import { isWorkspacePreview } from "@/lib/env.server";
import { type Actor } from "@/lib/club-domain";

export type { Actor };
export { canListApplications, canMutateOperations, canReadCircle, canReadAdminNotes, memberSafe } from "@/lib/club-domain";

export function isPreviewMode(): boolean {
  if (process.env.PREVIEW_MODE === "true") return true;
  if (process.env.PREVIEW_MODE === "false") return false;
  // No hosted database yet: keep the working preview, including on the live site.
  if (!process.env.DATABASE_URL?.trim()) return true;
  return isWorkspacePreview();
}

export function actorForRequest(): Actor {
  if (isPreviewMode()) return { role: "preview" };
  return { role: "anonymous" };
}