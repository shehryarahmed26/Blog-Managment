# Blog Management System (MERN + TypeScript)

Full-stack Blog Management System built as the **MERN Stack Developer Assessment** using TypeScript end-to-end.

- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + Joi
- **Frontend**: Vite + React + TypeScript + Tailwind CSS + React Router + Axios + **React Query** + **React Hook Form** + **Zod**
- **Database**: MongoDB Atlas (or any MongoDB URI)

---

## Features

### Backend
- JWT authentication with **refresh tokens** (rotate on refresh)
- Role-based authorization middleware (`admin`, `author`)
- Password hashing (bcrypt + salt)
- RESTful API for **posts**, **comments**, and **stats**
- Input validation (Joi) with a reusable `validate` middleware
- Central error handler with proper HTTP status codes
- Pagination, search (MongoDB text index on `title`/`tags`), and filtering
- Aggregation pipeline for post stats (`$facet`, `topAuthors`)
- Permissive CORS for any `localhost:*` origin in dev

### Frontend
- Auth flow with protected routes + role checks (`ProtectedRoute` component + `withAuth` HOC)
- `Context API` for auth state; auto-refresh of access tokens via axios interceptor
- **React Query** for all server state — query caching, background refetch, optimistic mutations with automatic rollback
- **React Hook Form + Zod** on every form (Login, Register, Post editor, Comment input)
- **Error boundary** wrapping the whole app
- Dashboard is role-aware (admin sees every post, author sees own)
- Public blog list with search and pagination
- Post editor with tags, draft/published status
- Centralized config, constants, and a semantic color theme — no hardcoded URLs, page sizes, routes, or color values in components

---

## Project structure

```
.
├── backend/                    Express + TS API
│   └── src/
│       ├── config/             db.ts
│       ├── controllers/        auth, post, comment
│       ├── middleware/         auth, authorize, validate, errorHandler
│       ├── models/             User, Post, Comment
│       ├── routes/             auth, post (+ nested comments), stats
│       ├── types/              express.d.ts
│       ├── utils/              tokens
│       ├── validators/         joi schemas
│       ├── app.ts
│       └── server.ts
├── frontend/                   Vite + React + TS SPA
│   └── src/
│       ├── api/                axios client (+ refresh interceptor) + endpoints
│       ├── components/         Navbar, PostCard, PostForm, Pagination,
│       │                       SearchBar, CommentList, ErrorBoundary, ProtectedRoute
│       ├── config/             env-driven app config (API URL, page sizes, limits)
│       ├── constants/          routes, api endpoints, storage keys, query keys, messages
│       ├── context/            AuthContext
│       ├── hoc/                withAuth
│       ├── hooks/              useAuth, usePosts (React Query), useComments (React Query)
│       ├── lib/                queryClient
│       ├── pages/              Home, Login, Register, Dashboard, PostEditor, PostDetail, NotFound
│       ├── schemas/            Zod schemas for every form
│       ├── types/
│       ├── App.tsx             QueryClientProvider + ErrorBoundary + Router + AuthProvider
│       └── main.tsx
└── docs/                       Assessment requirements
```

---

## Getting started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas connection string (or any `mongodb://` URI)

### 1. Backend

```bash
cd backend
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run dev                 # http://localhost:4000
```

**.env variables**
| name | description |
| --- | --- |
| `PORT` | default `4000` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | long random string |
| `JWT_REFRESH_SECRET` | long random string (different from `JWT_SECRET`) |
| `JWT_ACCESS_TTL` | default `15m` |
| `JWT_REFRESH_TTL` | default `7d` |
| `CORS_ORIGIN` | extra allowed origins (any `localhost:*` is already accepted in dev) |

### 2. Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:3000 (strictPort)
```

---

## Frontend architecture

### Config ([src/config/index.ts](frontend/src/config/index.ts))
Single source of truth for environment- and app-level values. Every component reads through it instead of hardcoding:

- `config.api.url` / `config.api.baseURL` — derived from `VITE_API_URL`
- `config.pagination.defaultPageSize` / `dashboardPageSize`
- `config.validation.*` — min/max lengths for titles, names, passwords, tags, comments
- `config.query.staleTimeMs` / `retry` — React Query defaults

### Constants ([src/constants/](frontend/src/constants/))
- `routes.ts` — every route path + builders (`ROUTES.POST_DETAIL(id)`)
- `api.ts` — every backend endpoint path (`API_ENDPOINTS.posts.byId(id)`)
- `queryKeys.ts` — typed query key factories
- `storage.ts` — localStorage keys
- `messages.ts` — user-facing strings

### Schemas ([src/schemas/index.ts](frontend/src/schemas/index.ts))
Zod schemas for every form — each exports both the schema and an inferred TS type:

```ts
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export type LoginFormValues = z.infer<typeof loginSchema>;
```

Wired into React Hook Form via `zodResolver`:

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
```

