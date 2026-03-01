# MoldMasters Frontend 🎨🇲🇩

The client-facing application for the MoldMasters platform, built with React and Vite.

---

## 📖 Overview

This is a modern **Single Page Application (SPA)** designed for both clients and professionals. The interface focuses on performance, accessibility, and high-quality User Experience (UX).

### 🚀 Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit (RTK)
- **API Interfacing:** RTK Query (auto-synced with Backend)
- **Styling:** CSS Modules / TailwindCSS
- **Real-time:** Socket.io-client
- **Validation:** Zod + React Hook Form

### 🛠 Key Features
- **Auto-generated API Hooks**: Data fetching logic is decoupled and stays in sync with Swagger docs.
- **Role-Based Access Control (RBAC)**: Personalized dashboards for Clients, Masters, and Admins.
- **Responsive Design**: Tailored for both desktop discovery and mobile "on-the-go" usage.
- **Micro-interactions**: Smooth transitions and live notification updates.

---

## 🏗 Development Setup

### 🐳 Running with Docker
If you are using the root `docker-compose.dev.yml` setup, the frontend is available at:
- `http://localhost:3000`

### 💻 Local Execution
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environmental variables:
   ```bash
   # Create .env and set:
   VITE_API_URL=http://localhost:4000
   VITE_WS_URL=ws://localhost:4000
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

---

## 📂 Navigation Map

| Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Landing page and professional search. |
| `/masters/:id` | Public | Master profile and portfolio view. |
| `/login` / `/register` | Public | Authentication portal. |
| `/dashboard/*` | Master | Professional workspace (stats, leads management). |
| `/admin/*` | Admin | Internal management and system control. |

---

## 📜 License
Private / MoldMasters Team © 2026
