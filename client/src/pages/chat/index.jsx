import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";

const Chat = () => {
  const {
    userInfo,
    selectedChatType,
    isUploading,
    isDownloading,
    fileUploadProgress,
    fileDownloadProgress,
  } = useAppStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo && !userInfo.profileSetup) {
      toast("Please setup profile to continue.");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  if (!userInfo) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-white">
        Loading user data...
      </div>
    );
  }

  return (
  <div className="flex h-screen w-screen overflow-hidden bg-[#1c1d25] text-white">

    {/* Upload / Download Overlay */}
    {(isUploading || isDownloading) && (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-lg gap-4">
        <h5 className="text-3xl md:text-5xl animate-pulse">
          {isUploading ? "Uploading File" : "Downloading File"}
        </h5>
        <span>
          {isUploading ? fileUploadProgress : fileDownloadProgress}%
        </span>
      </div>
    )}

    {/* CONTACTS */}
    <div
      className={`
        h-full
        flex-shrink-0
        w-full md:w-[30%] lg:w-[25%]
        ${selectedChatType ? "hidden md:flex" : "flex"}
      `}
    >
      <ContactsContainer />
    </div>

    {/* CHAT */}
    <div
      className={`
        h-full flex flex-col
        flex-1
        ${selectedChatType ? "flex" : "hidden md:flex"}
      `}
    >
      {selectedChatType === undefined ? (
        <EmptyChatContainer />
      ) : (
        <ChatContainer />
      )}
    </div>

  </div>
);

};

export default Chat;
