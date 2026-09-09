# Hostel Mess NFC Food Tracking Web Application

A mobile-first Web NFC food tracking application built for college and hostel mess staff to record student meal attendance in real-time.

Built on **React 19 + Vite**, **Netlify Functions**, and **Supabase PostgreSQL**. Deployed as a single unified Netlify project with zero external persistent server requirements.

---

## 🌟 Key Features

1. **Mobile-First Scanner Viewport**: Immediate scan readiness upon app opening, dynamic time-of-day greetings, active meal indicators, and 3-Day Event selector.
2. **Web NFC & Demo Mode**:
   - Uses Chrome Native Web NFC API (`NDEFReader`) on supported Android devices.
   - Built-in **Demo Scanner** bottom sheet allows instant tap simulation with sample student cards (`Karthikeya R - NFC-23CSE1001`, `Priya Sharma - NFC-23CSE1002`, `Unknown Card`, or custom input) targeting the exact same backend API (`POST /api/scan`).
3. **Automated Rapid Scan-Next Flow**:
   - **Success**: Emerald checkmark, student name, roll number, meal type, timestamp, auto-dismisses in 1.5–2s back to scan state.
   - **Duplicate Scan**: Amber notice, student details, previous scan time, auto-dismisses in 2s.
   - **Unknown Card**: Red question mark, "Card Not Recognized" with direct `[ Add Student ]` or `[ Try Again ]` options.
4. **Interactive Dashboard & Roster**:
   - Today's meal attendance breakdown (Breakfast, Lunch, Dinner, Snack 1, Snack 2, Snack 3).
   - **Not Eaten Yet** list for hostel mess managers to track missing students for the current meal.
   - Full student roster search, department filtering, profile sheets, and CSV export.
5. **Robust Database & Duplicate Protection**:
   - Powered by **Supabase PostgreSQL**.
   - Dual-layer duplicate scan protection: application-level verification combined with a PostgreSQL `UNIQUE(student_id, meal_type, meal_date)` constraint.

---

## 🏗️ Architecture

```
Android Phone (Web NFC / Demo Scanner)
       │
       ▼
Netlify-hosted React Application (Vite + React 19 + Tailwind CSS)
       │  (Proxies relative /api/* requests)
       ▼
Netlify Functions (Serverless TypeScript in netlify/functions/)
  - /api/scan                -> scan.ts
  - /api/auth/login          -> auth-login.ts
  - /api/dashboard           -> dashboard.ts
  - /api/students            -> students.ts
  - /api/students/:id        -> student-detail.ts
  - /api/students/import     -> students-import.ts
  - /api/meals               -> meals.ts
  - /api/reports             -> reports.ts
  - /api/reports/export      -> reports-export.ts
  - /api/settings            -> settings.ts
  - /api/settings/reseed     -> reseed.ts
  - /api/health              -> health.ts
       │
       ▼
Supabase PostgreSQL
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A free [Supabase](https://supabase.com) project

### 2. Database Setup (Supabase)
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Copy and paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. This creates all tables (`students`, `meal_records`, `settings`, `users`), performance indexes, unique constraints, default settings, default admin credentials, and sample student data.

### 3. Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
JWT_SECRET=nfc_mess_jwt_super_secret_key_2026
```

### 4. Install Dependencies

```bash
npm run install:all
```

### 5. Running Locally

```bash
npm run dev
```

This starts:
- The local Netlify Functions dev server on port `8888`
- The Vite frontend client on port `3000` (automatically proxying `/api` requests to port `8888`)

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Netlify

1. Push your repository to GitHub / GitLab.
2. Link the repository in [Netlify](https://app.netlify.com).
3. In Netlify Site Settings -> **Environment variables**, set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
4. Netlify will automatically detect `netlify.toml`, build the frontend into `client/dist`, bundle the serverless functions in `netlify/functions`, and configure the API redirects.

---

## 🔐 Default Admin Credentials

- **Email**: `admin@mess.edu`
- **Password**: `admin123`

---

## 📡 Backend REST API

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Staff authentication & JWT issuance | No |
| `POST` | `/api/scan` | Core scan endpoint (`{ cardId, mealTypeOverride? }`) | No (Physical device) |
| `GET` | `/api/dashboard` | Turnout metrics, missing students, department breakdown | No |
| `GET` | `/api/students` | List student roster with filters | No |
| `POST` | `/api/students` | Create new student record | Yes (Admin) |
| `GET` | `/api/students/:id` | Student details & meal history | No |
| `PUT` | `/api/students/:id` | Update student profile or active status | Yes (Admin) |
| `DELETE` | `/api/students/:id` | Remove student record | Yes (Admin) |
| `POST` | `/api/students/import` | Bulk import array of students | Yes (Admin) |
| `GET` | `/api/meals` | Paginated meal records feed | No |
| `GET` | `/api/reports` | Summary reports by date range | No |
| `GET` | `/api/reports/export` | Download CSV attendance report | No |
| `GET` / `PUT` | `/api/settings` | Get/update meal time windows & settings | PUT: Yes (Admin) |
| `POST` | `/api/settings/reseed` | Safe reseed endpoint | Yes (Admin) |
| `GET` | `/api/health` | Health check endpoint | No |

---

## 📱 Web NFC Compatibility Notes

- Web NFC is supported natively on **Android Chrome** (v89+) when served over `https://` or `localhost`.
- On desktop browsers or iOS devices, click **"Use Demo Scanner"** to simulate physical card taps seamlessly.
