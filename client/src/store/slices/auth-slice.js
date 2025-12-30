// store/slices/auth-slice.js
export const createAuthSlice = (set) => ({
  // Auth-related state
  userInfo: null,
  isAuthenticated: false,
  isLoading: true,
  
  // ✅ FIXED: Simplified setUserInfo
  setUserInfo: (userInfo) => set({ 
    userInfo, 
    isAuthenticated: !!userInfo 
  }),
  
  // ✅ NEW: Update specific fields in userInfo
  updateUserInfo: (updates) => set((state) => ({
    userInfo: state.userInfo ? { ...state.userInfo, ...updates } : null,
    isAuthenticated: !!state.userInfo
  })),
  
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Login/Logout actions
  login: (userData) => set({ 
    userInfo: userData, 
    isAuthenticated: true 
  }),
  
  logout: () => set({ 
    userInfo: null, 
    isAuthenticated: false,
    selectedChatType: null,
    selectedChatData: null,
    selectedChatMessages: [],
  }),
});