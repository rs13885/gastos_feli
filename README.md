# Shared Expenses App

A modern, responsive web application to track shared expenses, replacing the Google Sheets workflow.

## Features

- **Add/Edit Expenses**: Categorize expenses (Vivienda, Salud, Educación, etc.).
- **Automatic Calculations**: Calculates proportional shares based on percentage.
- **Monthly History**: View expenses by month.
- **Copy Month**: Easily import expenses from the previous month to the current one.
- **Clear Month**: Quickly wipe all expenses for the current month.
- **Fast Actions**: Quick addition and deletion of expenses without tedious confirmations.
- **Responsive Design**: Works on mobile and desktop.
- **Premium UI**: Clean, modern interface with instant feedback.

## Local Development

### Prerequisites

- Node.js installed.

### Setup

1. **Server**:

   ```bash
   cd server
   npm install
   npm start
   ```

   Server runs on `http://localhost:3000`.

2. **Client**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

   Client runs on `http://localhost:5173`.

### Initial Data

To seed the database with the data from your screenshot (Jan 2026):

```bash
cd server
node seed.js
```

## Deployment on VPS

1. **Upload** the project to your VPS.
2. **Run** with Docker Compose:

   ```bash
   docker-compose up -d --build
   ```

3. Access the app at `http://YOUR_VPS_IP`.
