# Travel Photo Journal

A web app for travellers to capture and document their experiences with trips and journal entries. Users can create trips, write journal entries, and attach photos to those entries. Public trips are visible to other users via a shared feed.

## Live Demo

**Public URL:** http://16.176.192.94

### Test Credentials

Use these to log in and explore the dashboard:

- **Username:** `jrmilburn@outlook.com`
- **Password:** `Diniwho1!`

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Atlas)
- **File uploads:** Multer
- **Authentication:** JWT
- **Process manager:** PM2
- **Web server / reverse proxy:** Nginx
- **CI/CD:** GitHub Actions (self-hosted runner on AWS EC2)

## Features

- User registration and login
- Create, view, and manage personal trips
- Add journal entries to each trip
- Upload photos to journal entries
- Browse a public feed of trips shared by other users

## Project Setup (Local Development)

### Prerequisites

- Node.js v22
- Yarn
- MongoDB connection string

### Backend

```bash
cd backend
yarn install
```

Create a `.env` file in the `backend/` folder:

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<any long random string>
PORT=5001
```

Start the backend:

```bash
yarn start
```

The backend will run on `http://localhost:5001`.

### Frontend

```bash
cd frontend
yarn install
yarn start
```

The frontend will run on `http://localhost:3000` and connect to the local backend by default.

## Deployment

The app is deployed to AWS EC2 using GitHub Actions with a self-hosted runner. On every push to `main`, the workflow installs dependencies, runs backend tests, rebuilds the frontend, and restarts the app via PM2. Nginx handles incoming traffic on port 80 and proxies requests to the frontend.