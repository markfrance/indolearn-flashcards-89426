# IndoLearn Flashcards API (Express + PostgreSQL)

This backend provides REST endpoints for authentication, users, flashcards, categories, quizzes, and statistics, with JWT-based auth and spaced repetition.

- Docs: /docs (Swagger UI)
- Health: GET /
- Default Port: 3001 (override with env PORT)

## Environment

Copy `.env.example` to your environment (variables set by orchestrator):
- JWT_SECRET (required)
- POSTGRES_URL or POSTGRES_HOST/PORT/USER/PASSWORD/DB
- POSTGRES_SSL (true/false)

## Scripts

- npm run dev
- npm start
- npm run openapi

## Routes

- /auth: register, login, logout, oauth (stub)
- /users: profile get/update (requires Bearer token)
- /flashcards: CRUD & search (admin required for mutations)
- /categories: CRUD (admin required for mutations)
- /quizzes: create quiz, submit answers, get results
- /stats/overview: user progress

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

## Notes

- OAuth endpoint is a placeholder.
- Ensure database schema includes tables: users, flashcards, user_flashcards, categories, quizzes, quiz_attempts, review_logs.
