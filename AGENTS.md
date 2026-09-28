# TOEIC Platform - AI Pair Programming Guidelines & Rules

## 1. Project Overview & Architecture
This repository is an **Adaptive TOEIC Prep Platform with AI** structured as an npm workspaces monorepo:
- **`frontend/`**: Next.js 16 (App Router, React 19, Tailwind CSS, TypeScript).
- **`backend/`**: NestJS 12 (Modular Clean Architecture, Prisma ORM, PostgreSQL, Redis, BullMQ).
- **`docs/` & `frontend/docs/requirements.md`**: Master requirements & system architecture specifications.

---

## 2. General Engineering Principles
- **TypeScript Strictness**: Always write strictly typed code. Avoid `any` unless absolutely necessary for external legacy libraries.
- **Single Source of Truth**: All database entity definitions must originate from `backend/prisma/schema.prisma`.
- **Stateless Backend**: Design all NestJS services to be stateless so they can scale horizontally behind Nginx / Load Balancer.
- **Fail Gracefully**: Never crash the main event loop. Always wrap external integrations (LLM APIs, Redis, Object Storage) in try-catch with fallback logic and user-friendly error messages.

---

## 3. Backend (NestJS & Prisma) Rules
1. **Modular Architecture**:
   - Organize domain logic into self-contained modules (`auth`, `users`, `exams`, `questions`, `submissions`, `queues`, `ai`, `flashcards`).
   - Each module should expose clear `Controllers`, `Services`, `DTOs` (with `class-validator`), and necessary providers.
2. **Database Access with Prisma**:
   - Always inject `PrismaService` from `src/prisma/prisma.module.ts`.
   - Never write raw SQL unless performing heavily optimized batch calculations (e.g. ETS percentile rank computation).
   - Whenever updating `schema.prisma`, run `npm run prisma:generate` to regenerate `@prisma/client`.
   - Ensure `datasource db { provider = "postgresql" url = env("DATABASE_URL") }` is maintained for Prisma CLI migrations.
3. **Authentication & Authorization**:
   - Use JWT for Access Token (short-lived, 15m) and Refresh Token Rotation (7d).
   - Secure routes using NestJS Guards: `@UseGuards(JwtAuthGuard, RolesGuard)` and custom decorator `@Roles(Role.ADMIN)`.

---

## 4. Frontend (Next.js & UI/UX) Rules
1. **App Router Conventions**:
   - Prefer Server Components (RSC) for marketing pages, SEO routes, and static exam listings.
   - Use Client Components (`'use client'`) for interactive components: `ExamRunner`, `AudioPlayer`, `AITutorChat`, `FlashcardDeck`.
2. **State Management**:
   - Use **Zustand** for local exam sessions (timer, answers grid, bookmarks, current question index).
   - Use **TanStack Query** for server state fetching, caching, mutation, and invalidation.
3. **UX & Audio Reliability**:
   - Part 1–4 Listening test runner must provide keyboard shortcuts (`Space` to toggle, `J` for -5s, `L` for +5s).
   - Always auto-save student answers to `localStorage` / `IndexedDB` to protect against network drops during mock exams.
4. **Styling & Aesthetics**:
   - Modern, clean, accessible UI using Tailwind CSS.
   - Support responsive layouts (Desktop split-screen for Part 6/7 passages + questions; mobile scroll-friendly).

---

## 5. Asynchronous Processing & AI Rules
1. **BullMQ / Redis Queue**:
   - Heavy tasks (grading 200-question tests, generating batch AI explanations, audio transcoding) MUST be dispatched to BullMQ queues.
   - Web controllers should return immediate job IDs (`202 Accepted`) rather than blocking HTTP responses.
2. **AI Integration**:
   - Always enforce structured outputs using JSON Schema for LLM calls (e.g., breakdown of why options A, B, C, D are correct/wrong).
   - Apply **Two-tier Caching**: check Redis (TTL 30 days) and PostgreSQL `QuestionExplanation` before invoking third-party LLM APIs.
