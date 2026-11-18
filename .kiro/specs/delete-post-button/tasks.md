# Implementation Plan: Delete Post Button

## Overview

Frontend-only feature in `apps/frontend/src` (React + TypeScript + Tailwind). The plan builds bottom-up: first the pure permission helper, then the two reusable components (`ConfirmDialog`, `DeletePostButton`), then integration into the two screens, and finally the `App.tsx` prop wiring. The existing delete layers (`useDeletePost`, `forumService.deletePost`, `DELETE /forum/posts/:id`) are reused unchanged.

Tests are colocated next to the unit under test (matching `components/PontosGanhosToast.test.tsx`) and run through the existing Vitest setup at `apps/frontend/src/test/setup.ts`, exercised by `.github/workflows/test.yml`. Property tests use `fast-check` as chosen in the design.

## Tasks

- [x] 1. Implement the permission helper
  - [x] 1.1 Create `canDeletePost` pure helper
    - Create `apps/frontend/src/utils/forumPermissions.ts`
    - Export `canDeletePost(post: Pick<ForumPost, 'authorId'>, userId: string | undefined, profileType: ProfileType | undefined): boolean`
    - Import `ForumPost` and `ProfileType` from `../types/forum.types`
    - Return `false` when `userId === undefined`; `true` when `post.authorId === userId`; `true` when `profileType === 'TEACHER'`; `true` when `profileType === 'ADMIN'`; `false` otherwise
    - No argument mutation, no network calls — pure function
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x]* 1.2 Write unit tests for `canDeletePost`
    - Create `apps/frontend/src/utils/forumPermissions.test.ts`
    - Table of cases: undefined userId, author match, TEACHER, ADMIN, STUDENT non-author, unknown profileType non-author vs author
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x]* 1.3 Write property test for `canDeletePost`
    - Add to `apps/frontend/src/utils/forumPermissions.test.ts` using `fast-check`
    - **Property 2: Não logado nunca vê o botão** — `userId === undefined` ⇒ always `false`
    - **Property 3: Autor sempre pode** — defined `userId === post.authorId` ⇒ always `true`
    - **Property 4: Professor/Admin sempre podem** — defined `userId` and `profileType ∈ {TEACHER, ADMIN}` ⇒ always `true`
    - **Property 5: Pureza do helper** — same args return same value, arguments not mutated
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.7**

- [x] 2. Implement the ConfirmDialog component
  - [x] 2.1 Create `ConfirmDialog` reusable modal
    - Create `apps/frontend/src/components/ConfirmDialog.tsx`
    - Follow the `screens/CreatePostModal.tsx` pattern (overlay controlled by `isOpen`, Tailwind-styled buttons, internal error display)
    - Props: `isOpen`, `title`, `message`, `confirmLabel?` (default "Excluir"), `cancelLabel?` (default "Cancelar"), `loading?`, `errorMessage?`, `onConfirm`, `onCancel`
    - Render `null` when `isOpen === false`
    - When `loading`: disable both buttons (ignore click/keyboard) and replace confirm label with "Excluindo..."
    - When not `loading`: restore confirm label and re-enable both buttons
    - Display `errorMessage` when present while keeping the dialog open
    - _Requirements: 3.1, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2_

  - [x]* 2.2 Write unit tests for `ConfirmDialog`
    - Create `apps/frontend/src/components/ConfirmDialog.test.tsx`
    - Renders nothing when `isOpen === false`; renders title/message/buttons when open
    - `loading` disables both buttons and shows "Excluindo..."; repeated confirm click while loading does not re-fire `onConfirm`
    - Displays `errorMessage` while remaining open; `onConfirm`/`onCancel` fire on respective controls
    - _Requirements: 3.1, 3.4, 4.1, 4.2, 4.3, 4.5, 5.1, 5.2_

