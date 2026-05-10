# Crazy Taski Server 


The backend engine for Crazy Taski, a real-time project management system built with Node.js, Express, and Socket.io.

## Features
- Real-time Notifications: Instant alerts for project invitations and updates via Socket.io.
- Project Management: Create projects, manage members, and assign roles.
- Invitation System: Send, accept, or decline project invitations.
- Secure Auth: JWT-based authentication and protected routes.

## Tech Stack
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (Mongoose)
- Real-time: Socket.io
- Language: JavaScript (ES6+)

## Getting Started

### 1. Clone the repository
git clone https://github.com/Mohamedt693/crazy-taski-server.git
cd crazy-taski-server

### 2. Install dependencies
npm install

### 3. Setup Environment Variables
Create a .env file in the root directory and add:
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

### 4. Run the server
# Development mode
npm run dev

# Production mode
npm start

## License
This project is licensed under the MIT License.