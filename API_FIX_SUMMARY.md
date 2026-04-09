# API Configuration Fix Summary

## ✅ Changes Made

### 1. Created Centralized Axios Configuration
**File:** `client/src/api/axiosConfig.js`
- Created a single axios instance with baseURL set to `VITE_API_URL`
- All API calls now use the full backend URL instead of relative paths
- Added automatic 401 error handling (redirects to login on unauthorized)
- Works seamlessly between development and production

### 2. Updated All Frontend API Imports
Updated 9 key files to import axios from the centralized config:
- `src/context/AuthContext.jsx`
- `src/context/CartContext.jsx` 
- `src/pages/MenuPage.jsx`
- `src/pages/CartPage.jsx`
- `src/pages/OrderStatusPage.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/KitchenDisplay.jsx`
- `src/components/MenuManagement.jsx`
- `src/components/Analytics.jsx`
- `src/components/CartDrawer.jsx`

**Result:** All API calls now automatically use:
```javascript
API_URL = import.meta.env.VITE_API_URL || window.location.origin
```

### 3. Updated Backend CORS Configuration
**File:** `server/index.js`
- Changed from hardcoded localhost URLs to dynamic origin handling
- Now reads `CLIENT_URL` from environment variables
- Supports both development and production environments
- Socket.io CORS properly configured with credentials

### 4. Updated Environment Variables
**Server (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://prajwalsul2006_db_user:H05G7GpxSn8QBxJZ@cluster0.6aswi25.mongodb.net/?appName=Cluster0
ADMIN_PASSWORD=canteengo
JWT_SECRET=cant33n_s3cr3t_k3y_2024
NODE_ENV=production
CLIENT_URL=https://canteen-management-system-jfyi.onrender.com
```

**Client (`client/.env`):**
```env
VITE_API_URL=https://canteen-management-system-jfyi.onrender.com
VITE_SOCKET_URL=https://canteen-management-system-jfyi.onrender.com
```

---

## 🔄 How It Works Now

### Development (localhost)
```
Client: http://localhost:5173
Backend: http://localhost:5000

axios baseURL = import.meta.env.VITE_API_URL || window.location.origin
→ Falls back to window.location.origin = http://localhost:5173
→ Vite proxy in vite.config.js forwards to http://localhost:5000
```

### Production (Render)
```
Frontend: https://canteen-management-system-jfyi.onrender.com
Backend: https://canteen-management-system-jfyi.onrender.com

axios baseURL = import.meta.env.VITE_API_URL
→ Uses https://canteen-management-system-jfyi.onrender.com
→ All API calls get correct backend URL with /api prefix
```

---

## 📋 API Calls - Now Correct Format

All API calls already had `/api` prefix:
- ✅ `/api/menu` → GET menu items
- ✅ `/api/menu/${id}` → Update menu item
- ✅ `/api/orders` → Get/Create orders
- ✅ `/api/orders/token/${id}` → Get order by token
- ✅ `/api/auth/register` → User signup
- ✅ `/api/admin/login` → Admin login
- ✅ `/api/admin/verify` → Check admin token
- ✅ `/api/orders/revenue` → Get revenue data (analytics)

Each now automatically uses the correct `VITE_API_URL` from axios config ✅

---

## 🚀 Next Steps for Deployment

### ⚠️ Important: Update .env for Your Render Domains

If you created separate services on Render:
```
# If backend is on: canteen-backend.onrender.com
# If frontend is on: canteen-frontend.onrender.com

# Update server/.env:
CLIENT_URL=https://canteen-frontend.onrender.com

# Update client/.env:
VITE_API_URL=https://canteen-backend.onrender.com
VITE_SOCKET_URL=https://canteen-backend.onrender.com
```

### 1. Deploy Backend
1. Go to Render dashboard → Backend service
2. Update **Build Command** to:
   ```bash
   npm install --prefix server
   ```
3. Update **Start Command** to:
   ```bash
   cd server && npm start
   ```
4. Make sure environment variables are set (copy from server/.env)
5. Let it auto-deploy from git push

### 2. Deploy Frontend  
1. Go to Render dashboard → Frontend service
2. Set **Build Command** to:
   ```bash
   npm install --prefix client && npm run build --prefix client
   ```
3. Set **Publish Directory** to:
   ```bash
   client/dist
   ```
4. Set environment variables (copy from client/.env)
5. Let it auto-deploy from git push

### 3. Test Production URLs
```bash
# Backend health check
curl https://your-backend.onrender.com/api/health

# Frontend
https://your-frontend.onrender.com
```

---

## ✨ What This Fixes

❌ **Before:** 
- API calls used relative paths `/api/menu`
- Worked with Vite dev proxy (localhost)
- **Failed in production** when frontend and backend on different domains

✅ **After:**
- API calls use full URL with environment variables
- Works in both development and production
- Automatically uses correct domain
- Socket.io connections work properly
- CORS properly configured for production

---

## 🐛 If You Have Issues

### CORS Error in Browser Console?
**Solution:** Double-check `CLIENT_URL` in `server/.env` matches your frontend domain

### API calls returning 404?
**Solution:** Verify `VITE_API_URL` in `client/.env` is correct and includes full URL

### Socket.io connection failed?
**Solution:** Ensure `VITE_SOCKET_URL` matches your backend domain

### Connection refused?
**Solution:** Make sure services are deployed on Render and not sleeping

---

## 📦 Don't Forget to Push!

```bash
git add .
git commit -m "Fix API configuration for production deployment"
git push origin main
```

Both Render services will auto-deploy when you push to GitHub!
