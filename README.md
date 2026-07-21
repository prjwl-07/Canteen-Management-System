# 🍽️ Canteen Crowd Management System

A full-stack MERN application designed to manage canteen operations efficiently by reducing crowd congestion, enabling online ordering, and improving service flow.

---

## 🚀 Features

* 👤 User Authentication (Student / Teacher / Admin)
* 🛒 Online Food Ordering System
* 📋 Menu Management (Admin)
* 🎟️ Token-based Order Tracking
* 📊 Order Status Updates (Placed → Preparing → Ready → Completed)
* ⭐ Feedback & Rating System
* 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend

* React.js
* CSS / Tailwind

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Atlas)

### Other Tools

* Mongoose
* bcrypt.js (Password hashing)
* dotenv (Environment variables)

---

## 📂 Project Structure

```
Canteen-Crowd-Management-System/
│
├── client/            # React frontend
├── server/
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Auth middleware
│   ├── uploads/       # Images (if any)
│   ├── index.js       # Entry point
│   └── .env
│
├── seed.js            # Dummy data script
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/canteen-crowd-management-system.git
cd canteen-crowd-management-system
```

---

## 🔐 User Roles

| Role    | Permissions                      |
| ------- | -------------------------------- |
| Student | Place orders, view status        |
| Teacher | Same as student                  |
| Admin   | Manage menu, update order status |

---

## 📦 API Overview

### Auth Routes

* `POST /api/users/register`
* `POST /api/users/login`

### Menu Routes

* `GET /api/menu`
* `POST /api/menu` (Admin)

### Order Routes

* `POST /api/orders`
* `GET /api/orders/:id`
* `PUT /api/orders/:id/status`

---

## 🌍 Deployment

### Backend (Render)

### Frontend (Vercel)

---

## 📸 Future Improvements

* 📱 Mobile app version
* 💳 Online payment integration
* 📈 Analytics dashboard

---


## 👨‍💻 Author

**Prajwal Sul**

* GitHub: https://github.com/prjwl-07

---

⭐ If you found this project helpful, give it a star!
