# Hostel Mess NFC Food Tracking Web Application

A mobile-first Web NFC food tracking application built for college and hostel mess staff to record student meal attendance in real-time.

Designed with a high-end mobile experience in mind (~390×844px target), incorporating large touch targets, automatic rapid scan-next workflow, duplicate attendance prevention, full roster management, real-time analytics dashboard, and a built-in **Demo Scanner Mode** for desktop testing without physical NFC hardware.

---

## 🌟 Key Features

1. **Mobile-First Scanner Viewport**: Immediate scan readiness upon app opening, dynamic time-of-day greetings ("Good Morning", "Dinner • Wed Sep 9"), and active meal indicators.
2. **Web NFC & Demo Mode**:
   - Uses Chrome Native Web NFC API (`NDEFReader`) on supported Android devices.
   - Built-in **Demo Scanner** bottom sheet allows instant tap simulation with sample student cards (`Rahul Kumar - NFC-23CSE1001`, `Priya Sharma - NFC-23CSE1002`, `Unknown Card`, or custom input) targeting the exact same backend API (`POST /api/scan`).
3. **Automated Rapid Scan-Next Flow**:
   - **Success**: Emerald checkmark, student name, roll number, meal type, timestamp, auto-dismisses in 1.5–2s back to scan state.
   - **Duplicate Scan**: Amber notice, student details, previous scan time, auto-dismisses in 2s.
   - **Unknown Card**: Red question mark, "Card Not Recognized" with direct `[ Add Student ]` or `[ Try Again ]` options.
4. **Interactive Dashboard & Roster**:
   - Today's meal attendance breakdown (Breakfast, Lunch, Dinner).
   - **Not Eaten Yet** list for hostel mess managers to track missing students for the current meal.
   - Full student roster search, department filtering, profile sheets, and CSV export.
5. **Zero-Configuration SQLite Database**:
   - Automatically initializes `server/data/app.db` with schema and index structures.
   - Automatically seeds 20 realistic student records (`NFC-23CSE1001` - `NFC-23CSE1020`), default settings, admin credentials, and past attendance data on first run.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# 1. Install root, server, and client dependencies
npm run install:all
```

### Running Locally

```bash
# Terminal 1: Start Backend Express Server (Port 5000)
npm run dev:server

# Terminal 2: Start Frontend Vite React App (Port 3000)
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Admin Credentials

- **Email**: `admin@mess.edu`
- **Password**: `admin123`

---

## 💾 Database Architecture

- **Engine**: SQLite via `better-sqlite3`
- **File Location**: `server/data/app.db`
- **Tables**:
  - `students`: `id`, `roll_number` (UNIQUE), `name`, `card_id` (UNIQUE), `department`, `year`, `active`, `created_at`
  - `meal_records`: `id`, `student_id`, `meal_type`, `meal_date`, `scanned_at`, `UNIQUE(student_id, meal_type, meal_date)`
  - `settings`: `key` (PRIMARY KEY), `value`
  - `users`: `id`, `email` (UNIQUE), `password_hash`, `name`, `role`

---

## 📡 Backend REST API

| Method | Endpoint | Description |
| text | text | text |
| `POST` | `/api/auth/login` | Staff authentication |
| `POST` | `/api/scan` | Core scan endpoint (`{ cardId, mealTypeOverride? }`) |
| `GET` | `/api/dashboard` | Daily turnout metrics, missing students, department breakdown |
| `GET` | `/api/students` | List student roster with search & department filters |
| `POST` | `/api/students` | Create new student record |
| `GET` | `/api/students/:id` | Student details & meal attendance history |
| `PUT` | `/api/students/:id` | Update student profile or active state |
| `DELETE` | `/api/students/:id` | Remove student |
| `POST` | `/api/students/import` | Bulk import JSON array of students |
| `GET` | `/api/meals` | Paginated meal records feed |
| `GET` | `/api/reports/export` | Download CSV attendance report |
| `GET` / `PUT` | `/api/settings` | Get/update meal time windows & hostel settings |

---

## 📱 Web NFC Compatibility Notes

- Web NFC is supported natively on **Android Chrome** (v89+) when served over `https://` or `localhost`.
- On desktop browsers or iOS devices, click **"Use Demo Scanner"** to simulate physical card taps seamlessly.
