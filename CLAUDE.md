# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains **UIGen**, an AI-powered React component generator built as a learning project for the Claude Code in Action course. The application uses Claude AI to generate React components based on user descriptions, with a live preview system and virtual file system.

## Directory Structure

The main project is in the `uigen/` directory. All commands below assume you're working from `uigen/`.

## Development Commands

### Setup
```bash
npm run setup
```
Installs dependencies, generates the Prisma client, and runs database migrations. Run this once when starting fresh.

### Start Development Server
```bash
npm run dev
```
Starts the Next.js dev server with Turbopack at http://localhost:3000. The API key from `.env` is read at startup, so restart the server if you add/change `ANTHROPIC_API_KEY`.

### Build & Deploy
```bash
npm run build       # Build for production
npm run start       # Start production server
```

### Linting
```bash
npm run lint
```
Runs ESLint. Uses Next.js config.

### Testing
```bash
npm run test                    # Run all tests with Vitest
npm run test -- <pattern>       # Run specific test file
npm run test -- --watch         # Watch mode
```
Tests use Vitest with jsdom environment. Test files are colocated with source code in `__tests__` directories.

### Database
```bash
npm run db:reset
```
Resets the SQLite database and re-runs migrations. Useful for cleaning state during development.

## Architecture

### Tech Stack
- **Frontend**: React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Next.js API routes, Prisma ORM with SQLite
- **AI**: Anthropic Claude via AI SDK (Vercel ai package)
- **Components**: Radix UI primitives, custom shadcn-style components

### Key Components

**Chat System** (`src/lib/contexts/chat-context.tsx`)
- Manages conversation state and streaming text from Claude
- Uses Vercel's AI SDK for streaming chat responses
- Integrates with the virtual file system for tool-based code generation

**Virtual File System** (`src/lib/file-system.ts`)
- In-memory file system (no files written to disk)
- Stores generated React components and assets
- Serializable/deserializable for database persistence
- Provides methods to create, read, update, delete files and directories

**AI Tools** (`src/lib/tools/`)
- `str_replace_editor`: Allows Claude to edit file content
- `file_manager`: Allows Claude to create/delete files and directories
- Both tools operate on the virtual file system

**Authentication** (`src/lib/auth.ts`)
- JWT-based session management with bcrypt for passwords
- Supports both authenticated users and anonymous sessions
- Stored in database for authenticated users, local state for anonymous

**Code Transform** (`src/lib/transform/jsx-transformer.ts`)
- Transforms JSX code for safe execution in the preview iframe
- Uses Babel standalone to parse and execute code

### Page Structure

- `src/app/page.tsx`: Home page — authenticates user, redirects to project or shows anonymous MainContent
- `src/app/[projectId]/page.tsx`: Project page — loads project data and passes to MainContent
- `src/app/main-content.tsx`: Main UI layout with three resizable sections:
  - **Left**: ChatInterface for user prompts
  - **Right**: Tabs for Preview (live iframe) and Code (Monaco editor)
- `src/app/api/chat/route.ts`: Server-side chat endpoint — streams text with tool use, persists projects to database

### Database Schema

Two main models:
- **User**: Email, bcrypt password hash, relations to projects
- **Project**: Name, messages (JSON), data (serialized file system), userId, timestamps

Anonymous sessions are not persisted; authenticated users can save/load projects.

### Context Providers

- **FileSystemProvider** (`src/lib/contexts/file-system-context.tsx`): Exposes virtual file system to React components
- **ChatProvider** (`src/lib/contexts/chat-context.tsx`): Manages chat messages and streaming state

## Environment Variables

- `ANTHROPIC_API_KEY`: Optional. Without it, the app falls back to a mock LLM provider that returns static code.

## Code Style & Conventions

- Uses TypeScript throughout
- Components are `.tsx` files, server actions are `.ts`
- Path alias `@/` points to `src/`
- Tests are colocated in `__tests__` directories
- Use `"use client"` directive for client components in App Router
- Server actions are in `src/actions/` directory

## Common Development Workflows

**Adding a new database model:**
1. Update `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name <name>`
3. Use generated Prisma client in API routes

**Debugging AI generation:**
- Check `src/lib/prompts/generation.ts` for the system prompt
- Monitor tool calls in browser DevTools (Network tab for `/api/chat`)
- The mock provider (when no API key) returns static code for testing

**Testing file system operations:**
- Tests are in `src/lib/__tests__/file-system.test.ts`
- The VirtualFileSystem class is isolated and testable

## Notes

- The UI uses resizable panels; component layout is defined in `main-content.tsx`
- Monaco editor for code display, with custom JSX syntax highlighting
- Preview iframe runs generated code in isolation for safety
- Project data is stored as JSON strings in the database for flexibility

## Git Sync Policy

**Always commit and push changes to GitHub after making edits.** This repo is synced to `csecnarf/Claude-Code-in-Action` on GitHub (remote: `origin`, branch: `master`).

After completing any work session or set of changes:
```bash
git add -A
git commit -m "describe what changed"
git push origin master
```

A Claude Code `Stop` hook in `.claude/settings.json` automates this — it runs after every session end. The hook commits any staged changes with an auto-generated timestamp message and pushes to `origin master`.
