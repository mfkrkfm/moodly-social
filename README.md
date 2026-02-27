# Moodly Social

Moodly Social is a full-stack social media application built with a **Spring Boot backend** and a **React frontend**.  
It provides secure authentication using **JWT** and supports core social features such as posts, comments, likes, and following users.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- User Registration (Sign Up)
- User Login (JWT-based authentication)
- Secure password hashing
- Role-based access (if implemented)
- Protected routes using Spring Security
- JWT token validation for every secured request

---

### 👤 User Management

- Create account
- Login to receive JWT
- View user profile
- Follow other users
- Unfollow users
- View followers & following list

---

### 📝 Posts

- Create post
- Edit post (owner only)
- Delete post (owner only)
- View all posts
- View posts by specific user

---

### 💬 Comments

- Add comment to a post
- Delete comment (owner only)
- View comments for a post

---

### ❤️ Likes

- Like a post
- Unlike a post
- View total likes per post

---

## 🛠 Tech Stack

### Backend

- Java 21
- Spring Boot 4.0.2
- Spring Web MVC
- Spring Data JPA
- Spring Security
- JWT (io.jsonwebtoken)
- Validation API
- H2 (Development Database)
- MySQL (Production Database)
- Lombok
- Docker

---

### Frontend

- React 18+
- React
- Gateway
- Docker

---

### 🧪 API Testing & Documentation

- Postman
- Swagger UI (springdoc-openapi)
- UnitTests

---

### Before Running
create .env.docker in root directory
example values:

`DATABASE_URL=jdbc:mysql://mysql:3306/moodly?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
`DATABASE_USER=moodly_user`
`DATABASE_PASSWORD=password`
`MYSQL_USER=moodly_user`
`MYSQL_PASSWORD=password`
`MYSQL_ROOT_PASSWORD=root`
`JWT_SECRET=prodSecretKeyForJwt123456789012345678901234567890`

would result in default admin:
login: admin
password: Admin123!


### Run in production mode
`docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`

