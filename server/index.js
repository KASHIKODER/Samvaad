import express from "express";
import dotenv from "dotenv"; 
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer } from "http";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";    
import setupSockets from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import path from "path";

// * MAINTAIN THE HIERARCHY OF THE IMPLEMENTATION GETS CALL IN SEQUENTILY*

dotenv.config();

const app = express();  
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

const _dirname = path.resolve();
// ✅ Fix: Update CORS configuration
app.use(
    cors({  
        origin: process.env.ORIGIN,
        credentials: true,
    })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());  
app.use(express.json());  

app.use("/api/auth", authRoutes); 
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);

// ✅ Fix: Add a test endpoint to verify server is running
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// deployment setup
app.use(express.static(path.join(_dirname, "/client/dist")));

app.get("*", (_, res) => {    
    res.sendFile(path.resolve          
        (_dirname, "client", "dist", "index.html"));    
});

// ✅ Fix: Create HTTP server explicitly
const server = createServer(app);

// Connect database
mongoose
    .connect(databaseURL)
    .then(() => {
        console.log("DB CONNECTION SUCCESSFULL.");
        
        // Start server AFTER database connection
        server.listen(port, () => {
            console.log(`Server is running http://localhost:${port}`);
            
            // Setup sockets AFTER server starts
            setupSockets(server);
        });
    })
    .catch(err => {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    });