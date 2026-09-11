# Uni-Track: Smart University Transit & AI-Powered Lost and Found System

Uni-Track is an end-to-end, enterprise-grade campus mobility and lost-and-found management platform designed specifically for universities. It delivers real-time shuttle fleet telemetry, student tracking, driver dispatch console, and an automated AI-driven lost-and-found attribute matching engine.

---

## 🏛️ System Architecture

The project is architected into four independent, decoupled sub-systems:

```
Uni-Track/
├── database/         # MySQL relational schema (11 tables) and realistic university seed data
├── backend/          # Node.js + Express + Socket.IO API server (Dual-mode: MySQL or zero-config in-memory fallback)
├── web-app/          # Admin Web Application (React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons)
└── mobile-app/       # Native Android Application (Pure Java + XML, Android SDK 34/35, Gradle)
```

### Key Architectural Tenets
* **Strict Platform Purity**: The mobile application is **100% Native Android** written in Java and Android XML layouts. No cross-platform or hybrid frameworks (no React Native, no Flutter, no Expo).
* **Unified Mobile Gateway**: **One single Android APK** serves both Students and Drivers via dynamic role gateways (Role Selection -> Student Dashboard / Driver Dashboard).
* **Autonomous Fallback**: The backend runs seamlessly out-of-the-box. If MySQL is connected on port 3306, it uses the relational database; if MySQL is unavailable, it automatically switches to an in-memory data store pre-populated with identical seed data.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18+ or v20+ (LTS)
* **npm**: v9+ or v10+
* **Java Development Kit (JDK)**: JDK 17 or JDK 21
* **Android Studio**: Ladybug, Hedgehog, or newer with Android SDK Platform 34 / 35
* *(Optional)* **MySQL Server**: 8.0+

---

### Step 1: Start the Backend Service

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already pre-installed)
npm install

# Start the backend server (starts on http://localhost:5000)
npm start
# or for live reload:
npm run dev
```

* **Health Check**: Visit `http://localhost:5000/api/health` in your browser.
* **Dual-Mode Database**:
  * If MySQL is running, import `database/schema.sql` and `database/seed.sql`.
  * If MySQL is not running, the server automatically starts in **Memory Store Mode** with all seed data pre-loaded!

---

### Step 2: Launch the Admin Web Dashboard

```bash
# In a new terminal, navigate to web-app
cd web-app

# Install dependencies (already pre-installed)
npm install

# Start the Vite development server
npm run dev
```

