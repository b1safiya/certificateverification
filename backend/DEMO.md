# DEMO - Certificate Verification System

This demo describes how to run the project, import the provided Excel, search for a certificate and download a server-generated PDF.

## 1) Backend
```bash
cd backend
npm install
# ensure MongoDB is running locally (mongod)
# seed the DB with the included Excel:
npm run seed
# start the server
npm run dev
```

- Seed reads `backend/uploads/students.xlsx` and upserts rows into the `certificates` collection.
- Server runs at `http://localhost:5000` by default.

## 2) Frontend
```bash
cd frontend
npm install
# optionally set REACT_APP_API_URL=http://localhost:5000 in frontend/.env
npm start
```

## 3) Search & Download
- Open the frontend in the browser (http://localhost:3000).
- Use the **Search** tab to enter a `certificateId` (matching the Excel) and view certificate details.
- To download a server-generated PDF, either:
  - Click the **Download PDF (server)** button in the certificate view (calls `/api/certs/download/:id`), or
  - Use curl:
    ```bash
    curl -o certificate.pdf http://localhost:5000/api/certs/download/<CERTIFICATE_ID>
    ```

## 4) Admin - Upload Excel from UI
- Open the **Admin** tab in the frontend.
- Choose an Excel file and upload — the backend will import rows and upsert certificates.

