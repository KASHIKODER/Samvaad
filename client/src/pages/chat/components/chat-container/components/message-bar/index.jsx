import { useSocket } from "@/context/SocketContext";
import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { GrAttachment, GrEmoji } from "react-icons/gr";
import { IoSend, IoSendSharp } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { authClient } from "@/lib/auth-client.js";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";

const MessageBar = () => {
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);

  const { socket, isConnected, connectionError } = useSocket();

  const store = useAppStore();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
    addMessage,
  } = store;

  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  // Monitor socket connection status
  useEffect(() => {
    if (socket && isConnected && socket.connected) {
      setSocketReady(true);
    } else {
      setSocketReady(false);
    }
  }, [socket, isConnected, connectionError]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatData?._id || isSending) {
      return;
    }

    // Check if socket is ready
    if (!socket || !isConnected || !socket.connected) {
      console.error("❌ Cannot send message: Socket not connected");
      alert(`Cannot send message: ${connectionError || "Socket not connected"}`);
      return;
    }

    try {
      setIsSending(true);

      if (selectedChatType === "contact") {
        // ====== FIXED: Create tempId that will be used BOTH locally and in socket ======
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create temporary message
        const tempMessage = {
          _id: tempId,
          tempId: tempId,
          sender: userInfo?.id,
          recipient: selectedChatData._id,
          content: message,
          messageType: "text",
          fileUrl: undefined,
          timestamp: new Date().toISOString(),
          status: 'sending', // Explicitly set status
          isTemporary: true
        };

        console.log("📤 Creating temp message:", {
          tempId: tempId,
          content: message.substring(0, 30)
        });

        if (addMessage && typeof addMessage === 'function') {
          addMessage(tempMessage);
        }

        // ====== FIXED: Send to server WITH tempId ======
        const messageForServer = {
          sender: userInfo?.id,
          recipient: selectedChatData._id,
          content: message,
          messageType: "text",
          tempId: tempId, // ⚠️ CRITICAL: Include tempId!
          timestamp: new Date().toISOString()
        };

        console.log("📡 Emitting to socket with tempId:", tempId);

        // Emit to server
        socket.emit("sendMessage", messageForServer);

        setMessage("");
      }
    } catch (error) {
      console.error("❌ Error in handleSendMessage:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentClick = () => fileInputRef.current?.click();

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file || !selectedChatData?._id) return;

      const formData = new FormData();
      formData.append("file", file);

      setIsUploading?.(true);
      const response = await authClient.post(UPLOAD_FILE_ROUTE, formData, {
        withCredentials: true,
        onDownloadProgress: (data) => {
          setFileUploadProgress?.(Math.round((100 * data.loaded) / data.total));
        },
      });

      if (response.status === 200 && response.data) {
        setIsUploading?.(false);

        // ====== FIXED: Create tempId for file message ======
        const tempId = `temp_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const tempFileMsg = {
          _id: tempId, // Use tempId as _id
          tempId: tempId, // ALSO store as tempId
          sender: userInfo?.id,
          recipient: selectedChatData._id,
          content: undefined,
          messageType: "file",
          fileUrl: response.data.filePath,
          timestamp: new Date().toISOString(),
          status: 'sending',
          isTemporary: true
        };

        console.log("📤 Creating temp file message:", {
          tempId: tempId,
          fileUrl: response.data.filePath
        });

        // Add to local state
        if (addMessage && typeof addMessage === 'function') {
          addMessage(tempFileMsg);
        }

        // ====== FIXED: Send to server WITH tempId ======
        const fileMessageForServer = {
          sender: userInfo?.id,
          recipient: selectedChatData._id,
          messageType: "file",
          fileUrl: response.data.filePath,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          tempId: tempId, // ⚠️ CRITICAL: Include tempId!
          timestamp: new Date().toISOString()
        };

        if (socket && socket.connected) {
          console.log("📡 Emitting file to socket with tempId:", tempId);
          socket.emit("sendMessage", fileMessageForServer);
        } else {
          console.log('❌ Socket not connected, file saved locally');
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setIsUploading?.(false);
      console.error("File upload error:", error);
    }
  };

  // Show connecting state if socket is not ready
  if (!isConnected || !socketReady) {
    return (
      <div className="p-4 bg-[#1e1f29] border-t border-[#2f303b]">
        <div className="flex items-center gap-3 bg-[#2a2b33] rounded-xl px-4 py-3">
          <div className="flex-1">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 focus:outline-none text-sm"
              placeholder={connectionError ? `Connecting...` : "Connecting to server..."}
              disabled
              value=""
            />
          </div>
          <button className="text-gray-600 p-2 cursor-not-allowed" disabled>
            <GrAttachment className="text-lg" />
          </button>
          <button className="text-gray-600 p-2 cursor-not-allowed" disabled>
            <GrEmoji className="text-lg" />
          </button>
          <button className="bg-gray-700 text-gray-500 p-2 rounded-lg cursor-not-allowed" disabled>
            <IoSend className="text-lg" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#1e1f29] border-t border-[#2f303b]">
      <div className="flex items-center gap-3 bg-[#2a2b33] rounded-xl px-4 py-3 shadow-lg">
        <div className="flex-1">
          <input
            type="text"
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none text-sm"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isSending && handleSendMessage()}
            disabled={isSending}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            className="text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAttachmentClick}
            disabled={isSending}
            title="Attach file"
          >
            <GrAttachment className="text-lg" />
          </button>

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAttachmentChange}
            disabled={isSending}
          />

          <div className="relative">
            <button
              className="text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              disabled={isSending}
              title="Add emoji"
            >
              <GrEmoji className="text-lg" />
            </button>

            {emojiPickerOpen && (
              <div className="absolute bottom-12 right-0 z-50" ref={emojiRef}>
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={handleAddEmoji}
                  autoFocusSearch={false}
                  skinTonesDisabled
                />
              </div>
            )}
          </div>

          <button
            className={`ml-2 p-2 rounded-lg transition-all duration-200 ${message.trim() && !isSending
                ? "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending || !selectedChatData?._id || !isConnected}
            title="Send message"
          >
            <IoSendSharp className="text-lg" />
          </button>
        </div>
      </div>

      {isSending && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></div>
          Sending...
        </div>
      )}
    </div>
  );
};

export default MessageBar;