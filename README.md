 HEAD
# Certificate Verification System (MERN)

This repository contains a Certificate Verification System (MERN) which allows:
- Admins to upload an Excel with student certificate data.
- Students to search by certificate ID and download/print their certificate.

## Structure
- backend/ - Express + Mongoose backend
- frontend/ - React frontend
- backend/uploads/students.xlsx - the Excel file you provided is included here.

## Quick start
1. Ensure MongoDB is running locally.
2. Backend:
   - `cd backend`
   - `npm install`
   - Edit `.env` if needed.
   - `npm run seed`   # imports the included students.xlsx into MongoDB
   - `npm run dev` or `npm start`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - Ensure `REACT_APP_API_URL` (default http://localhost:5000) points to backend
   - `npm start`


## New features added
- Server-side PDF generation endpoint: `GET /api/certs/download/:id`
- Admin UI to upload Excel from the frontend (`/admin` tab)
- Improved frontend visuals and placeholder logo
# certificateverification
 7802b00ee528fdf801f31cf162dd5f75e54bdc23
