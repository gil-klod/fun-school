# Fun School 🎒

A fun web app with math, Hebrew, and English games for Israeli 3rd grade (כיתה ג').

## Features

- **User accounts** — name, email, password with email verification
- **Progress tracking** — every game saves score, streak, and in-progress state
- **Continue where you left off** — banner on home page resumes last unfinished game
- **AI analytics dashboard** — strengths, weaknesses, and personalized tips

## Subjects & Games

| Subject | Games |
|---------|-------|
| **Math** | Multiplication Boss, Shuk Challenge, Mystery Number |
| **Hebrew** | Word Scramble, Fix the Sentence, Story Detective |
| **English (Beginners)** | Word Match, Build a Sentence, Colors & Numbers |
| **English (Advanced)** | Grammar Quest, Word Wizard, Reading Challenge |

## Setup

### 1. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `AUTH_SECRET` | Yes | Random secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (e.g. `https://fun-school-eight.vercel.app`) |
| `RESEND_API_KEY` | For email | Resend API key for verification emails |
| `EMAIL_FROM` | For email | Sender address (must be verified in Resend) |
| `OPENAI_API_KEY` | Optional | Enables AI-powered learning feedback |

Without `RESEND_API_KEY`, verification links are printed to the server console (dev mode).

### 2. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://cloud.mongodb.com)
2. Create a database user and allow network access (0.0.0.0/0 for Vercel)
3. Copy the connection string to `MONGODB_URI`

### 3. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

Add all environment variables in **Vercel → Project → Settings → Environment Variables**, then push to `main`.

Live app: [fun-school-eight.vercel.app](https://fun-school-eight.vercel.app)

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [NextAuth.js](https://authjs.dev/) — authentication
- [MongoDB](https://mongodb.com/) + Mongoose — user data & progress
- [Resend](https://resend.com/) — email verification
- [OpenAI](https://openai.com/) — optional AI analytics
- [Tailwind CSS 4](https://tailwindcss.com/)
