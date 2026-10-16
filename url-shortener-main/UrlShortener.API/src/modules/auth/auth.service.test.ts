import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

import { registerUser, loginUser } from './auth.service';
import * as repository from './auth.repository';

// Fake the DB layer and the two crypto libraries so this stays a pure unit test.
vi.mock('./auth.repository');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

const fakeUser: User = {
  id: 'user-1',
  email: 'jane@example.com',
  password: 'hashed-pw',
  role: 'USER',
  firstName: null,
  lastName: null,
  createdAt: new Date('2026-01-01'),
};

beforeEach(() => {
  vi.resetAllMocks();
  // jwt.sign is called when issuing tokens — give it a canned return value.
  vi.mocked(jwt.sign).mockReturnValue('fake-access-token' as never);
});

describe('registerUser', () => {
  it('rejects a duplicate email', async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(fakeUser); // email taken

    await expect(
      registerUser({ email: 'jane@example.com', password: 'Pass1234' }),
    ).rejects.toThrow('Email already in use');

    expect(repository.createUser).not.toHaveBeenCalled(); // never created
  });

  it('hashes the password, creates the user, and returns tokens without the password', async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(null); // email free
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
    vi.mocked(repository.createUser).mockResolvedValue(fakeUser);

    const result = await registerUser({ email: 'jane@example.com', password: 'Pass1234' });

    expect(repository.createUser).toHaveBeenCalledWith('jane@example.com', 'hashed-pw');
    expect(result.accessToken).toBe('fake-access-token');
    expect(result.user).not.toHaveProperty('password'); // never leak the hash
  });
});

describe('loginUser', () => {
  it('throws "Invalid credentials" when the email is unknown', async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(null);

    await expect(
      loginUser({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('throws "Invalid credentials" when the password is wrong', async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      loginUser({ email: 'jane@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('returns tokens on a correct email + password', async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await loginUser({ email: 'jane@example.com', password: 'Pass1234' });

    expect(result.accessToken).toBe('fake-access-token');
    expect(result.user.email).toBe('jane@example.com');
  });
});
