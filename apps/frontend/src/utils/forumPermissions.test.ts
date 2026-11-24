import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { canDeletePost } from './forumPermissions';
import type { ProfileType } from '../types/forum.types';

const PROFILE_TYPES: ProfileType[] = ['STUDENT', 'TEACHER', 'ADMIN'];

// ---------------------------------------------------------------------------
// Task 1.2 — Unit tests (specific examples / edge cases)
// ---------------------------------------------------------------------------
describe('canDeletePost — unit (table) cases', () => {
  const cases: {
    name: string;
    authorId: string;
    userId: string | undefined;
    profileType: ProfileType | undefined;
    expected: boolean;
  }[] = [
    {
      name: 'undefined userId returns false (Req 1.1)',
      authorId: 'author-1',
      userId: undefined,
      profileType: undefined,
      expected: false,
    },
    {
      name: 'undefined userId returns false even for a TEACHER profile (Req 1.1)',
      authorId: 'author-1',
      userId: undefined,
      profileType: 'TEACHER',
      expected: false,
    },
    {
      name: 'author match returns true (Req 1.2)',
      authorId: 'user-1',
      userId: 'user-1',
      profileType: 'STUDENT',
      expected: true,
    },
    {
      name: 'TEACHER non-author returns true (Req 1.3)',
      authorId: 'author-1',
      userId: 'teacher-1',
      profileType: 'TEACHER',
      expected: true,
    },
    {
      name: 'ADMIN non-author returns true (Req 1.4)',
      authorId: 'author-1',
      userId: 'admin-1',
      profileType: 'ADMIN',
      expected: true,
    },
    {
      name: 'STUDENT non-author returns false (Req 1.5)',
      authorId: 'author-1',
      userId: 'student-1',
      profileType: 'STUDENT',
      expected: false,
    },
    {
      name: 'unknown profileType non-author returns false (Req 1.6)',
      authorId: 'author-1',
      userId: 'other-1',
      profileType: 'MODERATOR' as unknown as ProfileType,
      expected: false,
    },
    {
      name: 'unknown profileType author returns true (Req 1.6)',
      authorId: 'user-1',
      userId: 'user-1',
      profileType: 'MODERATOR' as unknown as ProfileType,
      expected: true,
    },
    {
      name: 'undefined profileType author returns true (Req 1.2)',
      authorId: 'user-1',
      userId: 'user-1',
      profileType: undefined,
      expected: true,
    },
    {
      name: 'undefined profileType non-author returns false (Req 1.5)',
      authorId: 'author-1',
      userId: 'user-1',
      profileType: undefined,
      expected: false,
    },
  ];

  it.each(cases)('$name', ({ authorId, userId, profileType, expected }) => {
    expect(canDeletePost({ authorId }, userId, profileType)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Task 1.3 — Property tests (universal properties via fast-check)
// Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.7
// ---------------------------------------------------------------------------
describe('canDeletePost — properties', () => {
  // Property 2: Não logado nunca vê o botão — userId === undefined ⇒ always false.
  // Validates: Requirements 1.1
  it('Property 2: undefined userId always returns false', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.option(fc.constantFrom(...PROFILE_TYPES), { nil: undefined }),
        (authorId, profileType) => {
          expect(canDeletePost({ authorId }, undefined, profileType)).toBe(false);
        },
      ),
    );
  });

  // Property 3: Autor sempre pode — defined userId === post.authorId ⇒ always true.
  // Validates: Requirements 1.2
  it('Property 3: defined userId equal to authorId always returns true', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.option(fc.constantFrom(...PROFILE_TYPES), { nil: undefined }),
        (id, profileType) => {
          // Same identifier for author and logged user.
          expect(canDeletePost({ authorId: id }, id, profileType)).toBe(true);
        },
      ),
    );
  });

  // Property 4: Professor/Admin sempre podem — defined userId and
  // profileType ∈ {TEACHER, ADMIN} ⇒ always true.
  // Validates: Requirements 1.3, 1.4
  it('Property 4: defined userId with TEACHER or ADMIN always returns true', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string({ minLength: 1 }),
        fc.constantFrom<ProfileType>('TEACHER', 'ADMIN'),
        (authorId, userId, profileType) => {
          expect(canDeletePost({ authorId }, userId, profileType)).toBe(true);
        },
      ),
    );
  });

  // Property 5: Pureza do helper — same args return same value and arguments
  // are not mutated.
  // Validates: Requirements 1.7
  it('Property 5: determinism — same args yield the same result', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.option(fc.string(), { nil: undefined }),
        fc.option(fc.constantFrom(...PROFILE_TYPES), { nil: undefined }),
        (authorId, userId, profileType) => {
          const first = canDeletePost({ authorId }, userId, profileType);
          const second = canDeletePost({ authorId }, userId, profileType);
          expect(second).toBe(first);
        },
      ),
    );
  });

  it('Property 5: purity — arguments are not mutated', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.option(fc.string(), { nil: undefined }),
        fc.option(fc.constantFrom(...PROFILE_TYPES), { nil: undefined }),
        (authorId, userId, profileType) => {
          const post = { authorId };
          const postSnapshot = { ...post };
          canDeletePost(post, userId, profileType);
          // The post object (the only reference-type argument) is untouched.
          expect(post).toEqual(postSnapshot);
          expect(Object.keys(post)).toEqual(Object.keys(postSnapshot));
        },
      ),
    );
  });
});
