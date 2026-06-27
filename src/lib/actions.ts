'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUserByUsername, getUserWithPassword, verifyPassword } from './auth';
import { getSession, setSession, destroySession, requireAdmin, requireAuth } from './session';
import {
  loginSchema,
  registerSchema,
  createEventSchema,
  updateEventStatusSchema,
  updateEventSchema,
  deleteEventSchema,
  createMatchSchema,
  updateMatchSchema,
  deleteMatchSchema,
  updateRegistrationStatusSchema,
  setWinnerSchema,
  placeBetSchema,
  updateBetSchema,
  resetPasswordSchema,
  resetWinnerSchema,
  recalculateEventSchema,
} from './validators';
import {
  createEventLogic,
  updateEventStatusLogic,
  updateEventLogic,
  deleteEventLogic,
  createMatchLogic,
  updateMatchLogic,
  deleteMatchLogic,
  updateRegistrationStatusLogic,
  placeBetLogic,
  updateBetLogic,
  registerForEventLogic,
  resetUserPasswordLogic,
  setMatchWinnerLogic,
  resetMatchWinnerLogic,
  recalculateEventPointsLogic,
} from './betting';
import { getMatchById } from './queries';
import { createUser } from './auth';
import { ActionResult } from './types';

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const data = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const existing = await getUserByUsername(parsed.data.username);
    if (existing) {
      return { success: false, error: 'Username already taken' };
    }
    const user = await createUser(parsed.data.username, parsed.data.password, 'player');
    await setSession({ user: { id: user.id, username: user.username, role: user.role } });
    return { success: true, message: 'Account created' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
  }
}

export async function loginUser(formData: FormData): Promise<ActionResult> {
  const data = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const user = await getUserWithPassword(parsed.data.username);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    const valid = await verifyPassword(parsed.data.password, user.password_hash);
    if (!valid) {
      return { success: false, error: 'Invalid credentials' };
    }
    await setSession({ user: { id: user.id, username: user.username, role: user.role } });
    return { success: true, message: 'Logged in' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
  }
}

export async function logoutUser(): Promise<void> {
  await destroySession();
  redirect('/login');
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = createEventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await createEventLogic(parsed.data.name, parsed.data.status);
    revalidatePath('/admin/events');
    revalidatePath('/events');
    return { success: true, message: 'Event created' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create event' };
  }
}

export async function updateEventStatus(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = updateEventStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await updateEventStatusLogic(parsed.data.eventId, parsed.data.status);
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: 'Event status updated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update event status' };
  }
}

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = updateEventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await updateEventLogic(parsed.data.eventId, parsed.data.name, parsed.data.status);
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: 'Event updated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update event' };
  }
}

export async function deleteEvent(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = deleteEventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await deleteEventLogic(parsed.data.eventId);
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: 'Event deleted' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete event' };
  }
}

export async function createMatch(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = createMatchSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await createMatchLogic(parsed.data.eventId, parsed.data.teamA, parsed.data.teamB, parsed.data.matchTime);
    revalidatePath('/admin/matches');
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: 'Match created' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create match' };
  }
}

export async function updateMatch(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = updateMatchSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const match = await getMatchById(parsed.data.matchId);
    await updateMatchLogic(parsed.data.matchId, parsed.data.teamA, parsed.data.teamB, parsed.data.matchTime);
    revalidatePath('/admin/matches');
    revalidatePath(`/matches/${parsed.data.matchId}`);
    if (match) {
      revalidatePath(`/events/${match.event_id}`);
    }
    return { success: true, message: 'Match updated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update match' };
  }
}

export async function deleteMatch(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = deleteMatchSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const match = await getMatchById(parsed.data.matchId);
    await deleteMatchLogic(parsed.data.matchId);
    revalidatePath('/admin/matches');
    if (match) {
      revalidatePath(`/events/${match.event_id}`);
    }
    return { success: true, message: 'Match deleted' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete match' };
  }
}

export async function setMatchWinner(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = setWinnerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await setMatchWinnerLogic(parsed.data.matchId, parsed.data.winner);
    revalidatePath('/admin/matches');
    revalidatePath(`/matches/${parsed.data.matchId}`);
    return { success: true, message: 'Winner set and payouts complete' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to set winner' };
  }
}

export async function registerForEvent(eventId: number): Promise<ActionResult> {
  const user = await requireAuth();

  try {
    await registerForEventLogic(user.id, eventId);
    revalidatePath(`/events/${eventId}`);
    return { success: true, message: 'Registered for event' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to register' };
  }
}

export async function placeBet(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth();
  const data = Object.fromEntries(formData);
  const parsed = placeBetSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await placeBetLogic(user.id, parsed.data.matchId, parsed.data.teamChosen, parsed.data.amount);
    revalidatePath(`/matches/${parsed.data.matchId}`);
    return { success: true, message: 'Bet placed' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to place bet' };
  }
}

export async function updateBet(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth();
  const data = Object.fromEntries(formData);
  const parsed = updateBetSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await updateBetLogic(user.id, parsed.data.matchId, parsed.data.teamChosen, parsed.data.amount);
    revalidatePath(`/matches/${parsed.data.matchId}`);
    return { success: true, message: 'Bet updated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update bet' };
  }
}

export async function resetUserPassword(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await resetUserPasswordLogic(parsed.data.userId, parsed.data.newPassword);
    revalidatePath('/admin/users');
    return { success: true, message: 'Password reset' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' };
  }
}

export async function resetMatchWinner(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = resetWinnerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await resetMatchWinnerLogic(parsed.data.matchId);
    revalidatePath('/admin/matches');
    revalidatePath(`/matches/${parsed.data.matchId}`);
    return { success: true, message: 'Winner reset' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset winner' };
  }
}

export async function recalculateEventPoints(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = recalculateEventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await recalculateEventPointsLogic(parsed.data.eventId);
    revalidatePath('/admin/events');
    revalidatePath(`/events/${parsed.data.eventId}`);
    return { success: true, message: 'Points recalculated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to recalculate points' };
  }
}

export async function updateRegistrationStatus(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const parsed = updateRegistrationStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await updateRegistrationStatusLogic(parsed.data.registrationId, parsed.data.status);
    revalidatePath('/admin/registrations');
    return { success: true, message: 'Registration status updated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update registration status' };
  }
}
