import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Url } from '@prisma/client';

// The real service code we want to verify.
import {
  createShortUrl,
  getUserUrls,
  updateComment,
  toggleUrl,
  redirectUrl,
} from './urls.service';

// Import the repository so we can replace it with fakes (no real DB).
import * as repository from './urls.repository';

vi.mock('./urls.repository');

// A fake Url row, shaped exactly like Prisma's Url type.
const fakeUrl: Url = {
  id: 'url-1',
  originalUrl: 'https://example.com',
  shortCode: 'abc123',
  comment: null,
  clicks: 0,
  isActive: true,
  expiresAt: new Date('2099-01-01'), // far future = not expired
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  userId: 'user-1',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('createShortUrl', () => {
  it('rejects a custom short code when there is no logged-in user', async () => {
    await expect(
      createShortUrl({ originalUrl: 'https://example.com', shortCode: 'mycode' }),
    ).rejects.toThrow('Custom short codes require an account');

    expect(repository.createUrl).not.toHaveBeenCalled();
  });

  it('rejects a custom short code that is already taken', async () => {
    vi.mocked(repository.findUrlByShortCode).mockResolvedValue(fakeUrl); // taken

    await expect(
      createShortUrl({ originalUrl: 'https://example.com', shortCode: 'abc123' }, 'user-1'),
    ).rejects.toThrow('Short code already in use');

    expect(repository.createUrl).not.toHaveBeenCalled();
  });

  it('creates the url and returns the mapped response', async () => {
    vi.mocked(repository.findUrlByShortCode).mockResolvedValue(null); // code free
    vi.mocked(repository.createUrl).mockResolvedValue(fakeUrl);

    const result = await createShortUrl(
      { originalUrl: 'https://example.com', shortCode: 'abc123' },
      'user-1',
    );

    expect(repository.createUrl).toHaveBeenCalled();
    expect(result.shortCode).toBe('abc123');
    expect(result.originalUrl).toBe('https://example.com');
    // mapToUrlResponse omits internal fields like userId.
    expect(result).not.toHaveProperty('userId');
  });
});

describe('getUserUrls', () => {
  it("returns all of the user's urls, mapped", async () => {
    vi.mocked(repository.findUrlsByUserId).mockResolvedValue([fakeUrl]);

    const result = await getUserUrls('user-1');

    expect(repository.findUrlsByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].shortCode).toBe('abc123');
  });
});

describe('updateComment', () => {
  it('throws "URL not found" when the url does not exist', async () => {
    vi.mocked(repository.findUrlById).mockResolvedValue(null);

    await expect(
      updateComment('url-1', { comment: 'hi' }, 'user-1'),
    ).rejects.toThrow('URL not found');
  });

  it('throws "Unauthorized" when the url belongs to someone else', async () => {
    vi.mocked(repository.findUrlById).mockResolvedValue(fakeUrl); // owned by user-1

    await expect(
      updateComment('url-1', { comment: 'hi' }, 'someone-else'),
    ).rejects.toThrow('Unauthorized');

    expect(repository.updateUrlComment).not.toHaveBeenCalled();
  });

  it('updates the comment for the owner', async () => {
    vi.mocked(repository.findUrlById).mockResolvedValue(fakeUrl);
    vi.mocked(repository.updateUrlComment).mockResolvedValue({ ...fakeUrl, comment: 'hi' });

    const result = await updateComment('url-1', { comment: 'hi' }, 'user-1');

    expect(repository.updateUrlComment).toHaveBeenCalledWith('url-1', 'hi');
    expect(result.comment).toBe('hi');
  });
});

describe('toggleUrl', () => {
  it('throws "Unauthorized" when the url belongs to someone else', async () => {
    vi.mocked(repository.findUrlById).mockResolvedValue(fakeUrl);

    await expect(toggleUrl('url-1', 'someone-else')).rejects.toThrow('Unauthorized');
    expect(repository.toggleUrlActive).not.toHaveBeenCalled();
  });

  it('flips isActive to the opposite of its current value', async () => {
    vi.mocked(repository.findUrlById).mockResolvedValue(fakeUrl); // isActive: true
    vi.mocked(repository.toggleUrlActive).mockResolvedValue({ ...fakeUrl, isActive: false });

    await toggleUrl('url-1', 'user-1');

    // current value is true, so it should be toggled to false
    expect(repository.toggleUrlActive).toHaveBeenCalledWith('url-1', false);
  });
});

describe('redirectUrl', () => {
  it('throws when the short code is unknown', async () => {
    vi.mocked(repository.findUrlByShortCode).mockResolvedValue(null);

    await expect(redirectUrl('nope')).rejects.toThrow('URL not found');
  });

  it('throws when the url is not active', async () => {
    vi.mocked(repository.findUrlByShortCode).mockResolvedValue({ ...fakeUrl, isActive: false });

    await expect(redirectUrl('abc123')).rejects.toThrow('URL is not active');
    expect(repository.incrementClicks).not.toHaveBeenCalled();
  });

  it('throws when the url has expired', async () => {
    vi.mocked(repository.findUrlByShortCode).mockResolvedValue({
      ...fakeUrl,
      expiresAt: new Date('2000-01-01'), // in the past
    });

    await expect(redirectUrl('abc123')).rejects.toThrow('URL has expired');
    expect(repository.incrementClicks).not.toHaveBeenCalled();
  });

  it('increments clicks and returns the original url on success', async () => {
    vi.mocked(repository.findUrlByShortCode).mockResolvedValue(fakeUrl);

    const result = await redirectUrl('abc123');

    expect(repository.incrementClicks).toHaveBeenCalledWith('url-1');
    expect(result).toBe('https://example.com');
  });
});
