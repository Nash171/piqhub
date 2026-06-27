import bcrypt from 'bcryptjs';
import { getClient } from './db';
import { User } from '@/types';

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, username, role, created_at FROM users WHERE username = ?',
    args: [username],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as User;
}

export async function getUserById(id: number): Promise<User | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, username, role, created_at FROM users WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as User;
}

export async function getUserWithPassword(username: string): Promise<{ id: number; username: string; role: 'admin' | 'player'; password_hash: string } | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, username, password_hash, role FROM users WHERE username = ?',
    args: [username],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as { id: number; username: string; role: 'admin' | 'player'; password_hash: string };
}

export async function createUser(username: string, password: string, role: 'admin' | 'player' = 'player'): Promise<User> {
  const db = getClient();
  const passwordHash = await hashPassword(password);
  const result = await db.execute({
    sql: 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) RETURNING id, username, role, created_at',
    args: [username, passwordHash, role],
  });
  return result.rows[0] as unknown as User;
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  const db = getClient();
  const passwordHash = await hashPassword(newPassword);
  await db.execute({
    sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
    args: [passwordHash, userId],
  });
}