- [x] 3. Implement the DeletePostButton component
  - [x] 3.1 Create `DeletePostButton` encapsulating permission, confirm, and delete
    - Create `apps/frontend/src/components/DeletePostButton.tsx`
    - Props: `post: ForumPost`, `userId?`, `userProfileType?`, `onDeleted: () => void`, `stopPropagation?`, `className?`, `variant?: 'icon' | 'menu-item'`
    - Return `null` when `canDeletePost(post, userId, userProfileType)` is not strictly `true`
    - Render a delete control (`Trash2` from `lucide-react`) wired to the post id
    - On click: if `stopPropagation`, call `e.stopPropagation()` before any delete action; open `ConfirmDialog`
    - Use `useDeletePost` from `../hooks/useForum`; pass hook `loading` into `ConfirmDialog`; clear prior error before each confirm
    - On confirm: call `deletePost(post.id)` exactly once; on success close dialog and call `onDeleted` exactly once (guard against duplicate success); on failure keep dialog open showing the hook `error` and do not call `onDeleted`
    - _Requirements: 2.1, 2.2, 2.5, 3.2, 3.3, 3.4, 3.5, 4.1, 5.3, 5.4, 5.5, 6.1, 6.4, 6.6, 7.1_

  - [x]* 3.2 Write unit tests for `DeletePostButton`
    - Create `apps/frontend/src/components/DeletePostButton.test.tsx` with `useDeletePost` mocked
    - Renders `null` when not permitted; opens dialog on click; calls `deletePost(post.id)` once only after confirm
    - Calls `onDeleted` only on success (close dialog); keeps dialog open and shows error on failure, no `onDeleted`
    - Calls `e.stopPropagation()` when `stopPropagation` prop is set; ignores duplicate success reports
    - **Property 6: Confirmação obrigatória** — no `deletePost` call without confirming
    - _Requirements: 2.1, 2.2, 2.5, 3.2, 3.3, 3.5, 5.3, 5.4, 5.5, 6.6, 7.1_

- [x] 4. Checkpoint - Ensure helper and components pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate DeletePostButton into the list screen
  - [x] 5.1 Add `userProfileType` prop and mount button in `comunidadepostscreen.tsx`
    - Edit `apps/frontend/src/screens/comunidadepostscreen.tsx`
    - Add optional prop `userProfileType?: ProfileType` to the screen's props (import `ProfileType` from `../types/forum.types`)
    - Mount exactly one `DeletePostButton` in each post card's footer region with `stopPropagation`, `variant="icon"`, delete-styled `className`, and `onDeleted={() => refetch()}`
    - Pass `post`, `userId`, and `userProfileType` to the button so card navigation is not triggered when the delete control is activated
    - _Requirements: 2.1, 2.2, 2.3, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4_

  - [x]* 5.2 Write integration test for list screen deletion
    - Create `apps/frontend/src/screens/comunidadepostscreen.test.tsx` with forum hooks mocked
    - Button appears only on permitted posts; confirming deletion calls `refetch` exactly once and removes the post; clicking the delete control does not trigger card navigation
    - **Property 7: Clique isolado na lista** and **Property 8: Pós-sucesso correto (lista)**
    - _Requirements: 2.3, 6.2, 6.3, 7.2, 7.3_

- [x] 6. Integrate DeletePostButton into the detail screen
  - [x] 6.1 Add `userProfileType` prop and mount button in `PostDetalheScreen.tsx`
    - Edit `apps/frontend/src/screens/PostDetalheScreen.tsx`
    - Add optional prop `userProfileType?: ProfileType` to the screen's props
    - Mount exactly one `DeletePostButton` in the main post's author header region, beside the existing "Mais opções" (`Ellipsis`) control, with `variant="icon"`, delete-styled `className`, and `onDeleted={onBack}`
    - Pass `post`, `userId`, and `userProfileType` to the button
    - _Requirements: 2.1, 2.4, 6.5_

  - [x]* 6.2 Write integration test for detail screen deletion
    - Create `apps/frontend/src/screens/PostDetalheScreen.test.tsx` with forum hooks mocked
    - Button appears only when permitted; confirming deletion calls `onBack` exactly once
    - **Property 8: Pós-sucesso correto (detalhe)**
    - _Requirements: 2.4, 6.5_

- [x] 7. Wire user profile type through App.tsx
  - [x] 7.1 Propagate `userId` and `userProfileType` to both screens
    - Edit `apps/frontend/src/App.tsx`
    - Pass `userId={usuario?.id}` and `userProfileType={usuario?.profileType}` to both `ComunidadePostScreen` and `PostDetalheScreen` within the same render cycle
    - When no logged user is present, both values resolve to `undefined`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references specific requirement clauses for traceability.
- Property tests validate the universal correctness properties from the design (fast-check); unit and integration tests cover specific examples and edge cases.
- The delete service layer (`useDeletePost`, `forumService.deletePost`, `DELETE /forum/posts/:id`) is reused unchanged.
- Tests are colocated with their units and run via the existing Vitest setup (`apps/frontend/src/test/setup.ts`) and CI (`.github/workflows/test.yml`).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "5.1", "6.1", "7.1"] },
    { "id": 4, "tasks": ["5.2", "6.2"] }
  ]
}
```
