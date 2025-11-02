import { z } from 'zod';

export const todoSchema = z.object({
  text: z.string()
    .trim()
    .min(1, { message: "La tâche ne peut pas être vide" })
    .max(500, { message: "La tâche doit contenir moins de 500 caractères" }),
  scheduledFor: z.date().optional()
});

export type TodoInput = z.infer<typeof todoSchema>;
