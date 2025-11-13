# MongoDB Setup Guide

## ✅ What We Just Did:

### 1. **Started MongoDB Server**
```bash
mongod --dbpath ~/data/db
```
- MongoDB is now running on `localhost:27017`
- Data will be stored in `~/data/db` folder
- Keep this terminal open while working!

### 2. **Created Database Models** (Schema/Structure)

#### **User Model** (`models/User.js`)
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  avatar: "url_to_image",
  createdAt: "2025-11-10",
  updatedAt: "2025-11-10"
}
```

#### **Project Model** (`models/Project.js`)
```javascript
{
  name: "Website Redesign",
  description: "Company website",
  color: "#3498db",
  owner: userId,           // Reference to User
  members: [userId1, userId2],  // Array of User IDs
  createdAt: "2025-11-10",
  updatedAt: "2025-11-10"
}
```

#### **Task Model** (`models/Task.js`)
```javascript
{
  title: "Design homepage",
  description: "Create mockups",
  projectId: projectId,    // Reference to Project
  assignedTo: userId,      // Reference to User
  status: "todo",          // todo, in-progress, done
  priority: "high",        // low, medium, high
  dueDate: "2025-11-15",
  createdAt: "2025-11-10",
  updatedAt: "2025-11-10"
}
```

#### **File Model** (`models/File.js`)
```javascript
{
  name: "design.pdf",
  projectId: projectId,
  size: "2.4 MB",
  url: "/uploads/design.pdf",
  uploadedBy: userId,
  createdAt: "2025-11-10"
}
```

#### **Discussion Model** (`models/Discussion.js`)
```javascript
{
  projectId: projectId,
  author: userId,
  message: "Should we use React?",
  replies: [
    {
      author: userId2,
      message: "Yes, React is great!",
      createdAt: "2025-11-10"
    }
  ],
  createdAt: "2025-11-10"
}
```

### 3. **Connected Backend to MongoDB**
- `config/db.js` - Handles connection
- `server.js` - Calls `connectDB()` on startup

---

## 🎯 What This Means:

### Before (In-Memory):
```javascript
let projects = [...]  // Lost when server restarts
```

### After (MongoDB):
```javascript
const project = await Project.find()  // Saved permanently in database
```

---

## 📝 How MongoDB Works:

1. **Collections** = Like tables (Users, Projects, Tasks)
2. **Documents** = Individual records (1 user, 1 project)
3. **Schemas** = Define structure (what fields each document has)

### Example Flow:
```javascript
// CREATE - Add new project
const newProject = await Project.create({
  name: "Mobile App",
  description: "iOS app",
  owner: userId
})

// READ - Get all projects
const projects = await Project.find()

// UPDATE - Change project name
await Project.findByIdAndUpdate(projectId, { name: "New Name" })

// DELETE - Remove project
await Project.findByIdAndDelete(projectId)
```

---

## 🚀 Next Steps:

1. **Install dependencies** (if not already):
   ```bash
   cd backend
   npm install
   ```

2. **Start your backend**:
   ```bash
   npm run dev
   ```

3. **You should see**:
   ```
   Server running on http://localhost:5000
   MongoDB Connected: localhost
   ```

---

## 🔍 View Your Database:

### Option 1: MongoDB Compass (GUI)
- Download: https://www.mongodb.com/products/compass
- Connect to: `mongodb://localhost:27017`

### Option 2: Terminal
```bash
mongosh                           # Connect to MongoDB
use taskman                       # Switch to taskman database
db.projects.find()                # View all projects
db.users.find()                   # View all users
```

---

## ⚠️ Important Commands:

### Start MongoDB:
```bash
mongod --dbpath ~/data/db
```

### Stop MongoDB:
- Press `Ctrl + C` in the terminal running MongoDB

### Check if MongoDB is running:
```bash
mongosh
```

---

## 🎓 Key Concepts:

- **Schema** = Blueprint/structure for data
- **Model** = JavaScript class to interact with collection
- **Document** = Single record/entry in database
- **Reference** = Link between collections (userId in Project)
- **Timestamps** = Auto-added `createdAt` and `updatedAt` fields

Your data is now persistent! 🎉
