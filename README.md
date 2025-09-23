# Task Management System

A role-based task management system built with **Angular**, **NestJS**, and **TypeORM** inside an **NX monorepo**.  
Supports organizations, roles, and permissions with JWT authentication.

---

## Setup Instructions

### Prerequisites
- Node.js (>=18)
- PostgreSQL (or SQLite for local development)
- NX CLI: `npm install -g nx`

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd task-management
````

### 2. Install dependencies

```bash
npm install
```

### 3. Environment setup

Create a `.env` file at the project root with the following variables:

```env
# JWT
JWT_SECRET=supersecretkey
JWT_EXPIRATION=1h


```

### 4. Run the backend (NestJS API)

```bash
nx serve api
```

API will start at `http://localhost:3000`.

### 5. Run the frontend (Angular dashboard)

```bash
nx serve dashboard
```

Dashboard will start at `http://localhost:4200`.

---

## Architecture Overview

This project uses an **NX monorepo** to keep backend and frontend in one place with shared libraries.

```
apps/
  api/        # NestJS backend
  dashboard/  # Angular frontend
libs/
  data/       # Shared DTOs and types
  auth/       # Shared auth logic and decorators
```

* **apps/api**: All backend logic (controllers, services, guards).
* **apps/dashboard**: Angular UI with login/logout, task dashboard.
* **libs/data**: Shared TypeScript models (`UserDto`, `TaskDto`) used by both frontend and backend.

---

## Data Model Explanation

Entities:

* **User**

  * `id`, `username`, `password`
  * Belongs to one `Organization`
  * Has many `Roles`
  * Has many `Tasks`
* **Role**

  * `id`, `name` (e.g., Owner, Admin, User)
  * Has many `Permissions`
* **Permission**

  * `id`, `name` (e.g., `CREATE_TASK`, `UPDATE_TASK`)
* **Organization**

  * `id`, `name`
 
* **Task**

  * `id`, `title`, `status` (`todo`, `inprogress`, `done`)
  * Belongs to one `Organization`
  * Has one `Owner` (User)

---

## Access Control Implementation

* Users belong to an **organization**.
* Each user has one or more **roles**.
* Roles have **permissions**.
* **JWT payload** includes:

  ```json
  {
    "sub": "userId",
    "username": "johndoe",
    "roles": ["Admin"],
    "permissions": ["task:create", "task:update"],
    "organization": { "id": "org1", "name": "Acme Corp" }
  }
  ```

### Rules

* **Owner**: Full rights in their organization (create, update, delete, assign).
* **Admin**: Can create and update tasks within their organization.
* **User**: Can only view tasks.
* All actions are scoped to the user’s organization.

### JWT Integration

* `AuthGuard` verifies token.
* `RolesGuard` and custom decorators enforce role/permission checks.
* Example:

  ```ts
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Owner')
  @Post('tasks')
  createTask() { ... }
  ```

---

## API Documentation

### Auth

#### `POST /auth/login`

Request:

```json
{
  "username": "johndoe",
  "password": "secret"
}
```

Response:

```json
{
  "access_token": "jwt.token.here",
  "user" : "User Data"
}
```

---

### Tasks

#### `GET /tasks`

* Returns all tasks for the user’s organization.

Response:

```json
[
  {
    "id": "1",
    "title": "Prepare report",
    "status": "inprogress",
    "owner": { "id": "2", "username": "alice" },
    "organization": { "id": "1", "name": "Acme Corp" }
  }
]
```

---

#### `POST /tasks`

* **Owner/Admin only**
  Request:

```json
{
  "title": "New Task"
}
```

Response:

```json
{
  "id": "2",
  "title": "New Task",
  "status": "todo",
  "owner": { "id": "1", "username": "johndoe" },
  "organization": { "id": "1", "name": "Alpha Corp" }
}
```

---

#### `PUT /tasks/:id`

* **Owner/Admin** can update tasks in their org.
* **Task owner** can update their own tasks.

Request:

```json
{
  "title": "Updated Task",
  "status": "done"
}
```

Response:

```json
{
  "id": "2",
  "title": "Updated Task",
  "status": "done"
}
```

---

#### `DELETE /tasks/:id`

* **Owner only**

Response:

```json
{ "message": "Task deleted successfully" }
```

---

## Frontend Features

* Login/logout with JWT.
* Dashboard shows tasks, task count, and organization name.
* Admin/Owner can create, update, assign, and delete tasks.
* Regular users can only view.
* Tasks can be filtered by status and sorted by title, status, or owner.
* Toast notifications show success/error messages.
