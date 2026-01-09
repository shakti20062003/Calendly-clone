

````
# 📅 Calendly Clone

A full-stack, production-ready scheduling and booking application that replicates the core functionality of Calendly. Built with **Next.js 14**, **Express.js**, **Supabase (PostgreSQL)**, and **Brevo Email API**.

This project features a modern, fully responsive UI, real-time availability management, and a robust **fire-and-forget email notification system** designed for production reliability.

---

## 🌟 Key Features

### Core Functionality
- ✅ **Event Types Management:** Create, edit, and delete meeting types (e.g., *15 Min Chat*, *30 Min Chat*) with custom colors and unique public URLs.
- ✅ **Smart Availability:** Configure weekly schedules with precise time slots. Available slots are auto-calculated based on rules and existing bookings.
- ✅ **Public Booking Page:** A clean, responsive booking interface for invitees.
- ✅ **Instant Email Notifications:** Booking confirmation and cancellation emails sent via **Brevo Email API**.
- ✅ **Non-Blocking UX:** Backend sends emails asynchronously so users see success screens instantly.

### Bonus Features
- 🎨 **Responsive Dashboard:** Works seamlessly across desktop, tablet, and mobile.
- ⚡ **Meeting Cancellation:** Invitees can cancel meetings and automatically receive update emails.
- 🛡️ **Conflict Prevention:** Real-time validation prevents double bookings.
- 🌍 **Timezone-Aware Scheduling:** Accurate scheduling across different timezones.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14 (App Router)**
- **React + TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide Icons**

### Backend
- **Node.js**
- **Express.js (REST API)**

### Database
- **Supabase (PostgreSQL)**

### Email Service
- **Brevo Email API (HTTP-based, production-safe)**

### Deployment
- **Vercel** → Frontend  
- **Render** → Backend (Express API)

---

## 📂 Project Structure

```bash
calendly-clone/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Dashboard (Event Types)
│   ├── [slug]/                 # Public Booking Page (Dynamic Route)
│   ├── availability/           # Availability Settings
│   └── meetings/               # Scheduled Meetings List
├── components/                 # Reusable React Components
│   └── ui/                     # shadcn/ui primitives
├── server.js                   # Express Backend Entry Point
├── schema.sql                  # Supabase Database Schema
└── .env.local                  # Environment Variables
````

---

## 🚀 Getting Started

### Prerequisites

* **Node.js 18+**
* **Supabase account** (Free tier is sufficient)
* **Brevo account** (Free tier for transactional emails)

---

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/calendly-clone.git
cd calendly-clone

npm install
```

---

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# --- Supabase Configuration ---
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# --- Email Configuration (Brevo API) ---
BREVO_API_KEY=your_brevo_api_key

# --- App Configuration ---
NEXT_PUBLIC_API_URL=http://localhost:5000/api
PORT=5000
```

---

### 3. Database Setup (Supabase)

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy the contents of `schema.sql`
3. Run the script to create tables:

   * `users`
   * `event_types`
   * `availability`
   * `bookings`

---

### 4. Run the Application

You must run the backend and frontend simultaneously.

#### Terminal 1 — Backend

```bash
node server.js
```

Backend runs on: `http://localhost:5000`

#### Terminal 2 — Frontend

```bash
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 🌐 Deployment Guide (Split Stack)

### Backend Deployment (Render)

1. Create a **Web Service** on Render
2. Connect your GitHub repository
3. Set:

   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
4. Add environment variables:

   * `SUPABASE_URL`
   * `SUPABASE_KEY`
   * `BREVO_API_KEY`

> ⚠️ Render free tier may sleep after inactivity (cold starts).

---

### Frontend Deployment (Vercel)

1. Import the repository into Vercel
2. Add environment variable:

   ```env
   NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/api
   ```
3. Deploy 🎉

---

## 🔧 API Endpoints

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/api/event-types`              | List all event types           |
| GET    | `/api/availability/:slug/:date` | Get available slots for a date |
| POST   | `/api/bookings`                 | Create booking & send email    |
| PATCH  | `/api/bookings/:id/cancel`      | Cancel booking & notify user   |
| GET    | `/api/health`                   | Backend health check           |

---

## 🧪 Testing the Flow

1. Create an event type from the dashboard
2. Configure weekly availability
3. Open the public booking link
4. Book a meeting
5. Receive a confirmation email
6. Cancel the meeting and receive a cancellation email

---

## 🐛 Troubleshooting

### Render Cold Starts

* Free-tier backend may take **30–60 seconds** to wake up.
* First request after inactivity can feel slow.

### Frontend Loading Forever

* Ensure `NEXT_PUBLIC_API_URL` is correct.
* Check `/api/health` endpoint directly.

### Email Issues

* Ensure sender email is verified in Brevo.
* Confirm `BREVO_API_KEY` is set correctly.

---

## 🔮 Future Enhancements

* [ ] Google Calendar 2-way sync
* [ ] Payment integration (Stripe)
* [ ] Team scheduling (Round-robin)
* [ ] SMS / WhatsApp notifications
* [ ] Admin analytics dashboard

---

## 📝 License

This project is for **educational and portfolio purposes only**.

---

## 🙏 Acknowledgments

* Design inspiration from **Calendly**
* UI components by **shadcn/ui**
* Icons by **Lucide React**

```
