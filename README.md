# Doc Sign

Doc Sign is a full-stack document request and signature workflow for court-based teams. It includes separate admin, reader, and officer portals, generates PDF exports with QR codes, and exposes a public verification page for each request.

## What It Does

- Admins manage courts, officers, readers, and request visibility from a dashboard.
- Readers create document requests, fill request details, choose a court, and send the request to an officer for signature.
- Officers review assigned requests, reject them, or sign them by uploading a signature image.
- Signed or pending requests can be exported as PDFs.
- Every request can be opened through a public route and QR code for status viewing and PDF download.

## Main Workflow

1. An admin creates courts and user accounts.
2. A reader creates a request and fills in case/customer details.
3. The reader assigns the request to an officer from the same court.
4. The officer signs or rejects the request.
5. The system generates a PDF and public verification link for the request.

## Tech Stack

### Client

- React 19
- Vite
- React Router 7
- Zustand
- Axios
- Tailwind CSS v4
- Radix UI / shadcn-style components

### Server

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication with cookies
- express-validator
- PDFKit
- QRCode
- worker_threads for PDF generation
- Node cluster for multi-core server workers

## Project Structure

```text
.
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- store/
|   |   `-- lib/
|   `-- package.json
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- validations/
|   |-- workers/
|   |-- app.js
|   |-- server.js
|   `-- package.json
`-- README.md
```

## Roles

### Admin

- View dashboard counts for courts, officers, readers, and requests
- Create and delete courts
- Create and delete officers/readers
- View all requests in the system

### Reader

- Create draft requests
- Fill request details
- Fetch officers by court
- Send requests for signature
- Delete owned requests
- Download request PDFs

### Officer

- View assigned requests
- Reject pending requests
- Sign pending requests
- Download request PDFs

### Public

- View request status by request ID
- Download a public copy of the request PDF

## Request Statuses

- `draft`
- `pending-sign`
- `rejected`
- `signed`

## Environment Variables

Create a `server/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/doc-sign
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

Create a `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd client
npm install
```

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Seed the first admin user:

```bash
cd server
npm run seed:Admin
```

Frontend default URL:

```text
http://localhost:5173
```

Backend health check:

```text
GET http://localhost:5000/api/health
```

## API Overview

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/courts`
- `GET /api/admin/officers`
- `GET /api/admin/readers`
- `GET /api/admin/requests`
- `POST /api/admin/user`
- `POST /api/admin/court`
- `DELETE /api/admin/users/:id`
- `DELETE /api/admin/courts/:id`

### Reader

- `GET /api/reader/courts`
- `GET /api/reader/requests`
- `GET /api/reader/officers?courtId=...`
- `POST /api/reader/requests`
- `PUT /api/reader/requests/:id/details`
- `POST /api/reader/requests/:id/send`
- `DELETE /api/reader/requests/:id`
- `GET /api/reader/requests/:id/pdf`

### Officer

- `GET /api/officer/requests`
- `POST /api/officer/requests/:id/reject`
- `POST /api/officer/requests/:id/sign`
- `GET /api/officer/requests/:id/pdf`

### Public

- `GET /api/requests/:id`
- `GET /api/requests/:id/pdf`

## Important Notes

- Authentication is cookie-based and the current login cookie is configured with `secure: true` and `sameSite: "None"`. For plain HTTP local development, you may need HTTPS or a small cookie-setting adjustment in `server/controllers/authController.js`.
- The backend starts one worker per CPU core because `server/server.js` uses Node's cluster module.
- PDF generation runs in a worker thread through `server/utils/pdfWorker.js` and `server/workers/pdfWorker.js`.
- There are currently no automated tests configured in this repository.

## Scripts

### Server

- `npm run dev` - start the backend with nodemon
- `npm start` - start the backend with Node
- `npm run seed:Admin` - create the initial admin user

### Client

- `npm run dev` - start the Vite dev server
- `npm run build` - build the client
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint
