# Notary — Note Taking App

A full-stack MERN note-taking application with rich text editing, notebooks, tags, dark/light mode, and PWA support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas (via Mongoose 8) |
| Auth | JWT (HTTP-only cookies) |
| Rich Editor | TipTap 2 |
| PWA | vite-plugin-pwa + Workbox |

---

## Features

- **Authentication** — Signup, login (username or email), logout with JWT cookies
- **Notes** — Create, edit, delete (soft delete to trash), restore, permanently delete
- **Rich Text Editor** — Bold, italic, underline, strikethrough, headings, lists, blockquotes, code blocks, text alignment, highlight
- **Notebooks** — Group notes into color-coded notebooks; manage from sidebar or mobile menu
- **Tags** — Multi-color tags with deterministic colors; filter notes by tag
- **Note Colors** — 7 card background color options per note
- **Search** — Real-time debounced search across title and content
- **Starred Notes** — Pin important notes to the top
- **Trash** — Soft delete with restore and permanent delete; empty trash option
- **PDF Export** — Download any note as a `.pdf` file
- **Auto-save Drafts** — New notes auto-saved to `localStorage` while typing
- **Profile Picture** — Upload or remove profile photo
- **Dark / Light Mode** — Persisted across sessions
- **PWA** — Installable on desktop and mobile; works from home screen
- **Keyboard Shortcuts** — `Ctrl+N` new note, `Ctrl+F` focus search, `Esc` close modals
- **Responsive Design** — Mobile-first with hamburger menu and notebook pill strip

---

## Project Structure

```
notary-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Signup, login, logout, profile
│   │   │   ├── notesController.js  # CRUD, trash, search, tags
│   │   │   └── notebooksController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # JWT route protection
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Note.js
│   │   │   └── Notebook.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── notesRoutes.js
│   │   │   └── notebooksRoutes.js
│   │   └── server.js
│   ├── uploads/                    # Profile picture uploads
│   ├── .env                        # Environment variables (not committed)
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── icons/                  # PWA icons (svg, png)
    ├── src/
    │   ├── components/
    │   │   ├── ConfirmModal.jsx
    │   │   ├── InstallPrompt.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NoteCard.jsx
    │   │   ├── NotebookSidebar.jsx
    │   │   ├── ProfileModal.jsx
    │   │   ├── RichEditor.jsx
    │   │   └── TagInput.jsx
    │   ├── constants/
    │   │   └── tags.js             # Tag & note card colors
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── NotebookContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── hooks/
    │   │   ├── useDraft.js
    │   │   ├── useLogin.js
    │   │   ├── useLogout.js
    │   │   └── useSignup.js
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   └── Trash.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works fine)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/notary-app.git
cd notary-app
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/notary?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_here
PORT=5001
NODE_ENV=development
```

**Getting your `MONGO_URI`:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → create a free cluster
2. Database Access → Add a database user (username + password)
3. Network Access → Add IP address → Allow from anywhere (`0.0.0.0/0`)
4. Clusters → Connect → Connect your application → copy the connection string
5. Replace `<username>` and `<password>` in the connection string

**Generating a `JWT_SECRET`:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Run the app

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see:
```
Server is running on port 5001
MongoDB connected successfully
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Register a new user | No |
| POST | `/login` | Login (username or email) | No |
| POST | `/logout` | Logout | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Upload profile picture | Yes |
| DELETE | `/profile` | Remove profile picture | Yes |

### Notes — `/api/notes`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all notes (supports `?search=`, `?tag=`, `?notebookId=`) | Yes |
| POST | `/` | Create a note | Yes |
| PUT | `/:id` | Update a note | Yes |
| DELETE | `/:id` | Soft delete (move to trash) | Yes |
| PUT | `/:id/star` | Toggle starred | Yes |
| GET | `/tags` | Get all unique tags for current user | Yes |
| GET | `/trash` | Get trashed notes | Yes |
| PUT | `/:id/restore` | Restore from trash | Yes |
| DELETE | `/:id/permanent` | Permanently delete | Yes |

### Notebooks — `/api/notebooks`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all notebooks with note counts | Yes |
| POST | `/` | Create a notebook | Yes |
| PUT | `/:id` | Rename / recolor a notebook | Yes |
| DELETE | `/:id` | Delete notebook (notes stay, become unassigned) | Yes |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes |
| `PORT` | Port for the Express server (default: `5001`) | No |
| `NODE_ENV` | `development` or `production` | No |

---

## Building for Production

```bash
cd frontend
npm run build
```

The `dist/` folder contains the optimized static assets including the service worker and PWA manifest. Serve the frontend from Express by setting `NODE_ENV=production` in your `.env`.

---

## Deploying (Vercel + Render)

This app uses a split deployment — **Vercel** for the React frontend and **Render** for the Node/Express backend.

### Step 1 — Push to GitHub

Make sure your code is in a GitHub repository. If not:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/notary-app.git
git push -u origin main
```

---

### Step 2 — Deploy the backend on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure the service:

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

4. Under **Environment Variables**, add these:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your secret key |
| `FRONTEND_URL` | Leave blank for now — fill in after Step 3 |

5. Click **Deploy**. Once it's live, copy your Render URL — it looks like `https://notary-api.onrender.com`

---

### Step 3 — Configure the frontend for production

Open `frontend/vercel.json` and replace `your-backend.onrender.com` with your actual Render URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://notary-api.onrender.com/api/:path*"
    },
    {
      "source": "/uploads/:path*",
      "destination": "https://notary-api.onrender.com/uploads/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Commit and push this change:

```bash
git add frontend/vercel.json
git commit -m "add render backend url to vercel config"
git push
```

---

### Step 4 — Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Configure the project:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. No environment variables needed on Vercel — `vercel.json` handles the API proxy
5. Click **Deploy**. Copy your Vercel URL — e.g. `https://notary-app.vercel.app`

---

### Step 5 — Link them together

Go back to your **Render dashboard** → your backend service → **Environment** → set:

```
FRONTEND_URL = https://notary-app.vercel.app
```

Click **Save Changes** — Render will redeploy automatically. This allows the backend CORS to accept requests from your Vercel domain.

---

### How it works in production

```
Browser → Vercel (static files)
              ↓ /api/* requests
         Vercel rewrites → Render (Express API)
              ↓
         MongoDB Atlas
```

Vercel serves the React app. Any `/api/` or `/uploads/` request is transparently proxied to Render via `vercel.json`. The browser always talks to one domain (`vercel.app`), so cookies work correctly.

---

---

## Installing as a PWA

Once deployed, open the app in Chrome or Edge:
- **Desktop** — click the install icon (⊕) in the address bar
- **Android** — tap ⋮ menu → "Add to Home screen"
- **iOS Safari** — tap Share → "Add to Home Screen"

The app will open in standalone mode (no browser chrome) and load from cache on subsequent visits.

---

## License

MIT
