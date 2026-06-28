import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createEventSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(['upcoming', 'open', 'locked', 'completed', 'hidden']).default('upcoming'),
});

export const updateEventStatusSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  status: z.enum(['upcoming', 'open', 'locked', 'completed', 'hidden']),
});

export const updateEventSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(100),
  status: z.enum(['upcoming', 'open', 'locked', 'completed', 'hidden']),
});

export const deleteEventSchema = z.object({
  eventId: z.coerce.number().int().positive(),
});

export const updateMatchSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  teamA: z.string().min(1).max(50),
  teamB: z.string().min(1).max(50),
  matchTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
});

export const deleteMatchSchema = z.object({
  matchId: z.coerce.number().int().positive(),
});

export const updateRegistrationStatusSchema = z.object({
  registrationId: z.coerce.number().int().positive(),
  status: z.enum(['pending', 'confirmed', 'rejected', 'blocked']),
});

export const createMatchSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  teamA: z.string().min(1).max(50),
  teamB: z.string().min(1).max(50),
  matchTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
});

export const setWinnerSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  winner: z.enum(['team_a', 'team_b']),
});

export const placeBetSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  teamChosen: z.enum(['team_a', 'team_b']),
  amount: z.coerce.number().int().positive(),
});

export const updateBetSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  teamChosen: z.enum(['team_a', 'team_b']),
  amount: z.coerce.number().int().positive(),
});

export const resetPasswordSchema = z.object({
  userId: z.coerce.number().int().positive(),
  newPassword: z.string().min(6),
});

export const updateUserSchema = z.object({
  userId: z.coerce.number().int().positive(),
  username: z.string().min(3).max(32),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (!data.newPassword || data.newPassword.length === 0) return true;
  return data.newPassword.length >= 6;
}, {
  message: 'Password must be at least 6 characters',
  path: ['newPassword'],
}).refine((data) => {
  if (!data.newPassword || data.newPassword.length === 0) return true;
  return data.newPassword === data.confirmPassword;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetWinnerSchema = z.object({
  matchId: z.coerce.number().int().positive(),
});

export const recalculateEventSchema = z.object({
  eventId: z.coerce.number().int().positive(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type DeleteMatchInput = z.infer<typeof deleteMatchSchema>;
export type UpdateRegistrationStatusInput = z.infer<typeof updateRegistrationStatusSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type SetWinnerInput = z.infer<typeof setWinnerSchema>;
export type PlaceBetInput = z.infer<typeof placeBetSchema>;
export type UpdateBetInput = z.infer<typeof updateBetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetWinnerInput = z.infer<typeof resetWinnerSchema>;
export type RecalculateEventInput = z.infer<typeof recalculateEventSchema>;
