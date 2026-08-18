# Fun School 🎒

A fun web app with math, Hebrew, and English games for Israeli 3rd grade (כיתה ג').

## Subjects & Games

| Subject | Games |
|---------|-------|
| **Math** | Multiplication Boss, Shuk Challenge, Mystery Number |
| **Hebrew** | Word Scramble, Fix the Sentence, Story Detective |
| **English (Beginners)** | Word Match, Build a Sentence, Colors & Numbers |
| **English (Advanced)** | Grammar Quest, Word Wizard, Reading Challenge |

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel via GitHub

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Fun School app"
gh repo create fun-school --public --source=. --push
```

Or create a repo manually on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/fun-school.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your `fun-school` GitHub repository
4. Vercel auto-detects Next.js — click **Deploy**
5. Done! Your app will be live at `https://fun-school-xxx.vercel.app`

Every push to `main` will automatically redeploy.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS 4](https://tailwindcss.com/)
- TypeScript
- Deployed on [Vercel](https://vercel.com/)
