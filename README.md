
# TaskMan: Collaborative Project Management Platform

TaskMan is a full-stack, collaborative project management application designed to organize, track, and manage team tasks and projects efficiently. Built on the MERN stack, it offers a responsive Single Page Application (SPA) frontend and a robust, scalable API backend for reliable data handling.

The system supports task prioritization, project-based file management, team collaboration via discussions, and a dedicated announcement system to keep all team members informed.


<img width="406" height="173" alt="image" src="https://github.com/user-attachments/assets/5897d37d-a560-4fb1-be81-209ef0301c38" />


## 💻 Installation
To run TaskMan locally, you need to set up both the Frontend (TaskMan-Site) and the Backend API.

Prerequisites
Node.js (LTS version recommended)

npm or yarn
A running instance of MongoDB (local or cloud-hosted).

1. Backend Setup
Clone the Backend Repo:
Bash
git clone [Your Backend Repository URL]
cd TaskMan-API
Install Dependencies:
npm install
Configure Environment: Create a .env file in the root directory and add your database connection string and other 

secrets:
PORT=5001
MONGO_URI=mongodb://localhost:27017/taskmandb
JWT_SECRET=YOUR_SECRET_KEY

Run the Backend:
npm start
The API will run on http://localhost:5001/api.

2. Frontend Setup
Clone the Frontend Repo:
git clone [Your Frontend Repository URL]
cd Taskman-Site

Install Dependencies:
npm install
Configure API URL: Ensure the baseURL in the frontend API file (src/services/api.js or equivalent) matches your running backend URL.

Run the Frontend:
npm start
The application will typically open at http://localhost:3000.
    
## Documentation

Project Management & Collaboration

->Full CRUD Project Management: Create, read, update, and delete projects. Projects can be marked as active or completed.

Team Member Management: Project owners can invite members by email to projects. Invitations track pending, accepted, or rejected status.

Project Discussions: Supports two types of real-time communication:

Public Discussions for project-wide communication.

Private Chats between users, tracking messages and replies.

File Management: Upload, view, and delete project-specific files, including tracking the uploader.

Project-Specific Announcements: Create prioritized, project-linked announcements with customizable icons (e.g., fas fa-bullhorn).

Task & Workflow
Detailed Task Tracking: Tasks are linked to a project, assigned to a user, and include a description and due date.

Task Statuses: Tasks move through a workflow defined by the statuses: proposed, todo, in-progress, and done.

Priority System: Tasks and announcements can be categorized by low, medium, or high priority.

User & Security
User Schema: Unique username and email validation, with avatar support.

Authentication: The API service uses an interceptor to include a stored authentication token (Bearer ${token}) with every request for secure access.

