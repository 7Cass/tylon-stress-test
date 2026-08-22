# tylon-stress-test 🚀

This repository is a NestJS API for Tylon.

## Project status 🟢

- In development
- Focused on authentication and user flows
- Ready to evolve with the card workflow

## Routes

### GET /health

Public health check route that returns the application status.

**Response**

```json
{ "status": "ok" }
```

### POST /auth/login

Public authentication route that issues a JWT access token.

**Request body**

```json
{ "email": "user@example.com", "password": "secret" }
```

**Response**

```json
{ "access_token": "<jwt>" }
```

### POST /users

Public route that creates a user.

**Request body**

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "username": "testuser",
  "password": "secret"
}
```

**Response**

Returns the created user without the password field.

### GET /users

Protected route that lists all users.

### GET /users/:id

Protected route that returns a user by id.

### PATCH /users/:id

Protected route that updates a user by id.

**Request body**

```json
{ "name": "Updated Name" }
```

### DELETE /users/:id

Protected route that deletes a user by id.

## Simple API (NestJS) ⚙️

### Install 📦

```bash
npm install
```

### Build 🧱

```bash
npm run build
```

### Dev (watch / hot reload) 🔄

```bash
npm run dev
```

### Test ✅

```bash
npm run test
```

### E2E 🧪

```bash
npm run test:e2e
```

JWT secret for local development and tests:

```bash
JWT_SECRET=tylon-stress-test-dev-secret
```
