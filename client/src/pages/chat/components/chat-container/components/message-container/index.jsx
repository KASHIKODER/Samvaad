import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES_ROUTE, POST, DELETE_MESSAGE_ROUTE } from "@/utils/constants";
import { useSocket } from "@/context/SocketContext";
import { animationDefaultOptions } from "@/lib/utils"; // Add this import
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react"; // Add this import
import {
  MdImage,
  MdInsertDriveFile,
  MdDownload,
  MdDelete,
  MdContentCopy,
  MdMoreVert
} from "react-icons/md";
import { IoClose } from "react-icons/io5";
import {
  BsCheck2All,
  BsClock
} from "react-icons/bs";
import { RiMessage2Line, RiSparkling2Fill } from "react-icons/ri"; // Add these imports

const MessageContainer = () => {
  const messagesEndRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const currentChatIdRef = useRef(null);
  const socketListenersAddedRef = useRef(false);

  const {
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
  } = useAppStore();

  const { socket, isConnected } = useSocket();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [clickedMessageId, setClickedMessageId] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch messages when chat changes
  useEffect(() => {
    if (currentChatIdRef.current !== selectedChatData?._id) {
      hasFetchedRef.current = false;
      currentChatIdRef.current = selectedChatData?._id;
      setSelectedChatMessages([]);
      setClickedMessageId(null);
      socketListenersAddedRef.current = false;
    }

    const getMessages = async () => {
      if (hasFetchedRef.current || !selectedChatData?._id || isLoading) return;

      try {
        setIsLoading(true);
        console.log("📥 Fetching messages for chat:", selectedChatData._id);

        const response = await authClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        if (response.data.success && response.data.messages) {
          const messages = Array.isArray(response.data.messages) ? response.data.messages : [];
          console.log(`✅ Fetched ${messages.length} messages`);
          setSelectedChatMessages(messages);
          hasFetchedRef.current = true;
        } else {
          console.log("No messages found");
          setSelectedChatMessages([]);
          hasFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setSelectedChatMessages([]);
        hasFetchedRef.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedChatData?._id && !isLoading) {
      getMessages();
    }
  }, [selectedChatData, setSelectedChatMessages, isLoading]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedChatMessages]);

  // Setup socket listeners ONLY ONCE when socket connects
  useEffect(() => {
    if (!socket || !isConnected || socketListenersAddedRef.current) return;

    console.log("🔧 Setting up global socket listeners");

    const handleMessageReceived = (message) => {
      console.log("📩 Global: messageReceived event:", {
        messageId: message._id,
        tempId: message.tempId,
        sender: message.sender?._id || message.sender,
        recipient: message.recipient?._id || message.recipient,
        messageType: message.messageType,
        fileUrl: message.fileUrl
      });

      const storeState = useAppStore.getState();
      const { selectedChatData, addMessage } = storeState;

      if (!selectedChatData || !addMessage) return;

      const senderId = message.sender?._id || message.sender;
      const recipientId = message.recipient?._id || message.recipient;
      const currentChatId = selectedChatData._id;

      if (senderId === currentChatId || recipientId === currentChatId) {
        console.log("✅ Message belongs to current chat, adding...");
        // Direct store update - no setTimeout
        addMessage(message);
      } else {
        console.log("❌ Message not for current chat, ignoring");
      }
    };

    const handleMessageSent = (message) => {
      console.log("✅ Global: messageSent confirmation:", {
        messageId: message._id,
        tempId: message.tempId,
        messageType: message.messageType,
        fileUrl: message.fileUrl
      });

      const storeState = useAppStore.getState();
      const { addMessage } = storeState;

      if (!addMessage) return;

      // Direct store update - no setTimeout
      addMessage(message);
    };

    const handleMessageDeleted = ({ messageId }) => {
      console.log("🗑️ Global: Message deleted", messageId);

      const storeState = useAppStore.getState();
      const { selectedChatMessages, setSelectedChatMessages } = storeState;

      if (selectedChatMessages && setSelectedChatMessages) {
        const updatedMessages = selectedChatMessages.filter(
          msg => msg._id !== messageId
        );
        setSelectedChatMessages(updatedMessages);
      }
    };

    // Add listeners
    socket.on("messageReceived", handleMessageReceived);
    socket.on("messageSent", handleMessageSent);
    socket.on("messageDeleted", handleMessageDeleted);

    socketListenersAddedRef.current = true;

    // Join chat room if we have a current chat
    if (selectedChatData?._id && userInfo?.id) {
      const chatRoomId = [userInfo.id, selectedChatData._id].sort().join('_');
      socket.emit("joinChat", {
        userId: userInfo.id,
        chatId: selectedChatData._id
      });
      console.log(`👥 Joined chat room: chat_${chatRoomId}`);
    }

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up global socket listeners");
      if (socket) {
        socket.off("messageReceived", handleMessageReceived);
        socket.off("messageSent", handleMessageSent);
        socket.off("messageDeleted", handleMessageDeleted);
      }
      socketListenersAddedRef.current = false;
    };
  }, [socket, isConnected, selectedChatData, userInfo]);

  // Handle chat room joining/leaving when chat changes
  useEffect(() => {
    if (!socket || !isConnected || !userInfo?.id) return;

    // Leave previous chat room
    if (currentChatIdRef.current && currentChatIdRef.current !== selectedChatData?._id) {
      socket.emit("leaveChat", {
        userId: userInfo.id,
        chatId: currentChatIdRef.current
      });
    }

    // Join new chat room
    if (selectedChatData?._id) {
      const chatRoomId = [userInfo.id, selectedChatData._id].sort().join('_');
      socket.emit("joinChat", {
        userId: userInfo.id,
        chatId: selectedChatData._id
      });
      console.log(`👥 Joined chat room: chat_${chatRoomId}`);
    }
  }, [socket, isConnected, userInfo, selectedChatData]);

  // Delete message function
  const deleteMessage = async (messageId) => {
    if (!messageId || deletingMessageId) return;

    try {
      setDeletingMessageId(messageId);

      // Call backend
      const response = await authClient.delete(`${DELETE_MESSAGE_ROUTE}/${messageId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        console.log("✅ Message deleted successfully");

        // Emit socket event
        if (socket && selectedChatData?._id && userInfo?.id) {
          socket.emit("deleteMessage", {
            messageId,
            chatId: selectedChatData._id,
            userId: userInfo.id
          });
        }

        // Update local state
        setSelectedChatMessages(prev => {
          if (!Array.isArray(prev)) return [];
          return prev.filter(msg => msg._id !== messageId);
        });

        setClickedMessageId(null);
      } else {
        console.error("❌ Backend delete failed");
        alert("Failed to delete message");
      }
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      alert("Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  const downloadFile = async (fileUrl) => {
    try {
      const response = await authClient.get(`${POST}/${fileUrl}`, {
        responseType: "blob"
      });

      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", fileUrl.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const checkIfImage = (filePath) => {
    if (!filePath) return false;
    const imageRegex = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    return imageRegex.test(filePath);
  };

  const MessageBubble = ({ message }) => {
    const senderId = message.sender?._id || message.sender;
    const isFromOtherUser = senderId === selectedChatData._id;
    const isCurrentUser = !isFromOtherUser;
    const isTemporary = message.status === 'sending' ||
      message._id?.includes('temp_') ||
      !message._id ||
      message._id?.includes('temp_');
    const canDelete = isCurrentUser && !isTemporary;

    const isClicked = clickedMessageId === message._id;

    // Check if message has file content (image, video, audio, or generic file)
    const hasFileContent = message.fileUrl && (
      message.messageType === "file" ||
      message.messageType === "image" ||
      message.messageType === "video" ||
      message.messageType === "audio"
    );

    return (
      <div
        className={`relative flex ${isFromOtherUser ? "justify-start" : "justify-end"} mb-4 px-4`}
        onClick={(e) => {
          if (canDelete) {
            e.stopPropagation();
            setClickedMessageId(isClicked ? null : message._id);
          }
        }}
      >
        {/* Delete Options Menu - Shows when clicked */}
        {isClicked && canDelete && (
          <div className={`absolute ${isFromOtherUser ? "left-0" : "right-0"} -top-16 z-50`}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 min-w-[180px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this message?")) {
                    deleteMessage(message._id);
                  }
                }}
                disabled={deletingMessageId === message._id}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all"
              >
                {deletingMessageId === message._id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Deleting...</span>
                  </>
                ) : (
                  <>
                    <MdDelete className="text-lg" />
                    <span className="text-sm">Delete Message</span>
                  </>
                )}
              </button>
              <div className="h-px bg-gray-700 my-2"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(message.content);
                  setClickedMessageId(null);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-all"
              >
                <MdContentCopy className="text-lg" />
                <span className="text-sm">Copy Text</span>
              </button>
              <button
                onClick={() => setClickedMessageId(null)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-all mt-1"
              >
                <IoClose className="text-lg" />
                <span className="text-sm">Close</span>
              </button>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className={`relative max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] ${isClicked && canDelete ? "ring-2 ring-blue-500" : ""}`}>
          {/* Three dots indicator */}
          {canDelete && !isClicked && (
            <div className={`absolute ${isFromOtherUser ? "-left-10" : "-right-10"} top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                setClickedMessageId(message._id);
              }}>
              <div className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm">
                <MdMoreVert className="text-gray-400 text-lg hover:text-white" />
              </div>
            </div>
          )}

          {message.messageType === "text" && (
            <div className={`rounded-2xl px-5 py-3.5 ${isFromOtherUser ? "bg-gray-800/90 text-gray-100" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"} shadow-lg`}>
              <div className="break-words whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            </div>
          )}

          {hasFileContent && (
            <div className={`rounded-2xl overflow-hidden ${isFromOtherUser ? "bg-gray-800/90" : "bg-gradient-to-r from-blue-600 to-purple-600"} shadow-lg`}>
              {/* Check if it's an image (based on messageType or file extension) */}
              {message.messageType === "image" || checkIfImage(message.fileUrl) ? (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageURL(message.fileUrl);
                  }}
                >
                  <img
                    src={`${POST}/${message.fileUrl}`}
                    alt={message.fileName || "Shared image"}
                    className="max-h-72 w-full object-cover"
                    onError={(e) => {
                      console.error("Failed to load image:", message.fileUrl);
                      e.target.style.display = 'none';
                      // Show fallback if image fails to load
                      e.target.parentElement.innerHTML = `
                        <div class="p-4">
                          <div class="flex items-center gap-4">
                            <div class="p-3 rounded-lg bg-white/10">
                              <MdImage class="text-2xl text-white/90" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="text-sm font-medium truncate">
                                ${message.fileName || "Image"}
                              </div>
                              <div class="text-xs opacity-80">Click to download</div>
                            </div>
                            <button class="p-3 rounded-full hover:bg-white/10 transition-colors">
                              <MdDownload class="text-xl text-white" />
                            </button>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          <MdImage className="text-xl text-white/90" />
                        </div>
                        <span className="text-sm">Photo</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(message.fileUrl);
                        }}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <MdDownload className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white/10">
                      <MdInsertDriveFile className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {message.fileName || message.fileUrl?.split("/").pop() || "File"}
                      </div>
                      <div className="text-xs opacity-80">
                        {message.messageType === "video" ? "Video" :
                          message.messageType === "audio" ? "Audio" : "Document"}
                        {message.fileSize ? ` • ${formatFileSize(message.fileSize)}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(message.fileUrl)}
                      className="p-3 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <MdDownload className="text-xl" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className={`flex items-center gap-2 mt-2 ${isFromOtherUser ? "justify-start" : "justify-end"}`}>
            <div className="text-xs text-gray-500">
              {moment(message.timestamp).format("h:mm A")}
            </div>
            {!isFromOtherUser && (
              <div className="text-xs">
                {message.status === 'sending' || isTemporary ? (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <BsClock className="text-xs" />
                    <span>Sending</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-500">
                    <BsCheck2All />
                    <span>Delivered</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clickedMessageId && !e.target.closest('.message-bubble')) {
        setClickedMessageId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [clickedMessageId]);

  // Debug info
  useEffect(() => {
    console.log("📊 Current state:", {
      chatId: selectedChatData?._id,
      messagesCount: selectedChatMessages?.length || 0,
      isConnected,
      hasSocket: !!socket,
      userId: userInfo?.id,
      socketListenersAdded: socketListenersAddedRef.current
    });

    // Log file messages for debugging
    if (selectedChatMessages?.length > 0) {
      const fileMessages = selectedChatMessages.filter(msg =>
        msg.fileUrl ||
        msg.messageType === "file" ||
        msg.messageType === "image"
      );

      if (fileMessages.length > 0) {
        console.log("📁 File messages in chat:", fileMessages.map(msg => ({
          id: msg._id,
          type: msg.messageType,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          sender: msg.sender?._id || msg.sender
        })));
      }
    }
  }, [selectedChatData, selectedChatMessages, isConnected, socket, userInfo]);

  // Add debug listener for socket events
  useEffect(() => {
    if (!socket) return;

    const debugAllEvents = (eventName, data) => {
      if (eventName.includes('message')) {
        console.log(`🎯 Socket Event [${eventName}]:`, {
          type: data.messageType,
          id: data._id,
          tempId: data.tempId,
          fileUrl: data.fileUrl,
          sender: data.sender?._id || data.sender,
          recipient: data.recipient?._id || data.recipient
        });
      }
    };

    // Listen to all socket events for debugging
    socket.onAny(debugAllEvents);

    return () => {
      socket.offAny(debugAllEvents);
    };
  }, [socket]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950 no-scrollbar">
      <div className="min-h-full py-4">
        {/* Connection Status Indicator */}
        <div className={`text-xs text-center mb-2 px-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Render messages or empty state */}
        {!selectedChatMessages || selectedChatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12">
            {/* Modern empty state with Lottie animation */}
            {isLoading ? (
              <>
                <div className="text-4xl mb-4">👋</div>
                <p className="text-gray-400 text-center">
                  Loading messages...
                </p>
              </>
            ) : (
              <>
                <div className="flex-1 md:flex flex-col justify-center items-center mt-5 md:mt-0 duration-1000 transition-all">
                  <Lottie
                    animationData={animationDefaultOptions}
                    loop={true}
                    autoplay={true}
                    className="w-[120px] h-[130px]"
                  />
                  <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                    <h3 className="poppins-medium">
                      Hi<span className="text-purple-500">! </span>No messages yet
                      <span className="text-purple-500">. </span>
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base max-w-md">
                      Start the conversation by sending your first message!
                    </p>
                  </div>
                </div>
                
                {/* Connection status badge */}
                <div className="mt-8 px-4 py-2 rounded-full bg-gradient-to-r from-gray-900/40 to-gray-800/40 border border-gray-700/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-xs text-gray-400">
                      {isConnected ? 'Connected to chat server' : 'Disconnected from server'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            {selectedChatMessages.map((message, index) => {
              const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
              const prevDate = index > 0
                ? moment(selectedChatMessages[index - 1].timestamp).format("YYYY-MM-DD")
                : null;

              return (
                <div key={message._id || message.tempId || index} className="message-bubble">
                  {messageDate !== prevDate && (
                    <div className="text-center my-6">
                      <div className="bg-gray-800/50 text-gray-400 text-xs px-4 py-2 rounded-full inline-block">
                        {moment(message.timestamp).format("MMMM D, YYYY")}
                      </div>
                    </div>
                  )}
                  <MessageBubble message={message} />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Image modal */}
      {showImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={`${POST}/${imageURL}`}
              alt="Full size"
              className="max-h-[85vh] w-auto object-contain rounded-lg"
              onError={(e) => {
                console.error("Failed to load image in modal:", imageURL);
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                onClick={() => downloadFile(imageURL)}
              >
                <MdDownload className="text-xl" />
              </button>
              <button
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                onClick={() => setShowImage(false)}
              >
                <IoClose className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MessageContainer;