# 12Fit – Fitness Tracking Platform

## Project Overview

12Fit is a full-stack fitness tracking platform built using the MERN stack.  
The system allows users to create accounts, manage workout plans, track body progress, explore fitness products, and monitor health-related data through a modern web interface.

The project was developed as part of the Backend Development course and demonstrates real-world backend concepts such as authentication, authorization, validation, REST APIs, security, documentation, event-driven architecture, testing, monitoring, and deployment.

---

# Technologies Used

## Frontend

- React.js
- React Router DOM
- Axios
- Bootstrap

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt
- Socket.IO
- Swagger / OpenAPI
- Jest
- Supertest

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

# Features

## User Features

- User registration and login
- JWT authentication
- Workout management
- Progress tracking
- Diet plans
- Fitness products browsing
- Real-time online users tracking
- Protected routes

## Admin Features

- Admin dashboard
- View registered users count
- Monitor online users
- Monitor API and database status
- Manage products
- Role-based authorization

---

# Backend Concepts Implemented

## Authentication

- JWT-based authentication
- Password hashing using bcrypt

## Authorization

- Role-based access control
- Admin-only routes protection

## Validation

- Request validation for:
  - Email format
  - Password length
  - Required fields
  - Positive numbers
  - Valid roles

## Security

- Environment variables
- Rate limiting
- Protected API routes
- CORS configuration

## REST API

- CRUD operations
- Proper HTTP status codes
- API versioning

## Event-Driven Architecture

- EventEmitter implementation
- User registered event
- User login event

## Documentation

- Swagger / OpenAPI documentation

## Testing

- Basic backend testing using:
  - Jest
  - Supertest

## Monitoring

- API health endpoint
- Database status monitoring
- Online users monitoring
- Uptime tracking

---

# Project Structure

```txt
12fit/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── events/
│   ├── listeners/
│   ├── tests/
│   └── package.json
│
│ 
│ 
│   
│       
│
└── README.md
```

---

# API Versioning

The API uses versioned routes:

- /api/v1/auth
- /api/v1/workouts
- /api/v1/progress
- /api/v1/products
- /api/v1/users

Current API version:

- v1.0.0

---

````md
# Main API Routes

## Authentication

| Method | Route                   | Description       |
| ------ | ----------------------- | ----------------- |
| POST   | `/api/v1/auth/register` | Register new user |
| POST   | `/api/v1/auth/login`    | Login user        |

---

## Workouts

| Method | Route                  | Description    |
| ------ | ---------------------- | -------------- |
| GET    | `/api/v1/workouts`     | Get workouts   |
| POST   | `/api/v1/workouts`     | Create workout |
| PUT    | `/api/v1/workouts/:id` | Update workout |
| DELETE | `/api/v1/workouts/:id` | Delete workout |

---

## Progress

| Method | Route                  | Description     |
| ------ | ---------------------- | --------------- |
| GET    | `/api/v1/progress`     | Get progress    |
| POST   | `/api/v1/progress`     | Add progress    |
| PUT    | `/api/v1/progress/:id` | Update progress |
| DELETE | `/api/v1/progress/:id` | Delete progress |

---

## Products

| Method | Route                  | Description    |
| ------ | ---------------------- | -------------- |
| GET    | `/api/v1/products`     | Get products   |
| POST   | `/api/v1/products`     | Create product |
| PUT    | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |

# Monitoring Endpoints

| Method | Route            | Description               |
| ------ | ---------------- | ------------------------- |
| GET    | `/health`        | Health status             |
| GET    | `/api/v1/health` | Versioned health endpoint |

---

# Swagger Documentation

Swagger API documentation is available at:

```txt
http://localhost:8080/api-docs

Production:

https://one2fit.onrender.com/api-docs
```
````

---

## الجزء 6


# Installation & Setup

## Backend Setup

cd server
npm install
npm run dev



# Frontend Setup

cd client
npm install
npm start

# Testing

Run backend tests:

cd server
npm test



---

````md
# Deployment Links

## Frontend

```txt
https://12-fit.vercel.app

Backend
https://one2fit.onrender.com
```
````

# Future Improvements

OAuth 2.0 authentication
RabbitMQ integration
Advanced analytics dashboard
Mobile application
Docker support
Automated deployment pipeline

# Author

Developed by the 12Fit Team using the MERN stack.
