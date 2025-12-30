import React from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Auth from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/Profile";
import { useAppStore } from "./store";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { USER_INFO_ROUTE } from "@/utils/constants.js";
import { SocketProvider } from "@/context/SocketContext";

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const location = useLocation();
  const isAuthenticated = !!userInfo;
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (userInfo.profileSetup === false && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }
  
  if (userInfo.profileSetup === true && location.pathname === '/profile') {
    return <Navigate to="/chat" replace />;
  }
  
  return children;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  
  if (isAuthenticated) {
    if (userInfo.profileSetup === false) {
      return <Navigate to="/profile" replace />;
    }
    return <Navigate to="/chat" replace />;
  }
  
  return children;
};

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch user data once on mount
    const getUserData = async () => {
      try {
        const response = await authClient.get(USER_INFO_ROUTE, {
          withCredentials: true,
        });
        if (response.status === 200 && response.data?.id) {
          setUserInfo(response.data);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we don't have user info
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, []); // Empty dependency array

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  return (
      <BrowserRouter>
        <Routes>
          <Route 
            path="/auth" 
            element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={ 
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App;