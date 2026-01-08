
````
# 📅 Calendly Clone

A full-stack, production-ready scheduling and booking application that replicates the core functionality of Calendly. Built with **Next.js 14**, **Express.js**, **Supabase (PostgreSQL)**, and **Gmail SMTP**.

This project features a modern, responsive UI, real-time availability management, and a robust **fire-and-forget email notification system** designed for an optimal user experience.

---

## 🌟 Key Features

### Core Functionality
- ✅ **Event Types Management:** Create, edit, and delete meeting types (e.g., *15 Min Chat*, *30 Min Chat*) with custom colors and unique URLs.
- ✅ **Smart Availability:** Configure weekly schedules with precise time slots. The system automatically calculates available slots.
- ✅ **Public Booking Page:** A beautiful, responsive calendar interface for invitees to book meetings.
- ✅ **Instant Notifications:** Automated email confirmations sent via **Gmail SMTP (Nodemailer)** to both host and invitee.
- ✅ **Non-Blocking UX:** Optimized backend logic ensures users see the success screen instantly while emails process in the background.

### Bonus Features
- 🎨 **Dynamic Dashboard:** View upcoming and past meetings with status tracking.
- ⚡ **Meeting Cancellation:** Users can cancel meetings, triggering automatic update emails.
- 🛡️ **Conflict Prevention:** Real-time validation to prevent double bookings.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Lucide Icons
- **Backend:** Node.js, Express.js (REST API)
- **Database:** Supabase (Managed PostgreSQL)
- **Email Service:** Nodemailer (Gmail SMTP)
- **Deployment:** Vercel (Frontend) + Render (Backend)

---

## 📂 Project Structure

```bash
calendly-clone/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Dashboard (Event Types)
│   ├── [slug]/                 # Public Booking Page (Dynamic Route)
│   ├── availability/           # Availability Settings
│   └── meetings/               # Scheduled Meetings List
├── components/                 # React Components
│   └── ui/                     # shadcn/ui primitives (Button, Card, etc.)
├── server.js                   # Express Backend Entry Point
├── schema.sql                  # Database Schema
└── .env.local                  # Environment Variables
````

---

## 🚀 Getting Started

### Prerequisites

* Node.js **18+**
* A **Supabase** account (Free tier)
* A **Gmail** account (for sending emails)

---

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/calendly-clone.git
cd calendly-clone

# Install dependencies
npm install
```

---

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# --- Supabase Configuration ---
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# --- Email Configuration (Gmail) ---
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_char_app_password

# --- App Configuration ---
NEXT_PUBLIC_API_URL=http://localhost:5000/api
PORT=5000
```

---

### 3. Database Setup (Supabase)

1. Go to your **Supabase Project → SQL Editor**
2. Copy the contents of `schema.sql` from this repository
3. Run the query to create the required tables:

   * `users`
   * `event_types`
   * `availability`
   * `bookings`

---

### 4. Run the Application

You must run the backend and frontend **simultaneously**.

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

This project uses a **split deployment strategy** for performance and scalability.

### 1. Backend Deployment (Render)

1. Create a **Web Service** on Render
2. Connect your GitHub repository
3. Set:

   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
4. Add Environment Variables:

   * `SUPABASE_URL`
   * `SUPABASE_KEY`
   * `GMAIL_USER`
   * `GMAIL_PASS`

---

### 2. Frontend Deployment (Vercel)

1. Import the repository into Vercel
2. Add Environment Variable:

   ```env
   NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api
   ```
3. Deploy 🎉

---

## 🔧 API Endpoints

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/api/event-types`              | List all event types           |
| GET    | `/api/availability/:slug/:date` | Get available slots for a date |
| POST   | `/api/bookings`                 | Create booking & trigger email |
| PATCH  | `/api/bookings/:id/cancel`      | Cancel a booking               |
| GET    | `/api/health`                   | Backend health check           |

---

## 🧪 Testing the Flow

1. **Create an Event:** Create a "30 Min Meeting" from the dashboard
2. **Set Availability:** Configure working hours (e.g., 9 AM – 5 PM)
3. **Book a Slot:** Open the public booking link and select a time
4. **Observe:** Success page loads instantly (non-blocking email logic)
5. **Verify Email:** Both host and invitee receive confirmation emails

---

## 🐛 Troubleshooting

* **Email Timeout Errors:**
  Ensure `GMAIL_PASS` is a **Gmail App Password**, not your Gmail login password.
  Also verify SMTP port **587** is used.

* **Render Cold Starts:**
  Free-tier services may take **30–50 seconds** to wake up.

* **CORS Errors:**
  Ensure backend CORS configuration allows your frontend domain.

---

## 🔮 Future Enhancements

* [ ] Google Calendar 2-way sync
* [ ] Payment integration (Stripe)
* [ ] Team scheduling (Round-robin)
* [ ] SMS notifications

---

## 📝 License

This project is for **educational purposes only**.

---

## 🙏 Acknowledgments

* Design inspiration from **Calendly**
* UI components by **shadcn/ui**
* Icons by **Lucide React**

