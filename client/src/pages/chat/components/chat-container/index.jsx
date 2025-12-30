import MessageContainer from "./components/message-container";
import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";

const ChatContainer = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#1c1d25]">

      {/* Header */}
      <div className="shrink-0">
        <ChatHeader />
      </div>

      {/* Messages (scrollable but scrollbar hidden) */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <MessageContainer />
      </div>

      {/* Message Input */}
      <div className="shrink-0">
        <MessageBar />
      </div>

    </div>
  );
};

export default ChatContainer;