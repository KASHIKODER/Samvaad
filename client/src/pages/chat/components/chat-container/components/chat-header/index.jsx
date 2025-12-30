import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { POST } from "@/utils/constants";
import { useAppStore } from "@/store";
import { RiCloseFill, RiUser3Line, RiMore2Fill } from "react-icons/ri";
import { useState, useEffect } from "react";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Simulate typing status (you can replace with real data)
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    }, 5000);
    return () => {
      clearInterval(interval);
      setIsVisible(false);
      setIsTyping(false);
    };
  }, [selectedChatData]);

  if (!selectedChatData) {
    return (
      <div className="h-[85px] bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900/60 backdrop-blur-2xl border-b border-gray-800/30 shadow-2xl relative overflow-hidden group">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-shimmer" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        
        <div className="relative z-10 flex items-center justify-between w-full h-full px-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-500">
                <RiUser3Line className="text-2xl text-gray-400/60" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="h-4 w-40 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-full animate-pulse" />
              <div className="h-3 w-32 bg-gradient-to-r from-gray-900/40 to-gray-800/40 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/30 text-gray-400/50 hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:border-gray-600/30 backdrop-blur-sm">
              <RiCloseFill className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userInitial = selectedChatData.firstName 
    ? selectedChatData.firstName.charAt(0)
    : selectedChatData.email?.charAt(0) || 'U';

  const userName = selectedChatType === "contact" && selectedChatData.firstName
    ? `${selectedChatData.firstName || ''} ${selectedChatData.lastName || ''}`.trim()
    : selectedChatData.email || 'Unknown User';

  return (
    <div className={`h-[85px] bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900/60 backdrop-blur-2xl border-b border-gray-800/30 shadow-2xl relative overflow-hidden group transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-shimmer" />
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 -left-4 w-8 h-8 bg-blue-500/10 blur-2xl rounded-full" />

      <div className="relative z-10 flex items-center justify-between w-full h-full px-8">
        {/* Left section - User Info */}
        <div className="flex items-center gap-5">
          <div className="relative group/avatar">
            {/* Outer glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[24px] blur opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
            
            <Avatar className="h-16 w-16 rounded-[20px] shadow-2xl border-2 border-gray-800/50 overflow-hidden transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:border-blue-500/30 relative">
              {selectedChatData.image ? (
                <AvatarImage
                  src={`${POST}/${selectedChatData.image}`}
                  alt="Profile"
                  className="object-cover w-full h-full transition-transform duration-700 group-hover/avatar:scale-110"
                />
              ) : (
                <div
                  className={`uppercase h-full w-full text-2xl font-bold flex items-center justify-center bg-gradient-to-br ${getColor(selectedChatData.color || 0)} group-hover/avatar:brightness-110 transition-all duration-500`}
                >
                  {userInitial}
                </div>
              )}
            </Avatar>
            {/* Green circle removed from here */}
          </div>
          
          {/* User details */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                {userName}
              </h2>
              {isTyping && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-blue-400 font-medium ml-2">typing...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 border border-emerald-500/30 backdrop-blur-sm group/status">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
                  <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-sm font-medium text-emerald-400 group-hover/status:text-emerald-300 transition-colors duration-300">
                  Active now
                </span>
              </div>
              
              {selectedChatData.role && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  {selectedChatData.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/30 text-gray-400 hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:border-gray-600/30 hover:shadow-lg hover:shadow-gray-500/10 backdrop-blur-sm group/btn">
            <RiMore2Fill className="text-xl group-hover/btn:rotate-180 transition-transform duration-500" />
          </button>
          
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
          
          <button 
            onClick={closeChat}
            className="p-3 rounded-2xl bg-gradient-to-br from-gray-800/30 to-red-900/30 border border-gray-700/30 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/10 backdrop-blur-sm group/btn"
          >
            <RiCloseFill className="text-xl group-hover/btn:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;