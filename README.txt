╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                     🏢 ASSET INVENTORY MANAGEMENT SYSTEM 🏢                  ║
║                                                                              ║
║                              Version 1.0.0-beta                              ║
║                                                                              ║
║                        Author: Cecil Quibranza                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝


📋 TABLE OF CONTENTS
════════════════════════════════════════════════════════════════════════════════
  1. System Overview
  2. Prerequisites & Requirements
  3. Installation Guide
  4. Running the Application
  5. Git & Version Control
  6. Technology Stack
  7. Project Structure
  8. Troubleshooting
  9. Important Notes


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  SYSTEM OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A comprehensive full-stack web application for managing organizational assets 
and accessories. Features include:

  ✅ Asset & Accessory Management (CRUD Operations)
  ✅ User Management with Role-Based Access
  ✅ Activity Logging & Audit Trail
  ✅ Monthly Inventory Reports with Charts
  ✅ Status Tracking (On-Stock, Issued, Maintenance, Retired)
  ✅ Search, Filter & Export Capabilities
  ✅ Real-time Data Synchronization


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣  PREREQUISITES & REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Required Software:
────────────────────────────────────────────────────────────────────────────────

  🟢 Node.js (v18.0.0 or higher)
     └─ Download: https://nodejs.org/
     └─ Verify: node --version

  🟢 npm (v9.0.0 or higher) - comes with Node.js
     └─ Verify: npm --version

  🟢 MySQL Database (v8.0 or higher)
     └─ XAMPP (Recommended for Windows)
        • Download: https://www.apachefriends.org/
        • Start Apache and MySQL services
     └─ OR standalone MySQL Server
     └─ Default Port: 3306

  🟢 Git (v2.30.0 or higher)
     └─ Download: https://git-scm.com/
     └─ Verify: git --version

  🟢 Python (v3.8 or higher) - for barcode generation
     └─ Download: https://www.python.org/
     └─ Verify: python --version
     └─ Required packages: barcode, pillow


📌 Optional Tools:
────────────────────────────────────────────────────────────────────────────────

  • Visual Studio Code (Recommended IDE)
  • Postman or Thunder Client (API Testing)
  • MySQL Workbench (Database Management)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣  INSTALLATION GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 STEP 1: Clone the Repository
────────────────────────────────────────────────────────────────────────────────

Open your terminal/command prompt and run:

  git clone https://github.com/Seishiru/inventory-asset.git
  cd inventory-asset


📦 STEP 2: Install Frontend Dependencies
────────────────────────────────────────────────────────────────────────────────

Navigate to the root directory and install:

  npm install

This will install all React, TypeScript, and UI dependencies including:
  • React 18.x
  • TypeScript 5.x
  • Vite (Build tool)
  • TailwindCSS
  • Radix UI Components
  • Recharts (for data visualization)
  • Sonner (toast notifications)


📦 STEP 3: Install Backend Dependencies
────────────────────────────────────────────────────────────────────────────────

Navigate to the Backend folder:

  cd Backend
  npm install

This will install:
  • Express.js (Web framework)
  • Prisma ORM (Database toolkit)
  • TypeScript
  • Node.js type definitions
  • CORS middleware
  • dotenv (environment variables)


🗄️ STEP 4: Database Setup
────────────────────────────────────────────────────────────────────────────────

4.1) Start MySQL Server:
     • If using XAMPP: Start MySQL from XAMPP Control Panel
     • If using standalone MySQL: Start the MySQL service

4.2) Create Database:
     Open MySQL CLI or phpMyAdmin and create the database:

       CREATE DATABASE ams;

4.3) Configure Environment Variables:
     Create a .env file in the Backend directory:

       cd Backend
       # On Windows:
       copy .env.example .env
       # On Mac/Linux:
       cp .env.example .env

     Edit the .env file with your database credentials:

       DATABASE_URL="mysql://root@127.0.0.1:3306/ams"
       PORT=4000

     Replace "root" with your MySQL username if different.
     Add password if needed: "mysql://root:yourpassword@127.0.0.1:3306/ams"

