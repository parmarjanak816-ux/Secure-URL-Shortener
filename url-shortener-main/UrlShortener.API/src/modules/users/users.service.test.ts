// Pull the test helpers from Vitest. (We import them explicitly so it's
// obvious where describe/it/expect come from — no magic globals.)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

// The functions under test (the REAL code we want to verify).
import { getProfile, updateProfile, changePassword } from './users.service';

// The repository module — we import it so we can FAKE it below.
import * as repository from './users.repository';

// This line replaces the ENTIRE repository module with auto-generated
// fakes. Every exported function becomes a "mock": it does nothing and
// returns undefined until we tell it what to return. Result: the service
// is tested in isolation, with NO real database involved.
vi.mock('./users.repository');

// Fake the hashing library too, so we don't run real (slow) bcrypt work.
vi.mock('bcryptjs');

// A fake user row, shaped exactly like Prisma's User type.
const fakeUser: User = {
  id: 'user-1',
  email: 'jane@example.com',
  password: 'hashed-pw',
  role: 'USER',
  firstName: 'Jane',
  lastName: null,
  createdAt: new Date('2026-01-01'),
};

// Runs before EVERY `it` below, wiping mock state so tests stay independent.
beforeEach(() => {
  vi.resetAllMocks();
});

// `describe` just groups related test cases under a heading.
describe('getProfile', () => {
  it('returns the mapped profile (without the password) when the user exists', async () => {
    // Arrange: tell the fake repo to "find" our user.
    vi.mocked(repository.findUserById).mockResolvedValue(fakeUser);

    // Act: call the real service function.
    const result = await getProfile('user-1');

    // Assert: it queried the repo with the right id...
    expect(repository.findUserById).toHaveBeenCalledWith('user-1');
    // ...and the returned profile must NOT leak the password hash.
    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe('jane@example.com');
  });

  it('throws "User not found" when the user does not exist', async () => {
    // Arrange: the fake repo finds nobody.
    vi.mocked(repository.findUserById).mockResolvedValue(null);

    // Act + Assert: the promise should reject with this message.
    await expect(getProfile('missing-id')).rejects.toThrow('User not found');
  });
});

describe('updateProfile', () => {
  it('converts blank/whitespace names to null before saving', async () => {
    // The fake repo just echoes a user back so updateProfile can finish.
    vi.mocked(repository.updateUserName).mockResolvedValue(fakeUser);

    // Act: firstName is just spaces, lastName is real.
    await updateProfile('user-1', { firstName: '   ', lastName: 'Doe' });

    // Assert: blank -> null, real value trimmed and kept.
    expect(repository.updateUserName).toHaveBeenCalledWith('user-1', null, 'Doe');
  });
});

describe('changePassword', () => {
  it('throws when the current password is wrong', async () => {
    vi.mocked(repository.findUserById).mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never); // pretend it didn't match

    await expect(
      changePassword('user-1', { currentPassword: 'wrong', newPassword: 'NewPass123' }),
    ).rejects.toThrow('Current password is incorrect');

    // It must NOT save anything if the check failed.
    expect(repository.updateUserPassword).not.toHaveBeenCalled();
  });

  it('hashes and saves the new password when the current one matches', async () => {
    vi.mocked(repository.findUserById).mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);    // pretend it matched
    vi.mocked(bcrypt.hash).mockResolvedValue('new-hash' as never); // fake the new hash

    await changePassword('user-1', { currentPassword: 'OldPass123', newPassword: 'NewPass123' });

    // The freshly hashed value is what gets persisted.
    expect(repository.updateUserPassword).toHaveBeenCalledWith('user-1', 'new-hash');
  });
});
