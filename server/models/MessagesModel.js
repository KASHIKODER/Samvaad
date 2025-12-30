import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "file"],
    default: "text",
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === "text";
    },
    trim: true,
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.messageType === "file" || this.messageType === "image" || this.messageType === "video" || this.messageType === "audio";
    },
  },
  fileName: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  fileType: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Messages",
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
messageSchema.index({ sender: 1, recipient: 1, timestamp: -1 });
messageSchema.index({ recipient: 1, read: 1 });
messageSchema.index({ timestamp: -1 });

// Virtual for message status
messageSchema.virtual('status').get(function() {
  if (this.deleted) return 'deleted';
  if (this.read) return 'read';
  if (this.delivered) return 'delivered';
  return 'sent';
});

// Method to safely delete message (soft delete)
messageSchema.methods.softDelete = function(userId) {
  this.deleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

const Message = mongoose.model("Messages", messageSchema);

export default Message;