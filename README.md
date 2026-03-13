# LocalConnect

**LocalConnect** is a production-ready Hyperlocal Community Platform designed to help people in the same locality (cities, towns, villages) connect, communicate, trade, and help each other.

---

## 🚀 Features
- **Secure Authentication**: JWT-based user, login, and registration system with `bcrypt` password hashing.
- **Location-Based Feed**: View posts from your local city, area, or pincode.
- **Community interaction**: Create posts (Help Request, Events, General), Like, and Comment. Emergency post tagging using `urgency` levels.
- **Local Marketplace**: List items for sale, browse nearby items, filter by category.
- **Real-Time Chat**: Direct 1-on-1 private messaging using Socket.io.
- **Live Notifications**: Get notified instantly when someone comments, likes, or messages you.
- **Image Uploads**: Integrated with Cloudinary for fast and secure image hosting.
- **Admin Panel API**: Endpoints available for moderation (banning users, removing posts).

---

## 🛠 Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- Zustand (Global State Management)
- Axios, React Router v6
- Lucide React (Icons)
- Socket.io-client

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io
- JSON Web Tokens (JWT) & Bcrypt
- Multer & Cloudinary

---

## ⚙️ How to Run Locally

### 1. Clone or Download the Repository

### 2. Setup the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd LocalConnect/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `backend` folder.
   - Use the variables below (replace with your actual MongoDB URI and Cloudinary credentials):
     ```env
     NODE_ENV=development
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/localconnect
     JWT_SECRET=your_super_secret_jwt_key
     JWT_EXPIRE=30d
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     FRONTEND_URL=http://localhost:5173
     ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(Server will run on http://localhost:5000)*

### 3. Setup the Frontend
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd LocalConnect/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(App will run on http://localhost:5173)*

---

## 🌐 Deployment Instructions

### Database: MongoDB Atlas
1. Create a free cluster on MongoDB Atlas.
2. Under "Network Access", add IP Address `0.0.0.0/0` to whitelist all connections.
3. Get the connection string and update the `MONGO_URI` environment variable.

### Backend: Render or Railway
1. Push your code to GitHub.
2. Sign in to Render web services and create a "New Web Service".
3. Connect your GitHub repository.
4. Set the Root Directory to `backend`.
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add all your `.env` variables in the Environment section.
8. Deploy! Make sure to grab the deployed backend URL.

### Frontend: Vercel
1. Go to Vercel and "Import Project".
2. Select the GitHub repo.
3. Set the Framework Preset to `Vite`.
4. Set the Root Directory to `frontend`.
5. Overwrite the `baseURL` in `frontend/src/store/authStore.js` to point to your new Render Backend URL. (e.g., `https://localconnect-api.onrender.com/api`)
6. Also update `SOCKET_URL` in `frontend/src/store/chatStore.js`.
7. Click Deploy!
