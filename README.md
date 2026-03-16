# 🚀 Nexus – Investor-Entrepreneur Collaboration Platform

[![Contributors](https://img.shields.io/github/contributors/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/network/members)
[![Stars](https://img.shields.io/github/stars/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/stargazers)
[![Issues](https://img.shields.io/github/issues/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/issues)
[![License](https://img.shields.io/github/license/Gotam-Dulhani/Nexus)](https://github.com/Gotam-Dulhani/Nexus/blob/main/LICENSE)

> A **unified platform where Entrepreneurs pitch and Investors discover** — featuring integrated video calls, calendar scheduling, e-signatures, and secure payments in one ecosystem.


---

## 📌 Table of Contents

* [About The Project](#-about-the-project)
* [Key Features](#-key-features)
* [Built With](#-built-with)
* [Getting Started](#-getting-started)
* [API Documentation](#-api-documentation)
* [How It Works](#-how-it-works)
* [Contributing](#-contributing)
* [License](#-license)
* [Contact](#-contact)

---

## 💡 About The Project

**Nexus** solves the fragmented tooling problem in startup funding — where chat, scheduling, and document signing are spread across multiple platforms, slowing down deal closure.

Nexus brings everything into one **"Chamber" approach**: entrepreneurs pitch their ideas, investors discover and evaluate opportunities, and both parties collaborate through video calls, a shared calendar, legally-simulated e-signatures, and a secure payment system — all in a single dashboard.

---

## ✨ Key Features

* **2FA Authentication** – OTP-based email verification for secure login.
* **Document Chamber** – Upload pitch decks & legal contracts with cryptographic e-signature support.
* **Meeting Calendar** – Schedule meetings with built-in conflict detection logic.
* **Video Calls** – Real-time video via Socket.IO signaling for zero-latency connection.
* **Payment Simulation** – Stripe Sandbox integration with full transaction flow tracing.
* **Role-Based Access** – Separate Investor and Entrepreneur user roles with tailored dashboards.
* **Profile Management** – Bio, avatar upload, and public profile viewing.

---

## 🛠 Built With

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Real-Time | Socket.IO |
| Payments | Stripe Sandbox |
| API Docs | Swagger |
| Deployment | Vercel (Frontend) · Render (Backend) |

---

## 🚀 Getting Started

### Prerequisites

* Node.js & npm
* MongoDB (local or Atlas)
* Stripe account (for payment sandbox)

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
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**4. Start the backend server**

```bash
npm run dev
```

> Backend runs at: `http://localhost:5000`

**5. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

**6. Start the frontend**

```bash
npm run dev
```

> Frontend runs at: `http://localhost:5173`

---

## 📡 API Documentation

Full API documented via **Swagger**. Below is a summary of all endpoints.

### 🔐 Authentication & Security

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new Investor or Entrepreneur |
| POST | `/api/auth/login` | Authenticate and receive a JWT token |
| POST | `/api/auth/send-otp` | Trigger a 2FA OTP to user's email |
| POST | `/api/auth/verify-otp` | Validate OTP for secure login |

### 👤 Profile Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/me` | Retrieve authenticated user's profile |
| PUT | `/api/profile/me` | Update personal info, bio, and location |
| POST | `/api/profile/me/avatar` | Upload or update profile picture |
| GET | `/api/profile/:userId` | View another member's public profile |

### 📅 Meetings & Calendar

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings` | Fetch all scheduled meetings |
| POST | `/api/meetings` | Schedule a new meeting (with conflict detection) |
| PUT | `/api/meetings/:id` | Update meeting status or time |

### 📄 Document Chamber

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | List all documents and signature status |
| POST | `/api/documents/upload` | Securely upload pitch decks or contracts |
| POST | `/api/documents/:id/sign` | Apply a cryptographic or hand-drawn e-signature |

### 💳 Payments & Transactions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create-deposit` | Initiate a Stripe Intent for wallet funding |
| POST | `/api/payments/confirm-deposit` | Finalize transaction and update internal ledger |

---

## 🧠 How It Works

```
User Registration (Investor / Entrepreneur)
        │
        ▼
Email OTP Verification (2FA)
        │
        ▼
Profile Setup & Dashboard
        │
     ┌──┴──────────────────┐
     ▼                     ▼
Document Chamber      Meeting Calendar
(Upload + E-Sign)    (Schedule + Video Call)
     │                     │
     └──────────┬──────────┘
                ▼
        Payment (Stripe Sandbox)
                │
                ▼
         Deal Closed ✅
```

---

## 🤝 Contributing

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

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## 📫 Contact

**Gotam Dulhani**
GitHub: [https://github.com/Gotam-Dulhani](https://github.com/Gotam-Dulhani)

---

## 🙏 Acknowledgments

* [Node.js Documentation](https://nodejs.org/)
* [Socket.IO Documentation](https://socket.io/)
* [Stripe Documentation](https://stripe.com/docs)
* [MongoDB Documentation](https://www.mongodb.com/docs/)
* [React Documentation](https://react.dev/)
* Open Source Community ❤️
