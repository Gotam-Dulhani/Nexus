# Nexus – Investor-Entrepreneur Collaboration Platform

[![Contributors](https://img.shields.io/github/contributors/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/network/members)
[![Stars](https://img.shields.io/github/stars/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/stargazers)
[![Issues](https://img.shields.io/github/issues/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/issues)
[![License](https://img.shields.io/github/license/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/blob/main/LICENSE)

> A **unified platform where Entrepreneurs pitch and Investors discover** — featuring real-time chat, video calls, calendar scheduling, document management with e-signatures, deal tracking, and secure payments in one ecosystem.

**Live:** [https://nexus-neon-chi.vercel.app](https://nexus-neon-chi.vercel.app)

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

**Nexus** solves the fragmented tooling problem in startup funding — where chat, scheduling, document signing, and deal tracking are spread across multiple platforms, slowing down deal closure.

Nexus brings everything into one **"Chamber" approach**: entrepreneurs pitch their ideas, investors discover and evaluate opportunities, and both parties collaborate through real-time messaging, video calls, a shared calendar, legally-simulated e-signatures, deal pipelines, and a secure payment system — all in a single dashboard with dark mode support.

---

## Key Features

### Authentication & Security
- **JWT Authentication** – Secure token-based login with role selection
- **2FA / OTP** – Email-based one-time password verification
- **Password Reset** – Secure token-based password recovery flow
- **Role-Based Access** – Separate Investor and Entrepreneur roles with tailored dashboards

### Communication
- **Real-Time Chat** – Instant messaging with Socket.IO, emoji picker, conversation list
- **Video Calls** – WebRTC signaling via Socket.IO for voice and video calls
- **Notifications** – In-app notification center

### Profiles & Discovery
- **Profile Management** – Bio, avatar upload, startup/investment details, and public profile viewing
- **Investor Discovery** – Entrepreneurs can browse and search investor profiles
- **Startup Discovery** – Investors can browse and search entrepreneur/startup profiles

### Meetings & Calendar
- **Meeting Scheduler** – Calendar view with conflict detection
- **Meeting Requests** – Accept/reject meeting invitations
- **Video Call Integration** – Launch calls directly from meetings or chat

### Document Chamber
- **Document Upload** – Upload pitch decks, contracts, and other files
- **PDF Preview** – In-browser PDF viewing with zoom and pagination
- **Image Preview** – In-browser image preview
- **E-Signature** – Hand-drawn canvas signature on documents
- **Document Download** – Direct file download from the backend

### Deal Pipeline
- **Deal Tracking** – Create and manage deals with status stages (Due Diligence, Term Sheet, Negotiation, Closed, Passed)
- **Deal Search & Filter** – Search deals by name and filter by status

### Payments & Transactions
- **Stripe Sandbox** – Full deposit/withdraw/transfer flow with Stripe Elements
- **Wallet Balance** – Real-time balance display
- **Transaction History** – Complete transaction log with status indicators

### UI/UX
- **Dark Mode** – Toggle between light and dark themes from the navbar
- **Split-Screen Auth Pages** – Premium login/register/forgot-password pages with animated gradient backgrounds
- **Responsive Design** – Fully responsive across mobile, tablet, and desktop
- **Tailwind CSS** – Modern utility-first styling with custom design tokens

---

## Built With

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express 4.x, Mongoose 8.x |
| Database | MongoDB Atlas |
| Real-Time | Socket.IO 4.x |
| File Upload | Multer 1.x |
| Payments | Stripe (Sandbox) |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Security | Helmet, CORS, bcryptjs, JWT |
| Deployment | Vercel (Frontend) · Railway (Backend) |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payment sandbox)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Gotam-Dulhani/Nexus.git
cd Nexus
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Configure environment variables**

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
```

**4. Start the backend server**

```bash
npm run dev
```

> Backend runs at: `http://localhost:5000`
> Swagger docs at: `http://localhost:5000/api-docs`

**5. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

**6. Configure frontend environment (optional)**

For local development the frontend auto-detects `http://localhost:5000/api`. To point to the deployed backend:

```env
VITE_API_URL=https://nexus-production-b488.up.railway.app/api
```

**7. Start the frontend**

```bash
npm run dev
```

> Frontend runs at: `http://localhost:5173`

---

## Project Structure

```
Nexus/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js  # Register, login, forgot/reset password
│   │   ├── profileController.js # Profile CRUD, avatar upload
│   │   ├── meetingController.js # Meeting scheduling & conflict detection
│   │   ├── documentController.js # Document upload, sign, delete
│   │   ├── paymentController.js  # Deposit, withdraw, transfer (Stripe)
│   │   ├── messageController.js  # Chat messaging
│   │   ├── dealController.js     # Deal pipeline management
│   │   └── otpController.js      # 2FA OTP send/verify
│   ├── middleware/
│   │   └── auth.js           # JWT auth & role-based authorization
│   ├── models/
│   │   ├── User.js           # User schema (name, email, password, role)
│   │   ├── Profile.js        # Profile schema (bio, avatar, startup/investor fields)
│   │   ├── Meeting.js        # Meeting schema
│   │   ├── Document.js       # Document schema
│   │   ├── Transaction.js    # Payment transaction schema
│   │   ├── Message.js        # Chat message schema
│   │   └── Deal.js           # Deal pipeline schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── meetings.js
│   │   ├── documents.js
│   │   ├── payments.js
│   │   ├── messages.js
│   │   └── deals.js
│   ├── uploads/              # Uploaded avatars and documents
│   ├── index.js              # Express app entry point
│   ├── socketServer.js       # Socket.IO event handlers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Avatar, Badge, Button, Card, Input
│   │   │   ├── layout/       # Navbar, Sidebar, DashboardLayout
│   │   │   ├── chat/         # ChatMessage, ChatUserList
│   │   │   ├── documents/    # PDFViewer
│   │   │   ├── payments/     # CheckoutForm (Stripe)
│   │   │   ├── profile/      # EditProfileModal
│   │   │   ├── investor/     # InvestorCard
│   │   │   ├── entrepreneur/ # EntrepreneurCard
│   │   │   └── deals/        # AddDealModal
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/    # EntrepreneurDashboard, InvestorDashboard
│   │   │   ├── profile/      # EntrepreneurProfile, InvestorProfile
│   │   │   ├── chat/         # ChatPage
│   │   │   ├── meetings/     # MeetingsPage
│   │   │   ├── documents/    # DocumentsPage
│   │   │   ├── payments/     # PaymentsPage
│   │   │   ├── deals/        # DealsPage
│   │   │   ├── investors/    # InvestorsPage
│   │   │   ├── entrepreneurs/# EntrepreneursPage
│   │   │   ├── notifications/# NotificationsPage
│   │   │   ├── settings/     # SettingsPage (Profile, Security, Billing)
│   │   │   ├── help/         # HelpPage
│   │   │   └── call/         # VideoCallPage
│   │   ├── context/
│   │   │   ├── AuthContext.tsx  # Auth state, login, register, token
│   │   │   └── SocketContext.tsx # Socket.IO provider
│   │   ├── utils/
│   │   │   └── api.ts        # Safe API utility (apiGet, apiPost, apiPut, etc.)
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript type definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── vercel.json
│   └── package.json
├── railway.json              # Railway deployment config
└── README.md
```

---

## API Documentation

Full API documented via **Swagger** at `/api-docs`. Below is a summary of all endpoints.

### Authentication & Security

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new Investor or Entrepreneur |
| POST | `/api/auth/login` | Authenticate and receive a JWT token |
| POST | `/api/auth/forgot-password` | Send a password reset email |
| POST | `/api/auth/reset-password` | Reset password using token |
| POST | `/api/auth/send-otp` | Trigger a 2FA OTP to user's email |
| POST | `/api/auth/verify-otp` | Validate OTP for 2FA setup |

### Profile Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/me` | Retrieve authenticated user's profile |
| PUT | `/api/profile/me` | Update personal info, bio, and location |
| POST | `/api/profile/me/avatar` | Upload or update profile picture |
| GET | `/api/profile` | List all profiles (for discovery) |
| GET | `/api/profile/:userId` | View another member's public profile |

### Meetings & Calendar

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings` | Fetch all scheduled meetings |
| POST | `/api/meetings` | Schedule a new meeting (with conflict detection) |
| PUT | `/api/meetings/:id` | Update meeting status or time |

### Document Chamber

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | List all documents and signature status |
| POST | `/api/documents/upload` | Securely upload pitch decks or contracts |
| POST | `/api/documents/:id/sign` | Apply a hand-drawn e-signature |
| DELETE | `/api/documents/:id` | Delete a document |

### Payments & Transactions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments/balance` | Get current wallet balance |
| POST | `/api/payments/deposit` | Initiate a Stripe deposit |
| POST | `/api/payments/confirm` | Confirm a Stripe payment |
| POST | `/api/payments/withdraw` | Withdraw funds from wallet |
| POST | `/api/payments/transfer` | Transfer funds to another user |
| GET | `/api/payments/history` | Get transaction history |

### Messaging

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/conversations` | List all conversations |
| GET | `/api/messages/:userId` | Get message history with a user |
| POST | `/api/messages` | Send a message to a user |

### Deals

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/deals` | List all deals for the authenticated investor |
| POST | `/api/deals` | Create a new deal |
| PUT | `/api/deals/:id` | Update deal status |
| DELETE | `/api/deals/:id` | Delete a deal |

---

## How It Works

```
User Registration (Investor / Entrepreneur)
        |
        v
Email OTP Verification (2FA) / Password Reset
        |
        v
Profile Setup & Dashboard
        |
     +--+------------------+
     v                     v
Document Chamber      Meeting Calendar
(Upload + E-Sign)    (Schedule + Video Call)
     |                     |
     v                     v
Real-Time Chat        Deal Pipeline
(Emoji + File)       (Track + Status)
     |                     |
     +----------+----------+
                v
        Payment (Stripe Sandbox)
                |
                v
         Deal Closed
```

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch:

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:

```bash
git commit -m "Add AmazingFeature"
```

4. Push and open a Pull Request:

```bash
git push origin feature/AmazingFeature
```

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## Contact

**Gotam Dulhani**
GitHub: [https://github.com/Gotam-Dulhani](https://github.com/Gotam-Dulhani)

---

## Acknowledgments

- [Node.js Documentation](https://nodejs.org/)
- [Socket.IO Documentation](https://socket.io/)
- [Stripe Documentation](https://stripe.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Railway Deployment](https://railway.app/)
- [Vercel Deployment](https://vercel.com/)
- Open Source Community
