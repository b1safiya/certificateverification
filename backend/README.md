# Backend - Certificate Verification System

## Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file (provided) or ensure MONGO_URI is correct.
4. Run seed to import the provided Excel: `npm run seed`
5. Start server: `npm run dev` (requires nodemon) or `npm start`

## API Endpoints
- `POST /api/auth/register` - create admin or user (body: name,email,password,role)
- `POST /api/auth/login` - login (body: email,password)
- `POST /api/certs/upload-excel` - upload an Excel file (multipart/form-data, field `file`)
- `GET /api/certs/search/:id` - search certificate by certificateId
