# Medi Core ERP 🏥

> Enterprise-Grade Healthcare Resource & Operations Management Dashboard Matrix.

Medi Core ERP is a high-end, fully responsive enterprise resource planning dashboard built with **Next.js App Router**, **Tailwind CSS**, and **TypeScript**. It connects seamlessly to a **MySQL** backend via a connection pool to provide real-time, master-level CRUD control over four critical hospital operational divisions from a unified command terminal.

---

## 🖥️ Application Previews

### 🔐 Master Access Terminal
![Master Authentication Landing Page Interface](/public/Admin-patient.png)

### 📊 Root Administration Command Center
![Unified Administrative Console Dashboard Framework](/public/login.png)

---

## 🚀 Core Features

* **Unified Administrative Workspace:** Real-time metrics widgets tracking system-wide settled cash flow revenue, active appointment slots, and live unique patient counts simultaneously.
* **Segmented Multi-Department Management:**
    * **Patients Registry:** Structural management mapping full names, date of birth (DOB), biological gender, contact numbers, city addresses, and blood groups.
    * **Appointments Matrix:** Direct row controls managing relational patient profiles, assigned consulting practitioners, precise time blocks, and appointment standing states.
    * **Pharmacy Ledger (`medicines`):** Live batch inventory monitoring chemical formulation titles, precise stock counts, pricing metrics, and expiration safety flags.
    * **Financial Desk:** Invoice generation matching statement dates, debtor references, outstanding pricing valuation balances, and settlement standing checks.
* **Search Engine Indexing:** On-the-fly client-side dataset parser configuration to query deep repository data lines by typing any string parameters.
* **Global CRUD Overrides:** Complete editing inspector telemetry panels allowing rapid execution of database `INSERT`, `UPDATE`, and `DELETE` queries dynamically.

---

## 🛠️ System Tech Stack

* **Frontend Framework:** Next.js (React 19)
* **Styling Architecture:** Tailwind CSS + Lucide React Icons
* **Language Variant:** TypeScript 
* **Database Engine:** MySQL (via local XAMPP Pool)
* **Connection Driver:** `mysql2/promise`

---

## 📁 Repository Structure

```text
MEDI-CORE-ERP-APP
├── .next/
├── app/
│   ├── admin/
│   │   └── page.tsx            # Master Admin Dashboard Console UI
│   ├── api/
│   │   ├── admin/
│   │   │   └── route.ts        # Unified Administrative Core CRUD API
│   │   ├── appointments/
│   │   │   └── route.ts        # Appointment API Routing Node
│   │   ├── financial/
│   │   │   └── route.ts        # Financial Desk Billing API Endpoint
│   │   ├── patients/
│   │   │   └── route.ts        # Patient Registration Logs API
│   │   └── pharmacy/
│   │       └── route.ts        # Pharmacy & Inventory Sync API
│   ├── appointment/
│   │   └── page.tsx            # Appointment Staff Terminal View
│   ├── financial/
│   │   └── page.tsx            # Finance Desk Billing Console View
│   ├── patient/
│   │   └── page.tsx            # Patient Management Desktop View
│   ├── pharmacy/
│   │   └── page.tsx            # Pharmacy Stock Control Interface View
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Master Authentication Landing Page
├── components/
│   └── Sidebar.tsx             # Shared Dashboard Layout Navigation Hub
├── node_modules/
├── public/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── medicore.db
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
``` 

---

## 🗄️ Relational Database Architecture

The system utilizes a structured relational database engine configured within a MySQL environment. While keys are handled dynamically via application API controllers, the structural relationships map as follows:

```text
  [patients]                       [appointments]
  ├── id (PK) <──────────────┐     ├── id (PK)
  ├── name                   ├──── ├── patientId (Logical FK)
  ├── dob                    │     ├── doctorId
  ├── gender                 │     ├── appointmentDate
  ├── contact                │     ├── appointmentTime
  ├── address                │     ├── status
  └── createdAt              │     └── createdAt
                             │
                             │     [bills]
                             │     ├── id (PK)
                             └──── ├── patientId (Logical FK)
                                   ├── amount
                                   ├── billDate
                                   ├── status
                                   └── createdAt

  [medicines]
  ├── id (PK)
  ├── name
  ├── quantity
  ├── expiryDate
  ├── price
  └── createdAt

```
---

## 🏃 Getting Started

1. Clone the Workspace Matrix
   
   ```text
   git clone [https://github.com/yourusername/medi-core-erp-app.git](https://github.com/yourusername/medi-core-erp-app.git)
   cd medi-core-erp-app
   ```
2. Install Project Dependencies
   
   ```text
   npm install
   ```

3. Launch the Local Development Ecosystem
Because native binary database modules can clash with automated experimental bundlers on Windows architectures, force the stable Webpack compiler:

   ```text
   npx next dev --webpack
   ```

---


## 🔐 Station Passkeys Reference

Use the following pre-configured credentials to access and authenticate into the different departmental dashboard terminals:

| Department Station | Access Email | Terminal Password |
| :--- | :--- | :--- |
| **👑 Root Admin Panel** | `admin@gmail.com` | `Admin` |
| **🏥 Patient Station** | `patient@gmail.com` | `patient123` |
| **📅 Appointments Desk** | `appointment@gmail.com` | `appointment123` |
| **💊 Pharmacy Unit** | `pharmacy@gmail.com` | `pharmacy123` |
| **💳 Financial Desk** | `financial@gmail.com` | `financial123` |

> ⚠️ **Security Note:** These credentials are hardcoded for local development and testing environments only. Ensure they are migrated to encrypted environment variables prior to production deployment.
   
