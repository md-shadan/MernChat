# **Real-Time Chat Application**

## **Overview**
This project is a full-stack real-time chat application built using React.js on the frontend and Express.js on the backend. It allows users to sign up, log in, and participate in real-time messaging with other users. The application also supports file uploads and stores chat history.

## **Features**
- **User Authentication:** Secure sign-up and log-in using JWT.
- **Real-Time Messaging:** Instant communication using WebSocket.
- **File Uploads:** Users can upload and share files within the chat.
- **Chat History:** All messages and files are stored for later access.

## **Technologies Used**

### **Frontend (React.js)**
- **React.js**: A JavaScript library for building user interfaces.
- **Axios**: For making HTTP requests to the backend API.
- **WebSocket**: For real-time communication.
- **React Hooks**: Used for managing state and side effects.

### **Backend (Express.js)**
- **Express.js**: A web application framework for Node.js.
- **WebSocket**: Integrated for real-time communication.
- **Mongoose**: For interacting with MongoDB.
- **JWT**: For user authentication and secure communication.
- **Bcrypt**: For hashing and securely storing passwords.

### **Database**
- **MongoDB**: A NoSQL database for storing user data, messages, and file information.

## **Getting Started**

### **Prerequisites**
- **Node.js**: Ensure Node.js is installed on your system.
- **MongoDB**: Install and set up MongoDB.

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/your-repo.git
    ```
2. Navigate to the project directory:
    ```bash
    cd your-repo
    ```
3. Install dependencies for the frontend and backend:
    ```bash
    cd client && npm install
    cd ../server && npm install
    ```

### Configuration
1. Create a `.env` file in the `server` directory:
    ```bash
    touch .env
    ```
2. Add environment variables:
    ```env
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    PORT=your_port_number
    ```

### Running the Application
1. Start the backend server:
    ```bash
    cd server && npm start
    ```
2. Start the frontend:
    ```bash
    cd client && npm start
    ```
3. Open your browser and navigate to `http://localhost:3000`.

