import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import mongoose from "mongoose";

const setupSockets = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
            skipMiddlewares: true,
        }
    });

    const userSocketMap = new Map();

    io.on("connection", (socket) => {
        console.log("New connection, socket ID:", socket.id);
        
        const userId = socket.handshake.query.userId;
        
        if (!userId) {
            console.log(`⚠️ A user connected without userId: ${socket.id}`);
            socket.disconnect();
            return;
        }

        // Disconnect previous socket if user reconnects
        if (userSocketMap.has(userId)) {
            const oldSocketId = userSocketMap.get(userId);
            const oldSocket = io.sockets.sockets.get(oldSocketId);
            if (oldSocket) {
                console.log(`🔄 User reconnected: ${userId}, disconnecting old socket`);
                oldSocket.disconnect();
            }
        }
        
        // Store user socket mapping
        userSocketMap.set(userId, socket.id);
        
        // Join user to their personal room
        socket.join(`user_${userId}`);
        
        console.log(`✅ User connected: ${userId} with socket ID: ${socket.id}`);
        
        // Emit connection success
        socket.emit("connection_success", { 
            userId, 
            socketId: socket.id,
            message: "Successfully connected to socket server",
            onlineUsers: Array.from(userSocketMap.keys())
        });
        
        // Notify others that user is online
        socket.broadcast.emit("userOnline", { userId });
        
        console.log("Online users:", Array.from(userSocketMap.entries()));

        // Handle sendMessage event - FIXED VERSION
       // In socket.js, update the sendMessage handler:

socket.on("sendMessage", async (message) => {
    try {
        console.log("📨 Received message from frontend:", {
            sender: message.sender,
            recipient: message.recipient,
            messageType: message.messageType,
            tempId: message.tempId,
            hasContent: !!message.content,
            hasFileUrl: !!message.fileUrl
        });
        
        // Validate required fields
        if (!message.sender || !message.recipient) {
            console.error("❌ Invalid message format: missing sender or recipient");
            socket.emit("error", { 
                message: "Invalid message format: missing sender or recipient",
                tempId: message.tempId 
            });
            return;
        }
        
        // Validate message content based on type
        if (message.messageType === 'text' && !message.content && message.content !== '') {
            console.error("❌ Text message without content");
            socket.emit("error", { 
                message: "Text message requires content",
                tempId: message.tempId 
            });
            return;
        }
        
        if (message.messageType === 'file' && !message.fileUrl) {
            console.error("❌ File message without fileUrl");
            socket.emit("error", { 
                message: "File message requires fileUrl",
                tempId: message.tempId 
            });
            return;
        }
        
        const senderId = message.sender;
        const recipientId = message.recipient;
        
        // Create chat room ID
        const chatRoomId = [senderId, recipientId].sort().join('_');
        
        // Create message object for DB
        const messageToSave = {
            sender: senderId,
            recipient: recipientId,
            messageType: message.messageType || 'text',
            timestamp: message.timestamp || new Date(),
            delivered: true,
            deliveredAt: new Date()
        };
        
        // Add content based on message type
        if (message.messageType === 'text') {
            messageToSave.content = message.content || '';
        } else if (message.messageType === 'file') {
            messageToSave.fileUrl = message.fileUrl;
            messageToSave.fileName = message.fileName || message.fileUrl?.split('/').pop() || 'file';
            messageToSave.fileSize = message.fileSize || 0;
            messageToSave.fileType = message.fileType || 'application/octet-stream';
            
            // Auto-detect image type based on mimetype or file extension
            const fileType = message.fileType || '';
            const fileUrl = message.fileUrl || '';
            
            if (fileType.startsWith('image/') || 
                /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileUrl)) {
                messageToSave.messageType = 'image';
            } else if (fileType.startsWith('video/') || 
                      /\.(mp4|mov|avi|mkv|webm)$/i.test(fileUrl)) {
                messageToSave.messageType = 'video';
            } else if (fileType.startsWith('audio/') || 
                      /\.(mp3|wav|ogg|flac)$/i.test(fileUrl)) {
                messageToSave.messageType = 'audio';
            }
        }
        
        console.log("💾 Saving message to DB...", {
            type: messageToSave.messageType,
            hasFile: !!messageToSave.fileUrl,
            fileUrl: messageToSave.fileUrl
        });
        
        // Save to database
        const createdMessage = await Message.create(messageToSave);
        console.log("✅ Message saved with ID:", createdMessage._id);

        // Populate sender and recipient details
        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "_id firstName lastName email profileImage")
            .populate("recipient", "_id firstName lastName email profileImage");

        // Prepare response data
        const responseData = {
            ...messageData.toObject(),
            tempId: message.tempId,
            status: 'sent' 
        };

        console.log("📡 Broadcasting message:", {
            id: responseData._id,
            tempId: responseData.tempId,
            type: responseData.messageType,
            fileUrl: responseData.fileUrl ? "Yes" : "No"
        });

        // Join both users to the chat room
        socket.join(`chat_${chatRoomId}`);
        const recipientSocketId = userSocketMap.get(recipientId);
        if (recipientSocketId) {
            const recipientSocket = io.sockets.sockets.get(recipientSocketId);
            if (recipientSocket) {
                recipientSocket.join(`chat_${chatRoomId}`);
            }
        }

        // Emit to chat room
        io.to(`chat_${chatRoomId}`).emit("messageReceived", responseData);
        
        // Also send to individual user rooms for reliability
        io.to(`user_${recipientId}`).emit("messageReceived", responseData);
        
        // Send confirmation to sender
        socket.emit("messageSent", responseData);
        
        console.log(`✅ Message sent successfully to chat_${chatRoomId}`);
        
    } catch (error) {
        console.error("❌ Error in sendMessage:", error);
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
        
        socket.emit("error", { 
            message: "Failed to send message", 
            error: error.message,
            tempId: message.tempId
        });
    }
});

        // Handle deleteMessage event
        socket.on("deleteMessage", async (data) => {
            try {
                console.log("🗑️ Received deleteMessage request:", {
                    messageId: data.messageId,
                    userId: data.userId,
                    chatId: data.chatId
                });
                
                const { messageId, chatId, userId: requestUserId } = data;
                
                // Validate required data
                if (!messageId || !chatId || !requestUserId) {
                    console.error("❌ Missing data for deleteMessage");
                    socket.emit("error", { 
                        message: "Missing required data for deletion" 
                    });
                    return;
                }
                
                // Validate messageId format
                if (!mongoose.Types.ObjectId.isValid(messageId)) {
                    console.error("❌ Invalid message ID format:", messageId);
                    socket.emit("error", { 
                        message: "Invalid message ID format" 
                    });
                    return;
                }
                
                // Find the message
                const message = await Message.findById(messageId)
                    .populate('sender', '_id')
                    .populate('recipient', '_id');
                
                if (!message) {
                    console.error("❌ Message not found:", messageId);
                    socket.emit("error", { 
                        message: "Message not found" 
                    });
                    return;
                }
                
                // Check if user is authorized to delete this message
                if (message.sender._id.toString() !== requestUserId.toString()) {
                    console.error("❌ Unauthorized deletion attempt:", {
                        requestUserId,
                        senderId: message.sender._id.toString()
                    });
                    socket.emit("error", { 
                        message: "Unauthorized to delete this message" 
                    });
                    return;
                }
                
                // Delete from database
                await Message.findByIdAndDelete(messageId);
                console.log("🗑️ Message deleted from DB:", messageId);
                
                // Get recipient ID
                const recipientId = message.recipient._id.toString();
                
                // Create chat room ID
                const chatRoomId = [requestUserId, recipientId].sort().join('_');
                
                // Emit messageDeleted event to chat room
                io.to(`chat_${chatRoomId}`).emit("messageDeleted", { 
                    messageId,
                    deletedBy: requestUserId,
                    timestamp: new Date()
                });
                
                console.log(`✅ Message deleted notification sent to chat_${chatRoomId}`);
                
            } catch (error) {
                console.error("❌ Error in deleteMessage:", error);
                console.error("Error details:", error.message);
                
                socket.emit("error", { 
                    message: "Failed to delete message", 
                    error: error.message
                });
            }
        });

        // Handle join chat room
        socket.on("joinChat", (data) => {
            try {
                const { userId, chatId } = data;
                if (userId && chatId) {
                    const chatRoomId = [userId, chatId].sort().join('_');
                    socket.join(`chat_${chatRoomId}`);
                    console.log(`👥 User ${userId} joined chat_${chatRoomId}`);
                }
            } catch (error) {
                console.error("Error in joinChat:", error);
            }
        });

        // Handle leave chat room
        socket.on("leaveChat", (data) => {
            try {
                const { userId, chatId } = data;
                if (userId && chatId) {
                    const chatRoomId = [userId, chatId].sort().join('_');
                    socket.leave(`chat_${chatRoomId}`);
                    console.log(`👋 User ${userId} left chat_${chatRoomId}`);
                }
            } catch (error) {
                console.error("Error in leaveChat:", error);
            }
        });

        // Handle typing indicator
        socket.on("typingStart", (data) => {
            try {
                const { userId, chatId } = data;
                if (userId && chatId) {
                    socket.to(`user_${chatId}`).emit("userTyping", {
                        userId,
                        isTyping: true,
                        chatId
                    });
                }
            } catch (error) {
                console.error("Error in typingStart:", error);
            }
        });

        socket.on("typingStop", (data) => {
            try {
                const { userId, chatId } = data;
                if (userId && chatId) {
                    socket.to(`user_${chatId}`).emit("userTyping", {
                        userId,
                        isTyping: false,
                        chatId
                    });
                }
            } catch (error) {
                console.error("Error in typingStop:", error);
            }
        });

        // Handle disconnect
        socket.on("disconnect", (reason) => {
            console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
            
            // Find and remove user from userSocketMap
            let disconnectedUserId = null;
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    userSocketMap.delete(userId);
                    console.log(`🗑️ Removed user from map: ${userId}`);
                    break;
                }
            }
            
            // Notify others that user went offline
            if (disconnectedUserId) {
                io.emit("userOffline", { userId: disconnectedUserId });
            }
            
            console.log("👥 Remaining online users:", Array.from(userSocketMap.keys()));
        });

        // Handle socket errors
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        // Heartbeat/ping
        socket.on("ping", (data) => {
            socket.emit("pong", { timestamp: Date.now(), ...data });
        });
    });

    console.log("✅ Socket.IO server initialized successfully");
    
    return io;
};

export default setupSockets;