# CodeReview AI

An AI-powered code review tool that analyzes your code for bugs, security issues, and improvements — instantly.

Built with Node.js, React, OpenAI, PostgreSQL, and GitHub OAuth.

---

## Features

- **AI Code Analysis** — Paste any code and get a quality score, bug report, and improvement suggestions powered by GPT-4o-mini
- **Multi-language support** — JavaScript, TypeScript, Python, Java, Go, Rust, C, C++, Ruby, PHP
- **GitHub Login** — Secure OAuth authentication
- **Review History** — Every review is saved to your account so you can track improvement over time
- **VS Code-style Editor** — Monaco Editor embedded in the browser for a familiar coding experience
- **Severity-tagged bugs** — Critical, warning, and info level issues clearly labeled
- **Rate limiting** — Production-ready API with request throttling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Monaco Editor |
| Backend | Node.js, Express |
| AI | OpenAI API (GPT-4o-mini) |
| Auth | GitHub OAuth, Passport.js, express-session |
| Database | PostgreSQL (Supabase) |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Screenshots

> _Add screenshots here once deployed_

---

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key — [platform.openai.com](https://platform.openai.com)
- GitHub OAuth App — [github.com/settings/developers](https://github.com/settings/developers)
- Supabase project — [supabase.com](https://supabase.com)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your keys in .env
node src/db/init.js   # creates database tables (run once)
npm run dev           # starts on http://localhost:3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev           # starts on http://localhost:5173
```

### Environment Variables

Create a `.env` file in the `backend/` folder:

```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=any_long_random_string
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/health` | Server status | No |
| GET | `/auth/github` | Start GitHub OAuth | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | Logout | Yes |
| POST | `/api/review` | Submit code for review | Yes |
| GET | `/api/review/history` | Get review history | Yes |
| GET | `/api/review/:id` | Get single review | Yes |

---

## Project Structure

```
├── backend/
│   └── src/
│       ├── db/             # Database connection, init, queries
│       ├── middleware/     # Auth guard, rate limiter, validation, error handler
│       ├── routes/         # Express route handlers
│       └── services/       # OpenAI integration, Passport config
└── frontend/
    └── src/
        ├── components/     # ReviewPanel, ScoreRing
        ├── context/        # Auth context (global user state)
        ├── hooks/          # useReview custom hook
        └── pages/          # Login, Dashboard, History
```

---

## Roadmap

- [ ] Deploy to production
- [ ] VS Code extension
- [ ] Shareable review links
- [ ] Side-by-side diff viewer for AI-suggested refactors
- [ ] Usage dashboard with review trends over time

---

## License

MIT
