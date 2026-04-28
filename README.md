# Promise Tracker SL 🇱🇰

Promise Tracker SL is a full-stack civic engagement platform built to help citizens explore politicians and parties, monitor public promises, review evidence, follow governance-related news, and participate through petitions and feedback.

## ✨ Project Overview

The platform is designed around two main sides:

### Public Side
Citizens and guests can:
- Browse politician profiles
- Browse party profiles
- Explore petitions and sign approved petitions
- View political/governance news
- Search across the platform
- Register and log in

### Admin Side
Admins can:
- Manage politicians
- Manage parties
- Review petitions
- Manage promises
- Approve or reject petitions with reasons
- Moderate and maintain platform data

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Express Validator
- Multer

### Third-Party Integrations
- Cloudinary
- RSS / News scraping utilities - Dailymirror RSS
- Email service - SendGrid

---

## 🏗️ Repository Structure

```text
promise_tracker_sl/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── configs/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── package.json
└── README.md
```
---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/mahenperera/promise_tracker_sl.git
cd promise_tracker_sl
```
### 2. Backend setup

```bash
cd server
npm install
```
Create a .env file inside the server folder.

### Backend environment variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_email_from
```
### Run backend

```bash
npm run dev
```
Backend runs on:
```
http://localhost:5000
```
### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
```
Create a .env file inside the client folder.

Frontend environment variables:
```
VITE_API_BASE_URL=http://localhost:5000/api
```
### Run frontend

```bash
npm run dev
```
Frontend runs on:
```
http://localhost:5173
```
### 4. Running the full project

1. Start the backend first
2. Start the frontend
3. Open the frontend in the browser
4. Register or log in
5. Use public pages as a guest/citizen
6. Use admin credentials to access the admin panel
---
## 📦 Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
### Backend

```bash
npm run dev
npm start
npm test
```
---

## 🔐 Authentication & Authorization

The system uses **JWT-based authentication** for protected routes.

### Authorization header format

```http
Authorization: Bearer <jwt_token>
```

### Roles

- `admin`
- `citizen`

### Access rules

- Public pages can be viewed without logging in
- Creating petitions, signing petitions, and user-specific features require login
- Admin management routes require the `admin` role

---

## 📡 API Endpoint Documentation

### Base URL

```text
http://localhost:5000/api
```
### Standard response format

#### Success response

```json
{
  "message": "Success message",
  "data": {}
}
```
#### List response

```json
{
  "message": "Items fetched",
  "items": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```
#### Error response

```json
{
  "message": "Validation failed",
  "errors": ["field is required"]
}
```
---

## 1. Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/admins` | Public | Get admin users |

### Register example

#### Request

```http
POST /api/auth/register
Content-Type: application/json
```
```json
{
  "email": "citizen@example.com",
  "password": "12345678",
  "role": "citizen"
}
```
#### Response

```json
{
  "message": "User registered",
  "token": "<jwt_token>",
  "user": {
    "userId": "uuid-value",
    "email": "citizen@example.com",
    "role": "citizen"
  }
}
```

### Login example

#### Request

```http
POST /api/auth/login
Content-Type: application/json
```
```json
{
  "email": "admin@example.com",
  "password": "12345678"
}
```

#### Response

```json
{
  "token": "<jwt_token>",
  "user": {
    "userId": "uuid-value",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```
---

## 2. Politicians

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/politicians` | Public / Optional JWT | List politicians with search and pagination |
| GET | `/api/politicians/slug/:slug` | Public / Optional JWT | Get politician by slug |
| GET | `/api/politicians/:id` | Public / Optional JWT | Get politician by ID |
| POST | `/api/politicians` | Admin | Create politician |
| PATCH | `/api/politicians/:id` | Admin | Update politician |
| DELETE | `/api/politicians/:id` | Admin | Deactivate politician |


### Query parameters

- `search`
- `page`
- `limit`
- `isActive`

### Example create request

```json
{
  "fullName": "Anura Kumara Dissanayaka",
  "slug": "anura-kumara-dissanayaka",
  "party": "National People's Power",
  "partyLogoUrl": "https://example.com/logo.png",
  "district": "Colombo",
  "position": "President of Sri Lanka",
  "photoUrl": "https://example.com/photo.jpg",
  "bio": "Short biography here.",
  "socialLinks": {
    "websiteUrl": "https://example.com",
    "facebookUrl": "https://facebook.com/example",
    "twitterUrl": "https://x.com/example",
    "youtubeUrl": "https://youtube.com/@example"
  },
  "isActive": true
}
```
## 3. Parties

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/parties` | Public / Optional JWT | List parties |
| GET | `/api/parties/:slug` | Public / Optional JWT | Get party profile by slug |
| GET | `/api/parties/:slug/politicians` | Public / Optional JWT | Get politicians linked to a party |
| POST | `/api/parties` | Admin | Create party |
| PATCH | `/api/parties/:id` | Admin | Update party |
| DELETE | `/api/parties/:id` | Admin | Deactivate party |

### Query parameters

- `search`
- `page`
- `limit`
- `isActive`

### Example create request

```json
{
  "name": "National People's Power",
  "code": "NPP",
  "slug": "npp",
  "logoUrl": "https://example.com/logo.png",
  "websiteUrl": "https://example.com",
  "description": "Party description here.",
  "isActive": true
}
```

---

## 4. Petitions

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/petitions` | Public | List approved public petitions |
| GET | `/api/petitions/:id` | Public / Owner / Admin | Get petition by ID |
| POST | `/api/petitions` | Citizen / Admin | Create petition |
| GET | `/api/petitions/mine/list` | Citizen / Admin | Get petitions created by logged-in user |
| POST | `/api/petitions/:id/sign` | Citizen / Admin | Sign an approved petition |
| GET | `/api/petitions/admin/all` | Admin | List all petitions for admin review |
| PATCH | `/api/petitions/admin/:id/approve` | Admin | Approve a petition |
| PATCH | `/api/petitions/admin/:id/reject` | Admin | Reject a petition with a reason |

### Query parameters

- `search`
- `page`
- `limit`
- `status`

### Example create petition request

```json
{
  "title": "Improve waste collection in our area",
  "subjectLine": "Waste management",
  "addressedTo": "Municipal Council",
  "body": "Issue: Waste is not collected regularly.\n\nRequested action: Please improve the waste collection service in this area.",
  "evidenceSummary": "Photos attached",
  "deadline": "2026-04-12",
  "attachments": [
    "https://res.cloudinary.com/example/image/upload/sample.jpg"
  ],
  "declarationAccepted": true
}
```
### Example reject request

```json
{
  "rejectionReason": "The petition needs clearer supporting information."
}
```
### Example sign response

```json
{
  "message": "Signed successfully",
  "signCount": 3
}
```
## 5. Promises

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/promises` | Public | List promises |
| GET | `/api/promises/:id` | Public | Get promise by ID |
| POST | `/api/promises` | Admin | Create promise |
| PATCH | `/api/promises/:id` | Admin | Update promise |
| DELETE | `/api/promises/:id` | Admin | Delete or deactivate promise |
| GET | `/api/promises/admin/all` | Admin | List promises for admin |
| PATCH | `/api/promises/admin/:id/status` | Admin | Update promise status |


### Example create request

```json
{
  "politicianId": "mongo_object_id",
  "title": "Reduce corruption in public institutions",
  "slug": "reduce-corruption-in-public-institutions",
  "description": "Promise description here.",
  "category": "Governance",
  "status": "pending",
  "promiseDate": "2026-01-01"
}
```
## 6. Evidence

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/evidence/promise/:promiseId` | Public | Get evidence for a promise |
| GET | `/api/evidence/:id/votes` | Public | Get evidence verification info |
| GET | `/api/evidence/gallery/:promiseId` | Public | Get evidence gallery |
| GET | `/api/evidence/user` | Authenticated | Get evidence submitted by current user |
| POST | `/api/evidence` | Authenticated | Submit evidence |
| POST | `/api/evidence/:id/verify` | Authenticated | Verify or flag evidence |
| DELETE | `/api/evidence/:id` | Authenticated | Delete evidence |
| PATCH | `/api/evidence/:id/status` | Admin | Update evidence status |

### Add evidence request

This endpoint uses **multipart/form-data**.

#### Fields

- `promiseId`
- `title`
- `description`
- `dateOccurred`
- `media`

## 7. Feedback

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/feedback/:id/feedback` | Public | Get feedback for a promise |
| POST | `/api/feedback/:id/feedback` | Citizen | Add feedback |
| PATCH | `/api/feedback/:id/approve` | Admin / Moderator | Approve feedback |
| DELETE | `/api/feedback/:id` | Admin / Moderator | Delete feedback |

### Example request

```json
{
  "content": "This promise still needs stronger implementation."
}
```
## 8. Ratings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/ratings/promise/:promiseId/average` | Public | Get average rating |
| GET | `/api/ratings/promise/:promiseId` | Public | Get all ratings |
| POST | `/api/ratings` | Authenticated | Add rating |
| PUT | `/api/ratings/:id` | Authenticated | Update rating |
| DELETE | `/api/ratings/:id` | Authenticated | Delete rating |

### Example request

```json
{
  "promiseId": "mongo_object_id",
  "rating": 4
}
```

## 9. Tickets

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/tickets` | Citizen | Create ticket |
| GET | `/api/tickets` | Authenticated | List tickets |
| GET | `/api/tickets/:id` | Authenticated | Get ticket by ID |
| POST | `/api/tickets/:id/reply` | Authenticated | Reply to ticket |
| PATCH | `/api/tickets/:id` | Admin | Update ticket |
| PATCH | `/api/tickets/:id/assign` | Admin | Assign ticket |
| DELETE | `/api/tickets/:id` | Admin | Delete ticket |

### Example create request

```json
{
  "politicianId": "mongo_object_id",
  "subject": "Report an issue",
  "message": "Detailed ticket message here.",
  "priority": "medium"
}
```

## 10. News

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/news/political` | Public | Fetch political/governance news |

### Query parameters

- `q`
- `limit`

### Example request

```http
GET /api/news/political?q=parliament&limit=12
```
---

## 🗂️ Data Model Summary

### User

- `userId`
- `email`
- `password`
- `role`

### Politician

- `fullName`
- `slug`
- `party`
- `partyLogoUrl`
- `district`
- `position`
- `photoUrl`
- `bio`
- `socialLinks`
- `isActive`

### Party

- `name`
- `code`
- `slug`
- `logoUrl`
- `websiteUrl`
- `description`
- `isActive`

### Promise

- `politicianId`
- `createdBy`
- `title`
- `slug`
- `description`
- `category`
- `status`
- `promiseDate`
- `isActive`

### Petition

- `createdBy`
- `petitionerEmail`
- `title`
- `subjectLine`
- `addressedTo`
- `body`
- `evidenceSummary`
- `deadline`
- `attachments`
- `declarationAccepted`
- `status`
- `rejectionReason`
- `signedBy`
- `signCount`

### Evidence

- `promiseId`
- `title`
- `description`
- `dateOccurred`
- `media`
- `trustScore`
- `status`
- `addedBy`

### Ticket

- `createdBy`
- `assignedTo`
- `politicianId`
- `subject`
- `message`
- `status`
- `priority`
- `replies`
- `lastRepliedAt`

---

## 🌐 Frontend Features

### Public UI

- Home page with hero section and search
- Politicians listing and profile pages
- Parties listing and party profile pages
- Petitions listing and detail pages
- News page with search, refresh, and cards
- Sign-in / sign-up modal

### Admin UI

- Admin overview dashboard
- Manage Politicians
- Manage Parties
- Manage Petitions
- Manage Promises
- Protected admin routes
- Session-aware logout/login handling

---

## 📁 GitHub Repository

```text
https://github.com/mahenperera/promise_tracker_sl
```

## 🚀 Deployment

### Frontend
- **Platform:** Netlify
- **Live URL:** https://promise-tracker-sl.netlify.app/

**Frontend setup**
1. Connect the GitHub repository to the hosting platform
2. Set the root directory to `client`
3. Add the environment variable:
```env
   VITE_API_BASE_URL=[YOUR_BACKEND_URL]/api
```
4. **Build command:**

```bash
npm run build
```
   
5. **Output directory:**

```text
dist
```
### Backend

- **Platform:** Render
- **Live URL:** https://promise-tracker-sl.onrender.com

### Backend setup

1. Connect the GitHub repository to the hosting platform
2. Set the root directory to `server`
3. Add the required environment variables
4. Start command:

```bash
npm start
```

### Environment Variables

#### Backend

```env
PORT=5000
MONGO_URI=***
JWT_SECRET=***
CLOUDINARY_CLOUD_NAME=***
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
SENDGRID_API_KEY=***
EMAIL_FROM=***
```
#### Frontend

```env
VITE_API_BASE_URL=***
```