* **URL**: Open [http://localhost:5173](http://localhost:5173) in your browser.
* **Production Build**: Verified via `npm run build` with output in `web-app/dist/`.

---

### Step 3: Run the Native Android Application

1. Launch **Android Studio**.
2. Select **File -> Open...** and browse to `Uni-Track/mobile-app`.
3. Allow Gradle to sync dependencies (Android Gradle Plugin 8.5.1 + Gradle 8.8).
4. Run the app on an **Android Virtual Device (Emulator)** (API 34/35) or a physical Android device.

> **Emulator Networking Note**:
> By default, `mobile-app` connects to `http://10.0.2.2:5000/api/` (the standard Android emulator alias for `localhost:5000`). If running on a physical phone, update `BASE_URL` and `SOCKET_URL` in `mobile-app/app/src/main/java/com/unitrack/app/utils/Constants.java` to your machine's local Wi-Fi IP address (e.g. `http://192.168.1.50:5000/api/`).

---

## 🔑 Pre-Seeded Demonstration Accounts

All accounts are pre-configured in `database/seed.sql` and the backend in-memory store:

| Role | Identifier (Email or Badge ID) | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@unitrack.edu` | `admin123` | Full access to Admin Web Dashboard |
| **Student** | `alex.j@student.unitrack.edu` (or `STD-2024-001`) | `student123` | Senior CS student profile |
| **Student** | `samantha.r@student.unitrack.edu` (or `STD-2024-002`) | `student123` | Biology student profile |
| **Driver** | `robert.m@driver.unitrack.edu` (or `DRV-101`) | `driver123` | Assigned to Bus #1 (Route 1 - Vadodara Station Express) |
| **Driver** | `maria.g@driver.unitrack.edu` (or `DRV-102`) | `driver123` | Assigned to Bus #2 (Route 2 - Sama / Gorwa Route) |

---

## 📱 Mobile Application Features (`mobile-app/`)

* **Role Gateway**:
  * Beautiful animated Splash screen leading to Role Selection (Student vs Driver).
  * Independent login flows with credential persistence via secure `SessionManager`.
* **Student Experience**:
  * **Interactive Home Dashboard**: Live announcements, quick bus schedules, and active incident alerts.
  * **Live Bus Telemetry & Map**: Real-time vehicle positions, speed, estimated arrival times (ETA), and sequenced stop route visualizer.
  * **Route Browser**: Comprehensive route directory with stop-by-stop sequencing and operating hours.
  * **Lost & Found Hub**:
    * Browse all lost and discovered property across campus and transit fleet.
    * Post new lost item reports or report found items with photos.
    * **Automated AI Match Inspector**: View confidence similarity breakdown (0-100%) and feature explanations generated by the backend matching engine.
    * **Ownership Claim Submissions**: File claims with unique proof descriptions and check real-time claim review statuses.
  * **Student Profile**: Academic credentials, contact information, and session logout.
* **Driver Experience**:
  * **Driver Console**: Live trip management, assigned route details, vehicle number, and license plate.
  * **Foreground Telemetry Beacon (`GpsTrackingService`)**: Continuous background GPS transmission (speed, heading, accuracy) via Socket.IO directly to the admin dispatch and student map.
  * **One-Tap Emergency SOS**: Instant breakdown, medical, accident, or security incident broadcast.
  * **Driver Profile**: Driver badge number, vehicle assignment, and contact details.

---

## 💻 Admin Web Application Features (`web-app/`)

* **Executive Dashboard**: Key fleet metrics (active buses, in-transit students, open lost items, pending claims, and live emergency counter).
* **Live Fleet Tracking Map**: High-refresh canvas map rendering real-time bus markers, headings, speed indicators, and route overlays.
* **Bus & Fleet Management**: Add, modify, or retire transit vehicles with real-time capacity and maintenance tracking.
* **Route Management**: Create routes, add GPS coordinate stops, adjust departure frequencies, and assign default vehicles.
* **Driver & Trip Logs**: Live overview of in-progress and completed trips with real-time duration and driver assignments.
* **AI Lost & Found Management**:
  * Filter lost and found items by status and category.
  * Review student claims with ownership proof and approve/reject claims with admin notes.
  * View AI Match suggestions linking reported lost items to found properties.
* **Emergency Dispatch Center**: Audio-visual alert banner notifying dispatchers of driver distress signals with location coordinates and one-click resolution.
* **Campus Transit Analytics**: Route utilization charts, peak transit hours, and lost-and-found resolution rates.

---

## ⚙️ Backend API & Socket.IO Engine (`backend/`)

### Core REST Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and uptime | No |
| `POST` | `/api/auth/login` | Multi-identifier login (email, student_id, driver_id, phone) | No |
| `POST` | `/api/auth/register` | Student registration | No |
| `GET` | `/api/auth/me` | Current authenticated user profile | Yes (Bearer) |
| `GET` | `/api/buses` | List all campus buses and statuses | Yes (Bearer) |
| `GET` | `/api/routes` | List all routes and sequenced stops | Yes (Bearer) |
| `GET` | `/api/trips/active` | Current active trips with telemetry | Yes (Bearer) |
| `POST` | `/api/trips/start` | Start scheduled trip (Driver) | Yes (Driver) |
| `POST` | `/api/trips/end` | Conclude active trip (Driver) | Yes (Driver) |
| `GET` | `/api/lost-found` | List lost & found items (filters: type, category, status) | Yes (Bearer) |
| `POST` | `/api/lost-found` | Report lost or found item (triggers AI matcher) | Yes (Bearer) |
| `POST` | `/api/lost-found/claim` | Submit ownership claim | Yes (Student) |
| `GET` | `/api/lost-found/claims`| Get submitted claims for student | Yes (Student) |
| `PUT` | `/api/lost-found/claims/:id/review`| Approve or reject claim | Yes (Admin) |
| `POST` | `/api/emergency` | Dispatch emergency distress signal | Yes (Driver) |
| `GET` | `/api/notifications` | User notifications and announcements | Yes (Bearer) |
| `GET` | `/api/analytics/overview` | Admin dashboard analytics | Yes (Admin) |

### Real-Time Socket.IO Channels

* `driver:location_update` — Streams live GPS fixes (latitude, longitude, speed, heading, accuracy) to `bus_tracking` and `admin_room`.
* `emergency:alert` — Instant SOS notification emitted to all dispatch monitors.
* `student:track_bus` — Rooms for students tracking a specific shuttle vehicle.

---

## 🤖 AI Lost & Found Matching Engine

Located in `backend/src/services/aiService.js`, the similarity algorithm evaluates candidate pairs using weighted scoring:
1. **Category Concordance (30 pts)**: Strict or taxonomic match.
2. **Color Proximity (20 pts)**: Normalized color spectrum comparison.
3. **Vehicle / Location Match (25 pts)**: Same bus ID or transit stop coordinates.
4. **Temporal Proximity (15 pts)**: Discovered within temporal threshold of loss.
5. **Description Keyword Overlap (10 pts)**: Tokenized NLP keyword overlap.

Pairs exceeding confidence thresholds are automatically linked with item statuses updated to `matched` and reasoning explanations generated for verification.

---

## 🛠️ Verification & Test Suite

All components have been verified:
* **Backend**: Express + Socket.IO health checks and JWT multi-role logins validated.
* **Web App**: Vite production build passes with exit code 0 (`npm run build`).
* **Android**: 23 Java Activities, 9 Fragments, 7 Adapters, and 28 XML layouts structured to standard Android SDK specifications.
