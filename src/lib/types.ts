export type ActionResult =
  | { success: true; message?: string; data?: unknown }
  | { success: false; error: string };