4.4) Run Prisma Migrations:
     Apply the database schema:

       npx prisma db push
       npx prisma generate

     This will create all necessary tables:
       • loginuser
       • AssetTypeOption
       • BrandMakeOption
       • ActivityLog
       • EquipmentAsset
       • AccessoryAsset
       • UserManagement
       • MonthlyReport
       • AuditLog


🐍 STEP 5: Python Dependencies (Optional - for barcode generation)
────────────────────────────────────────────────────────────────────────────────

  pip install python-barcode pillow


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣  RUNNING THE APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Quick Start (Recommended)
────────────────────────────────────────────────────────────────────────────────

You need TWO terminal windows:

┌─────────────────────────────────────────────────────────────────────────────┐
│ TERMINAL 1: Backend Server                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Navigate to Backend folder:                                            │
│     cd Backend                                                              │
│                                                                             │
│  2. Start the backend server:                                              │
│     npm run dev                                                             │
│                                                                             │
│  3. Verify it's running:                                                   │
│     ✅ Should see: "Server listening on http://localhost:4000"             │
│     ✅ Should see: "AMS backend running - Connected to database"           │
│                                                                             │
│  📍 Backend API: http://localhost:4000                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ TERMINAL 2: Frontend Development Server                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Navigate to root directory (open a NEW terminal):                      │
│     cd inventory-asset                                                      │
│                                                                             │
│  2. Start the frontend dev server:                                         │
│     npm run dev                                                             │
│                                                                             │
│  3. Verify it's running:                                                   │
│     ✅ Should see: "Local: http://localhost:5173"                          │
│     ✅ Browser should auto-open                                            │
│                                                                             │
│  📍 Frontend App: http://localhost:5173                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


🔐 Default Login Credentials
────────────────────────────────────────────────────────────────────────────────

After starting both servers, navigate to http://localhost:5173

  You'll need to create an account first:
  1. Click "Sign Up" on the login page
  2. Create an admin account
  3. Use those credentials to login


📊 Testing the System
────────────────────────────────────────────────────────────────────────────────

Once logged in, you can:

  1. ➕ Add Assets/Accessories
  2. 🔍 Search and Filter items
  3. 📝 Update item status (Issue, Return, Maintenance)
  4. 👥 Manage users (User Management page)
  5. 📈 View monthly reports with charts
  6. 📜 Check activity logs
  7. 💾 Export data to CSV/JSON/Excel


🛑 Stopping the Application
────────────────────────────────────────────────────────────────────────────────

Press Ctrl + C in each terminal window to stop the servers.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5️⃣  GIT & VERSION CONTROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Common Git Commands
────────────────────────────────────────────────────────────────────────────────

  # Check current status
  git status

  # View all branches
  git branch -a

  # Create and switch to new branch
  git checkout -b feature/your-feature-name

  # Stage all changes
  git add .

  # Commit changes
  git commit -m "Your commit message"

  # Push to remote repository
  git push origin main

  # Pull latest changes
  git pull origin main

  # View commit history
  git log --oneline


