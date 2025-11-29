# Inventory Backend (Prisma + Express)

This backend uses Prisma with a MySQL database (XAMPP) and provides simple CRUD routes for `Asset`.

Quick setup (PowerShell, from repo root):

```powershell
cd Backend
npm install

# copy and edit .env
copy .env.example .env
# edit .env to set your MySQL root password and DB name (use phpMyAdmin or mysql CLI to create the DB)

# generate Prisma client
npx prisma generate

# create tables (requires the DB exists and DATABASE_URL set correctly)
npx prisma migrate dev --name init

# run dev server
npm run dev
```

Default endpoints:
- `GET /assets` - list assets
- `POST /assets` - create asset (JSON body)
- `GET /assets/:id` - get asset
- `PUT /assets/:id` - update asset
- `DELETE /assets/:id` - delete asset

Notes:
- XAMPP provides MySQL; create a database (e.g. `inventory_db`) in phpMyAdmin and update `DATABASE_URL` in `.env`.
- Use `npx prisma studio` to inspect data visually.
