# PFE Management Platform — Faculté Polydisciplinaire de Taroudant

A full-stack web application for managing **End-of-Studies Projects (PFE)** at the Faculté Polydisciplinaire de Taroudant (FPT). It provides a centralized workspace for students, coordinators, and administrators to handle team formation, project assignment, observations, evaluations, and real-time communication.

---

## 🌐 Live Demo

> Deployed on **Vercel** — [https://pfe-fpt.vercel.app](https://pfe-fpt.vercel.app)

---

## ✨ Features

### 👨‍🎓 Students (Team Leaders)
- Register and create a project team
- Add team members with personal details (CIN, CNE, GitHub, LinkedIn)
- Submit a project proposal and track its approval status
- Receive observations from their coordinator
- Chat with their assigned coordinator

### 👨‍💼 Coordinators
- View and manage all assigned teams
- Approve or reject team registrations
- Create and assign projects to teams
- Post observations on team progress
- Evaluate teams with a numeric score
- Chat with each team

### 🛡️ Administrators (Super Admin)
- Manage all users (view, delete)
- Manage coordinators and assign them to teams
- Manage all projects
- View platform-wide statistics (users, teams, projects)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Database** | MySQL (hosted on [Clever Cloud](https://www.clever-cloud.com/)) |
| **ORM** | [Prisma 5](https://www.prisma.io/) |
| **Auth** | JWT (JSON Web Tokens) with custom Next.js middleware |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with custom FPT brand theme |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🗄️ Database Schema

```
User          → Role: TEAM_LEADER | COORDINATOR | SUPER_ADMIN
Team          → Status: PENDING | APPROVED | REJECTED
TeamMember    → belongs to Team
Project       → Status: OPEN | ASSIGNED | CLOSED
Observation   → posted by Coordinator on a Team
Message       → chat messages between Team and Coordinator
```

---

## 📁 Project Structure

```
pfe-app/
├── prisma/
│   └── schema.prisma           # Database models & relations
├── public/
│   └── fpt-logo.png            # FPT branding assets
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page (AR/FR/EN)
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── dashboard/          # Student portal
│   │   │   ├── page.tsx        # Overview stats
│   │   │   ├── team/           # Team management
│   │   │   ├── projects/       # Available projects
│   │   │   ├── remarks/        # Observations received
│   │   │   └── chat/           # Chat with coordinator
│   │   ├── coordinator/        # Coordinator portal
│   │   │   ├── page.tsx        # Overview stats
│   │   │   ├── teams/          # All teams
│   │   │   ├── my-teams/       # Assigned teams
│   │   │   ├── projects/       # Project management
│   │   │   ├── observations/   # Post observations
│   │   │   ├── evaluations/    # Evaluate teams
│   │   │   └── chat/           # Chat with teams
│   │   ├── admin/              # Admin portal
│   │   │   ├── page.tsx        # Overview stats
│   │   │   ├── users/          # User management
│   │   │   ├── coordinators/   # Coordinator management
│   │   │   ├── projects/       # Project management
│   │   │   └── stats/          # Platform statistics
│   │   └── api/                # REST API routes (auth, teams, projects...)
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar (desktop)
│   │   ├── MobileHeader.tsx    # Hamburger menu (mobile)
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   └── prisma.ts           # Prisma client singleton
│   └── middleware.ts            # JWT auth & role-based route protection
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MySQL database (local or cloud)

### 1. Clone the repository

```bash
git clone https://github.com/Hicham-in-tech/PFE_fpt.git
cd PFE_fpt/pfe-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# MySQL database connection string
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE?ssl=true&sslaccept=accept_invalid_certs"

# JWT secret — use a long random string in production
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Push the database schema

```bash
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add these **Environment Variables** in the Vercel project settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NEXT_PUBLIC_APP_URL`
4. Click **Deploy** — Vercel will automatically run `prisma generate && next build`

---

## 🔐 Authentication & Role-Based Access

JWT tokens are stored in HTTP-only cookies. The middleware at `src/middleware.ts` protects all routes:

| Route prefix | Required role |
|---|---|
| `/dashboard/*` | `TEAM_LEADER` |
| `/coordinator/*` | `COORDINATOR` |
| `/admin/*` | `SUPER_ADMIN` |

Accessing a protected route without the correct role redirects to `/login`.

---

## 🌍 Multilingual Landing Page

The landing page (`/`) supports three languages with instant switching:

- 🇬🇧 English
- 🇫🇷 Français
- 🇲🇦 العربية (RTL layout)

---

## 📄 License

This project was developed as an academic final-year project (PFE) at the **Faculté Polydisciplinaire de Taroudant**, Université Ibn Zohr.

© 2026 — All rights reserved.
