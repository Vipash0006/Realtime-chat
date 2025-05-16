# Real-time Chat Application

A full-stack real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO.

## Features

- Real-time messaging
- User authentication (Email/Password & Google OAuth)
- Group chat functionality
- One-to-one chat
- User search
- Profile management
- Message notifications
- Responsive design

## Tech Stack

- **Frontend:**
  - React.js
  - Redux Toolkit
  - Socket.IO Client
  - Material-UI
  - Tailwind CSS

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Socket.IO
  - JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google OAuth credentials (for Google login)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/realtime-chat.git
cd realtime-chat
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../clients
npm install
```

4. Create environment files:

In the server directory, create `.env`:
```
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/realtime-chat
JWT_SECRET=your_jwt_secret_here
```

In the clients directory, create `.env`:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Running the Application

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd clients
npm start
```

The application will be available at `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

