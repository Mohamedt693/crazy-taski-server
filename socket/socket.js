import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            socket.user = decoded; 
            next(); 
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.user.id || socket.user._id;
        
        console.log(`User Authorized: ${userId} (Socket ID: ${socket.id})`);

        socket.join(userId.toString());

        socket.on("disconnect", () => {
            console.log("User Disconnected");
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};