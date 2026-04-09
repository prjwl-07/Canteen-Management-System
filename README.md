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
* CSS / Tailwind (if used)

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

### 2️⃣ Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file inside `/server`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

⚠️ Important:

* Do NOT push `.env` to GitHub
* Add `.env` to `.gitignore`

---

### 4️⃣ Run the Application

#### Start Backend

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd client
npm start
```

---

## 🌱 Seed Database (Dummy Data)

To insert sample users, menu items, and orders:

```bash
node seed.js
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

* Build Command: `npm install`
* Start Command: `node server/index.js`

### Frontend

* Can be deployed on:

  * Vercel
  * Netlify

---

## ⚠️ Common Issues

### ❌ MongoDB Connection Error

* Ensure URI is in **single line**
* Do NOT include port with `mongodb+srv`

### ❌ Deployment Fails

* Add environment variables in Render dashboard
* Ensure correct start command

---

## 📸 Future Improvements

* 🔔 Real-time order tracking (WebSockets)
* 📱 Mobile app version
* 💳 Online payment integration
* 📈 Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Make changes
4. Submit a PR

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Prajwal Sul**

* GitHub: https://github.com/your-username

---

⭐ If you found this project helpful, give it a star!