📌 Branch Strategy
────────────────────────────────────────────────────────────────────────────────

  main          → Production-ready code
  develop       → Development branch
  feature/*     → New features
  bugfix/*      → Bug fixes
  hotfix/*      → Urgent production fixes


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6️⃣  TECHNOLOGY STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend Stack:
────────────────────────────────────────────────────────────────────────────────
  ⚛️  React 18.3.1           - UI Library
  📘 TypeScript 5.9.3        - Type-safe JavaScript
  ⚡ Vite 6.0.11             - Build Tool & Dev Server
  🎨 TailwindCSS 3.4.17      - Utility-first CSS
  🧩 Radix UI               - Accessible Components
  📊 Recharts 2.15.0        - Data Visualization
  🔔 Sonner 1.7.3           - Toast Notifications
  🎭 Lucide React 0.468.0   - Icons

Backend Stack:
────────────────────────────────────────────────────────────────────────────────
  🟢 Node.js 18+            - Runtime Environment
  🚂 Express 4.21.2         - Web Framework
  🗄️  Prisma 6.2.0          - ORM & Database Toolkit
  📘 TypeScript 5.9.3       - Type-safe Backend
  🗃️  MySQL 8.0+            - Relational Database
  🔐 dotenv 16.4.7          - Environment Variables
  🌐 CORS                   - Cross-Origin Support

Development Tools:
────────────────────────────────────────────────────────────────────────────────
  🐍 Python 3.8+            - Barcode Generation
  📦 npm 9+                 - Package Manager
  🔧 ts-node-dev 2.0.0      - TypeScript Dev Server
  🎯 Git 2.30+              - Version Control


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7️⃣  PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

inventory-asset/
│
├── 📁 Backend/                      # Backend Node.js + Express API
│   ├── 📁 src/
│   │   ├── 📁 routes/               # API route handlers
│   │   │   ├── accessories.ts      # Accessory CRUD
│   │   │   ├── assets.ts           # Asset CRUD
│   │   │   ├── auth.ts             # Login/Signup
│   │   │   ├── activityLog.ts      # Activity logging
│   │   │   ├── monthlyReports.ts   # Report generation
│   │   │   ├── usermanagement.ts   # User CRUD
│   │   │   ├── brands.ts           # Brand management
│   │   │   └── assetTypeOptions.ts # Asset type options
│   │   ├── index.ts                # Main server entry point
│   │   └── prismaClient.ts         # Database client
│   ├── 📁 prisma/
│   │   └── schema.prisma           # Database schema
│   ├── package.json                # Backend dependencies
│   └── .env                        # Environment variables (create this!)
│
├── 📁 components/                   # React UI Components
│   ├── ActivityLogFullPage.tsx     # Activity log page
│   ├── ActivityLogPage.tsx         # Activity log modal
│   ├── AssetDialog.tsx             # Add/Edit asset dialog
│   ├── AccessoriesDialog.tsx       # Add/Edit accessory dialog
│   ├── MonthlyReportsPage.tsx      # Monthly reports with charts
│   ├── UserManagementPage.tsx      # User management
│   ├── LoginDialog.tsx             # Login modal
│   ├── SignupDialog.tsx            # Signup modal
│   ├── SettingsPanel.tsx           # Settings sidebar
│   ├── AuthContext.tsx             # Authentication context
│   └── 📁 AssetInventory/          # Main inventory components
│       ├── index.tsx               # Main inventory page
│       ├── AssetInventoryTable.tsx # Asset table
│       └── 📁 hooks/
│           └── useAssetData.ts     # Data management hook
│
├── 📁 styles/
│   └── globals.css                 # Global styles + Tailwind
│
├── App.tsx                         # Root component
├── AppContent.tsx                  # Main app routing
├── main.tsx                        # React entry point
├── index.html                      # HTML template
├── package.json                    # Frontend dependencies
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript config
├── barcode_generator.py            # Python barcode generator
├── CODE_REVIEW_FINDINGS.md         # 📖 IMPORTANT: Read this!
└── README.txt                      # This file


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8️⃣  TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Problem: "Cannot find module '@prisma/client'"
────────────────────────────────────────────────────────────────────────────────
  Solution:
    cd Backend
    npx prisma generate

❌ Problem: "Error: P1001: Can't reach database server"
────────────────────────────────────────────────────────────────────────────────
  Solution:
    1. Ensure MySQL is running (check XAMPP)
    2. Verify DATABASE_URL in Backend/.env
    3. Check if port 3306 is available

❌ Problem: "Port 4000 already in use"
────────────────────────────────────────────────────────────────────────────────
  Solution:
    # On Windows:
    netstat -ano | findstr :4000
    taskkill /PID <process_id> /F
    
    # On Mac/Linux:
    lsof -ti:4000 | xargs kill -9

❌ Problem: "Port 5173 already in use"
────────────────────────────────────────────────────────────────────────────────
  Solution:
    # Kill the process using port 5173
    # Or change port in package.json dev script:
    "dev": "vite --port 5174"

❌ Problem: CORS errors in browser console
────────────────────────────────────────────────────────────────────────────────
  Solution:
    1. Ensure backend is running on port 4000
    2. Check Backend/src/index.ts has CORS middleware
    3. Clear browser cache

❌ Problem: "Module not found" errors
────────────────────────────────────────────────────────────────────────────────
  Solution:
    # Delete node_modules and reinstall
    rm -rf node_modules package-lock.json
    npm install
    
    # For backend:
    cd Backend
    rm -rf node_modules package-lock.json
    npm install

❌ Problem: Prisma migration errors
────────────────────────────────────────────────────────────────────────────────
  Solution:
    cd Backend
    npx prisma db push --force-reset
    npx prisma generate

❌ Problem: Login not working
────────────────────────────────────────────────────────────────────────────────
  Solution:
    1. Check browser console for errors
    2. Verify backend is running and accessible
    3. Open http://localhost:4000 to check backend status
    4. Create a new account using Sign Up


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9️⃣  IMPORTANT NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  SECURITY WARNING
────────────────────────────────────────────────────────────────────────────────
  This application currently stores passwords in PLAIN TEXT and lacks proper
  authentication middleware. This is NOT production-ready.
  
  DO NOT use in production without implementing:
    ✅ Password hashing (bcrypt)
    ✅ JWT authentication
    ✅ Role-based access control
    ✅ Input validation
    ✅ SQL injection protection


📖 REQUIRED READING
────────────────────────────────────────────────────────────────────────────────
  
  ⚠️  IMPORTANT: Before deploying or continuing development, please read:
  
      📄 CODE_REVIEW_FINDINGS.md
  
  This document contains:
    • Critical security vulnerabilities
    • Missing features and incomplete implementations
    • Priority matrix for fixes
    • 4-week development roadmap
    • Code examples for required fixes
    • Technical debt assessment
  
  Location: ./CODE_REVIEW_FINDINGS.md


📝 Development Notes
────────────────────────────────────────────────────────────────────────────────

  • Current Version: 1.0.0-beta (Not production-ready)
  • Database: MySQL with Prisma ORM
  • Frontend runs on port 5173
  • Backend API runs on port 4000
  • Activity logs are stored in database
  • Monthly reports can be archived
  • Status values: On-Stock, Issued, Maintenance, Retired, Reserve


🎯 Known Limitations
────────────────────────────────────────────────────────────────────────────────

  ❌ No password hashing (security risk)
  ❌ No JWT authentication
  ❌ No file upload for images/attachments
  ❌ Barcode generation not integrated
  ❌ No bulk import functionality
  ❌ PDF export shows placeholder
  ❌ No email notifications
  ❌ No unit tests
  ❌ No API documentation


📞 Support & Contact
────────────────────────────────────────────────────────────────────────────────

  Author: Cecil Quibranza
  Repository: https://github.com/Seishiru/inventory-asset
  Version: 1.0.0-beta
  Last Updated: November 29, 2025


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        🎉 Happy Coding! 🎉
                        
    If you encounter any issues, check the Troubleshooting section first,
           then refer to CODE_REVIEW_FINDINGS.md for known issues.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              ⚠️  REMINDER: READ CODE_REVIEW_FINDINGS.md  ⚠️                 ║
║                                                                              ║
║   This file contains critical information about security vulnerabilities,   ║
║   missing features, and required fixes before production deployment.        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
