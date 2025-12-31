// App.jsx
import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import { useAppStore } from "./store";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { USER_INFO_ROUTE } from "@/utils/constants.js";

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    
    getUserData();
  }, [setUserInfo]);

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
        {/* Auth route - only accessible when not logged in */}
        <Route 
          path="/auth" 
          element={
            !userInfo ? <Auth /> : (
              userInfo?.profileSetup === false 
                ? <Navigate to="/profile" replace /> 
                : <Navigate to="/chat" replace />
            )
          } 
        />
        
        {/* Chat route - only accessible when logged in AND profile is setup */}
        <Route 
          path="/chat" 
          element={
            userInfo ? (
              userInfo.profileSetup === false 
                ? <Navigate to="/profile" replace />
                : <Chat />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        {/* Profile route - accessible when logged in, even if profile is already setup */}
        <Route 
          path="/profile" 
          element={
            userInfo ? (
              <Profile />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to={userInfo ? "/chat" : "/auth"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;