Here's a comprehensive README.md you can paste on GitHub:

```markdown
# Asset Inventory Management System

A full-stack asset inventory management system built with React TypeScript frontend and Node.js backend with Prisma ORM.

## 🚀 Features

- **Asset Management** - Track, add, edit, and delete assets
- **User Authentication** - Secure login and registration
- **Advanced Filtering** - Filter assets by various criteria
- **Bulk Operations** - Perform actions on multiple assets
- **Export/Import** - Data import/export functionality
- **Activity Logging** - Track all system activities
- **Responsive Design** - Works on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library

### Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **SQLite** - Database (development)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Python (for running the project structure viewer)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Seishiru/inventory-asset.git
cd inventory-asset
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Database Setup
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 4. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
```

### 5. Run the Application

#### Option A: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on http://localhost:5173

#### Option B: Run with Project Structure Viewer
```bash
python view.py
```

## 📁 Project Structure

```
Asset-inventory/
├── backend/                 # Node.js backend
│   ├── prisma/            # Database schema and migrations
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   └── *.tsx             # Feature components
├── styles/               # CSS styles
├── MD/                   # Documentation
└── *.config.js           # Configuration files
```

## 🗄 Database Models

- **Users** - User accounts and authentication
- **Assets** - Asset information and metadata
- **Brands** - Asset brands and manufacturers
- **AuditLogs** - Activity tracking

## 🎯 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Scripts
```bash
cd backend
npm run dev          # Start backend server
npm run build        # Build backend
npx prisma studio    # Database GUI
```

## 🔧 API Endpoints

- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## 📱 Key Components

- **AssetInventory** - Main asset management interface
- **AssetDialog** - Add/edit asset form
- **FilterBar** - Advanced filtering
- **BulkActionsMenu** - Bulk operations
- **ExportMenu** - Data export functionality
- **ActivityLogPage** - Activity tracking

## 🛠 Development

### Adding New Components
```bash
# Using Shadcn/UI
npx shadcn-ui@latest add [component-name]
```

### Database Changes
```bash
cd backend
npx prisma migrate dev --name [migration-name]
```

## 📄 Documentation

Check the `MD/` directory for detailed documentation:
- `USER_GUIDE.md` - User instructions
- `FEATURE_VERIFICATION.md` - Feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical overview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

## 📝 License

This project is licensed under the MIT License.
```

This README includes:
- Clear setup instructions
- Technology stack
- Project structure overview
- How to run both frontend and backend
- API information
- Development guidelines

You can paste this directly into your GitHub repository's README.md file!
