import Message from "../models/MessagesModel.js";
import fs from 'fs';
import path from 'path';
import mongoose from "mongoose";

export const getMessages = async (request, response) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;

    if (!user1 || !user2) {
      return response.status(400).json({ error: "Both user IDs are required." });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
      return response.status(400).json({ error: "Invalid user ID format." });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    })
    .populate('sender', 'firstName lastName email profileImage')
    .populate('recipient', 'firstName lastName email profileImage')
    .sort({ timestamp: 1 });

    return response.status(200).json({ 
      success: true,
      messages 
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return response.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

export const uploadFile = async (request, response) => {
  try {
    console.log("📁 File upload request received");
    
    if (!request.file) {
      console.error("❌ No file provided");
      return response.status(400).json({ 
        success: false,
        error: "File is required" 
      });
    }

    console.log("📄 File details:", {
      originalname: request.file.originalname,
      size: request.file.size,
      mimetype: request.file.mimetype,
      path: request.file.path
    });

    const date = Date.now();
    const fileDir = `uploads/files/${date}`;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
    if (!fs.existsSync('uploads/files')) {
      fs.mkdirSync('uploads/files', { recursive: true });
    }
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Create safe filename
    const safeFileName = request.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${fileDir}/${safeFileName}`;

    console.log("📁 Moving file from temp to:", fileName);
    
    // Move file from temp location to final location
    fs.renameSync(request.file.path, fileName);
    
    // Create relative path for database storage
    const relativePath = `${fileDir}/${safeFileName}`.replace(/\\/g, '/');

    console.log("✅ File uploaded successfully:", relativePath);
    
    return response.status(200).json({ 
      success: true,
      filePath: relativePath,
      fileName: safeFileName,
      fileSize: request.file.size,
      fileType: request.file.mimetype
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    console.error("Error stack:", error.stack);
    
    // Clean up temp file if exists
    if (request.file && request.file.path && fs.existsSync(request.file.path)) {
      try {
        fs.unlinkSync(request.file.path);
      } catch (unlinkError) {
        console.error("Failed to clean up temp file:", unlinkError);
      }
    }
    
    return response.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

export const deleteMessage = async (request, response) => {
  try {
    const { messageId } = request.params;
    const userId = request.userId;

    // Validate messageId format
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return response.status(400).json({ 
        success: false,
        error: "Invalid message ID format." 
      });
    }

    // Find the message with population
    const message = await Message.findById(messageId)
      .populate('sender', '_id')
      .populate('recipient', '_id');

    if (!message) {
      return response.status(404).json({ 
        success: false,
        error: "Message not found." 
      });
    }

    // Check if user is the sender of the message
    if (message.sender._id.toString() !== userId.toString()) {
      return response.status(403).json({ 
        success: false,
        error: "Unauthorized to delete this message." 
      });
    }

    // If message has a file, delete it from server
    if (message.messageType === "file" && message.fileUrl) {
      const filePath = path.join(process.cwd(), message.fileUrl);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted file: ${filePath}`);
          
          // Try to delete empty parent directories
          const dirPath = path.dirname(filePath);
          if (fs.existsSync(dirPath)) {
            const filesInDir = fs.readdirSync(dirPath);
            if (filesInDir.length === 0) {
              fs.rmdirSync(dirPath);
              console.log(`🗑️ Deleted empty directory: ${dirPath}`);
            }
          }
        } catch (fileError) {
          console.error("⚠️ Error deleting file:", fileError);
          // Continue with message deletion even if file deletion fails
        }
      }
    }

    // Delete the message from database
    await Message.findByIdAndDelete(messageId);

    // Get recipient ID for socket event
    const recipientId = message.recipient._id.toString();

    return response.status(200).json({ 
      success: true, 
      message: "Message deleted successfully.",
      data: {
        messageId,
        senderId: userId,
        recipientId,
        chatId: recipientId === userId ? message.sender._id.toString() : recipientId
      }
    });
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    return response.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

// Optional: Get single message by ID
export const getMessageById = async (request, response) => {
  try {
    const { messageId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return response.status(400).json({ 
        success: false,
        error: "Invalid message ID format." 
      });
    }

    const message = await Message.findById(messageId)
      .populate('sender', 'firstName lastName email profileImage')
      .populate('recipient', 'firstName lastName email profileImage');

    if (!message) {
      return response.status(404).json({ 
        success: false,
        error: "Message not found." 
      });
    }

    return response.status(200).json({ 
      success: true,
      message 
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return response.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

// Optional: Update message (for editing)
export const updateMessage = async (request, response) => {
  try {
    const { messageId } = request.params;
    const { content } = request.body;
    const userId = request.userId;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return response.status(400).json({ 
        success: false,
        error: "Invalid message ID format." 
      });
    }

    if (!content || content.trim() === '') {
      return response.status(400).json({ 
        success: false,
        error: "Message content is required." 
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return response.status(404).json({ 
        success: false,
        error: "Message not found." 
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return response.status(403).json({ 
        success: false,
        error: "Unauthorized to edit this message." 
      });
    }

    // Check if message is text type
    if (message.messageType !== "text") {
      return response.status(400).json({ 
        success: false,
        error: "Only text messages can be edited." 
      });
    }

    // Update message
    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'firstName lastName email profileImage')
      .populate('recipient', 'firstName lastName email profileImage');

    return response.status(200).json({ 
      success: true,
      message: "Message updated successfully.",
      data: updatedMessage
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return response.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

// Optional: Mark messages as read
export const markAsRead = async (request, response) => {
  try {
    const { messageIds } = request.body;
    const userId = request.userId;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return response.status(400).json({ 
        success: false,
        error: "Message IDs array is required." 
      });
    }

    // Validate all message IDs
    const validMessageIds = messageIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validMessageIds.length === 0) {
      return response.status(400).json({ 
        success: false,
        error: "No valid message IDs provided." 
      });
    }

    // Update messages where recipient is the current user
    const result = await Message.updateMany(
      {
        _id: { $in: validMessageIds },
        recipient: userId,
        read: false
      },
      {
        $set: { 
          read: true, 
          readAt: new Date() 
        }
      }
    );

    return response.status(200).json({ 
      success: true,
      message: `${result.modifiedCount} messages marked as read.`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return response.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: error.message 
    });
  }
};