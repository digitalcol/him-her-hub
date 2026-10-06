import { createServerFn } from "@tanstack/react-start";

export const operationsOpen = createServerFn({ method: "GET" }).handler(async () => {
  const { operationsUnlocked } = await import("@/lib/operations-lock.server");
  return operationsUnlocked();
});

export const operationsQuestion = createServerFn({ method: "GET" }).handler(async () => {
  const { drawQuestion } = await import("@/lib/operations-lock.server");
  return drawQuestion();
});

export const unlockOperations = createServerFn({ method: "POST" })
  .validator((data: { answer: string }) => data)
  .handler(async ({ data }) => {
    const { acceptAnswer } = await import("@/lib/operations-lock.server");
    if (!acceptAnswer(data.answer ?? "")) throw new Error("That is not correct.");
    return { ok: true };
  });

export const lockOperations = createServerFn({ method: "POST" }).handler(async () => {
  const { closeOperations } = await import("@/lib/operations-lock.server");
  closeOperations();
  return { ok: true };
});