### Data layer — React Query
All server state flows through React Query. Hooks live in [src/hooks/](frontend/src/hooks/):

- `usePostsList(scope, filters)` — public or "mine"
- `usePost(id)` — single post
- `usePostStats()` — dashboard stats
- `useCreatePost()`, `useUpdatePost(id)`, `useDeletePost()`, `useSetPostStatus()` — **optimistic mutations** that patch every cached list query and roll back on failure
- `useComments(postId)`, `useCreateComment(postId, user)` — optimistic comment posting

### Auth
- Access token in memory, refresh token in `localStorage`.
- Axios response interceptor catches `401`, single-flight refresh, retries once.
- `AuthContext` exposes `{ user, loading, login, register, logout }` via `useAuth()`.
- `<ProtectedRoute>` redirects unauthenticated to `/login`; `withAuth(Component, role?)` does the same via HOC.

### Color theme ([tailwind.config.js](frontend/tailwind.config.js) + [src/index.css](frontend/src/index.css))
Semantic tokens — use these in components instead of raw palette names:

| Token | Purpose |
| --- | --- |
| `brand-{50..900}` | primary accent (indigo) |
| `surface` / `surface-muted` / `surface-subtle` / `surface-border` | backgrounds & borders |
| `content` / `content-muted` / `content-subtle` / `content-inverted` | text levels |
| `success-{50,500,600,700}` | success states (published tag) |
| `warning-{50,500,600,700}` | warning states (draft tag) |
| `danger-{50,500,600,700}` | destructive/error |

Component classes in `@layer components`: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.input`, `.input-error`, `.label`, `.card`, `.tag`, `.tag-success`, `.tag-warning`, `.form-error`.

---

## API reference

All JSON. Auth via `Authorization: Bearer <accessToken>`.

### Auth
| Method | Path | Body | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ name, email, password, role? }` | — |
| `POST` | `/api/auth/login` | `{ email, password }` | — |
| `POST` | `/api/auth/refresh` | `{ refreshToken }` | — |
| `GET` | `/api/auth/me` | — | ✅ |

### Posts
| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/posts` | Public. Query: `search`, `tag`, `page`, `limit`, `sortBy`, `order`. Published only. |
| `GET` | `/api/posts/my` | Author: own posts. Admin: all posts. |
| `GET` | `/api/posts/:id` | Drafts only visible to owner/admin. |
| `POST` | `/api/posts` | Authors/admins. |
| `PUT` | `/api/posts/:id` | Owner/admin. |
| `DELETE` | `/api/posts/:id` | Owner/admin. |
| `PATCH` | `/api/posts/:id/status` | `{ status: 'draft' \| 'published' }` — owner/admin. |

### Comments
| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/posts/:id/comments` | Public. |
| `POST` | `/api/posts/:id/comments` | Authenticated. `{ content }`. |

### Stats
| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/stats/posts` | Authenticated. Returns `{ totalPosts, publishedPosts, draftPosts, topAuthors }`. |

### Sample response — `GET /api/posts`
```json
{
  "posts": [
    {
      "_id": "...",
      "title": "Getting Started with React",
      "content": "...",
      "author": { "_id": "...", "name": "John" },
      "status": "published",
      "tags": ["react"],
      "createdAt": "2026-04-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalPosts": 12,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Promoting a user to admin

Users register as `author` by default. To promote someone to `admin`, update their document in MongoDB Atlas:

```js
db.users.updateOne({ email: 'you@example.com' }, { $set: { role: 'admin' } });
```

(Alternatively, pass `"role": "admin"` on `POST /api/auth/register` — useful for seeding your first admin.)

---

## Deployment

- **Frontend** → Vercel or Netlify. Set `VITE_API_URL` to your deployed backend URL. Build command: `npm run build`. Output dir: `dist`.
- **Backend** → Render / Railway / Fly.io / Heroku. Set all env vars from `.env.example`. Build: `npm run build`. Start: `npm start`.
- Set `CORS_ORIGIN` on the backend to the deployed frontend origin.

---

## Scripts

### Backend
```
npm run dev          # ts-node-dev with auto-restart
npm run build        # tsc → dist/
npm start            # node dist/server.js
npm run typecheck
```

### Frontend
```
npm run dev          # Vite dev server
npm run build        # tsc + vite build
npm run preview      # serve the production build
npm run typecheck
```
