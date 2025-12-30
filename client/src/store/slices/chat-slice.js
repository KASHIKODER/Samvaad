// store/slices/chat-slice.js
export const createChatSlice = (set, get) => ({
  // Chat-related state
  selectedChatType: null,
  selectedChatData: null,
  selectedChatMessages: [],
  isUploading: false,
  fileUploadProgress: 0,
  isDownloading: false,
  fileDownloadProgress: 0,
  showImageModal: false,
  imageModalUrl: null,
  
  directMessagesContacts: [],
  channelContacts: [],
  
  setSelectedChatType: (type) => set({ selectedChatType: type }),
  setSelectedChatData: (data) => set({ selectedChatData: data }),
  
  setDirectMessagesContacts: (contacts) => set({ directMessagesContacts: contacts || [] }),
  setChannelContacts: (channels) => set({ channelContacts: channels || [] }),
  
  closeChat: () => {
    console.log('🚪 chat-slice: Closing current chat');
    set({ 
      selectedChatType: null,
      selectedChatData: null,
      selectedChatMessages: [],
      showImageModal: false,
      imageModalUrl: null
    });
  },
  
  // ✅ FINAL FIXED VERSION: Proper message handling with status updates
  addMessage: (newMessage) => {
    console.log('🔄 chat-slice: addMessage called - DEBUG:', {
      id: newMessage._id,
      tempId: newMessage.tempId,
      isTempId: newMessage._id?.includes('temp_'),
      sender: newMessage.sender?._id || newMessage.sender,
      recipient: newMessage.recipient?._id || newMessage.recipient,
      content: newMessage.content?.substring(0, 30) || 'file/empty',
      type: newMessage.messageType,
      status: newMessage.status,
      timestamp: newMessage.timestamp
    });
    
    set((state) => {
      const currentMessages = Array.isArray(state.selectedChatMessages) 
        ? state.selectedChatMessages 
        : [];
      
      // Get current chat data for validation
      const currentChatId = state.selectedChatData?._id;
      const currentUserId = state.userInfo?.id;
      
      // Check if this message belongs to current chat
      if (currentChatId) {
        const senderId = newMessage.sender?._id || newMessage.sender;
        const recipientId = newMessage.recipient?._id || newMessage.recipient;
        
        const isForCurrentChat = 
          senderId === currentChatId || 
          recipientId === currentChatId ||
          senderId === currentUserId ||
          recipientId === currentUserId;
        
        if (!isForCurrentChat) {
          console.log('⏭️ Message not for current chat, ignoring');
          return { selectedChatMessages: currentMessages };
        }
      }
      
      // ====== FIXED LOGIC: Handle temp message replacement ======
      
      // 1. If this is a REAL message with a tempId, replace the temp message
      if (newMessage.tempId && newMessage._id && !newMessage._id.includes('temp_')) {
        console.log('🔍 Looking for temp message to replace, tempId:', newMessage.tempId);
        
        const tempMessageIndex = currentMessages.findIndex(msg => 
          msg.tempId === newMessage.tempId || 
          (msg._id && msg._id.includes('temp_') && msg._id === newMessage.tempId)
        );
        
        if (tempMessageIndex !== -1) {
          console.log('🔄 REPLACING temp message at index:', tempMessageIndex);
          
          // Create updated messages array
          const updatedMessages = [...currentMessages];
          
          // Replace temp with real message - FORCE status to 'sent'
          updatedMessages[tempMessageIndex] = {
            ...newMessage,
            status: 'sent', // ⚠️ CRITICAL: Force status to 'sent' for delivered messages
            _id: newMessage._id // Use real MongoDB ID
          };
          
          console.log('✅ Temp message replaced with real message, status:', 'sent');
          return { selectedChatMessages: updatedMessages };
        }
      }
      
      // 2. Check if real message already exists (prevent duplicates)
      if (newMessage._id && !newMessage._id.includes('temp_')) {
        const realMessageExists = currentMessages.some(msg => 
          msg._id === newMessage._id
        );
        
        if (realMessageExists) {
          console.log('⏭️ Real message already exists, updating');
          
          const updatedMessages = currentMessages.map(msg => 
            msg._id === newMessage._id ? { ...msg, ...newMessage } : msg
          );
          
          return { selectedChatMessages: updatedMessages };
        }
      }
      
      // 3. Check if temp message already exists (prevent duplicate temp messages)
      if (newMessage.tempId) {
        const tempMessageExists = currentMessages.some(msg => 
          msg.tempId === newMessage.tempId ||
          (msg._id && msg._id.includes('temp_') && msg._id === newMessage.tempId)
        );
        
        if (tempMessageExists) {
          console.log('⏭️ Temp message already exists, updating');
          
          const updatedMessages = currentMessages.map(msg => 
            (msg.tempId === newMessage.tempId || 
             (msg._id && msg._id.includes('temp_') && msg._id === newMessage.tempId)) 
              ? { ...msg, ...newMessage } 
              : msg
          );
          
          return { selectedChatMessages: updatedMessages };
        }
      }
      
      // 4. Add new message (either temp or new real message without tempId)
      const messageToAdd = {
        ...newMessage,
        _id: newMessage._id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        // ⚠️ CRITICAL: Set proper status
        status: newMessage.status || (newMessage.tempId ? 'sending' : 'sent'),
        timestamp: newMessage.timestamp || new Date(),
        sender: newMessage.sender || null,
        recipient: newMessage.recipient || null,
        messageType: newMessage.messageType || 'text'
      };
      
      console.log('✅ Adding NEW message to chat:', {
        isTemp: messageToAdd._id.includes('temp_'),
        status: messageToAdd.status,
        totalMessages: currentMessages.length + 1
      });
      
      // Add to messages array and sort
      const allMessages = [...currentMessages, messageToAdd];
      const sortedMessages = allMessages.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      return { 
        selectedChatMessages: sortedMessages 
      };
    });
  },
  
  setSelectedChatMessages: (messages) => {
    console.log('🔄 chat-slice: setSelectedChatMessages called with', 
      Array.isArray(messages) ? messages.length : 'non-array',
      'messages'
    );
    
    // Ensure messages are sorted by timestamp
    const sortedMessages = Array.isArray(messages) 
      ? messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      : [];
    
    set({ 
      selectedChatMessages: sortedMessages 
    });
  },
  
  setIsUploading: (isUploading) => set({ isUploading }),
  setFileUploadProgress: (progress) => set({ fileUploadProgress: progress }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileDownloadProgress: (progress) => set({ fileDownloadProgress: progress }),
  setShowImageModal: (show) => set({ showImageModal: show }),
  setImageModalUrl: (url) => set({ imageModalUrl: url }),
  
  clearSelectedChatMessages: () => {
    console.log('🧹 chat-slice: Clearing all messages');
    set({ selectedChatMessages: [] });
  },
  
  updateMessageStatus: (messageId, status) => {
    console.log('📝 chat-slice: Updating message status', { messageId, status });
    
    set((state) => {
      const updatedMessages = state.selectedChatMessages.map(msg => {
        if (msg._id === messageId || msg.tempId === messageId) {
          console.log(`📝 Updating message ${msg._id || msg.tempId} status to:`, status);
          return { ...msg, status };
        }
        return msg;
      });
      
      return { selectedChatMessages: updatedMessages };
    });
  },
  
  // Helper function to check if a message exists
  messageExists: (messageId, tempId) => {
    const state = get();
    return state.selectedChatMessages.some(msg => 
      msg._id === messageId || (tempId && msg.tempId === tempId)
    );
  },
  
  // Get message by ID or tempId
  getMessage: (messageId, tempId) => {
    const state = get();
    return state.selectedChatMessages.find(msg => 
      msg._id === messageId || (tempId && msg.tempId === tempId)
    );
  },
  
  // Remove message by ID or tempId
  removeMessage: (messageId, tempId) => {
    console.log('🗑️ chat-slice: Removing message', { messageId, tempId });
    
    set((state) => {
      const filteredMessages = state.selectedChatMessages.filter(msg => 
        !(msg._id === messageId || (tempId && msg.tempId === tempId))
      );
      
      return { selectedChatMessages: filteredMessages };
    });
  }
});