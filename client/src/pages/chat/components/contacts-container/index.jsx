// components/contacts-container.jsx
import ProfileInfo from "./components/profile-info";
import NewDM from "./components/new-dm";
import { authClient } from "@/lib/auth-client"; 
import { GET_DM_CONTACTS_ROUTES } from "@/utils/constants";
import { useEffect, useState, useCallback, memo } from "react";
import CreateChannel from "./components/create-channel";
import { useAppStore } from "@/store"; 
import ContactList from "@/components/contact-list";
import { Users, Hash, ChevronRight, MessageSquare, Menu } from "lucide-react";

const ContactsContainer = memo(() => {
  const { setDirectMessagesContacts, directMessagesContacts, selectedChatType, setSelectedChatType } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const getContacts = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime < 1000) {
      return;
    }

    try {
      setLoading(true);
      setLastFetchTime(now);
      
      const response = await authClient.get(GET_DM_CONTACTS_ROUTES, {
        withCredentials: true,
      });
      
      console.log("Contacts API response:", response.data);
      
      if (response.data?.contacts) {
        setDirectMessagesContacts(response.data.contacts);
      } else {
        setDirectMessagesContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setDirectMessagesContacts([]);
    } finally {
      setLoading(false);
    }
  }, [setDirectMessagesContacts, lastFetchTime]);

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  if (loading) {
    return (
      <div className={`relative w-full md:w-[380px] xl:w-[420px] bg-gradient-to-b from-[#0f1117] to-[#0a0c14] border-r border-gray-800/30 h-full flex flex-col ${selectedChatType ? 'hidden md:flex' : 'flex'}`}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800/30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedChatType(null)}
              className="p-1 hover:bg-gray-800/30 rounded"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <Logo />
          </div>
        </div>

        {/* Desktop Logo Header */}
        <div className="hidden md:block pt-6 pb-4 border-b border-gray-800/30 px-6">
          <Logo />
        </div>

        {/* Loading State */}
        <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Direct Messages Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle icon={<MessageSquare className="w-4 h-4" />} text="Direct Messages" />
              <NewDM />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-800/20">
                  <div className="w-10 h-10 rounded-full bg-gray-700/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-700/50 rounded w-24" />
                    <div className="h-2 bg-gray-700/30 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channels Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle icon={<Hash className="w-4 h-4" />} text="Channels" />
              <CreateChannel />
            </div>
            <div className="p-4 text-center text-gray-500 text-sm">
              Loading channels...
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <ProfileInfo />
      </div>
    );
  }

  return (
    <div className={`relative w-full md:w-[380px] xl:w-[420px] bg-gradient-to-b from-[#0f1117] to-[#0a0c14] border-r border-gray-800/30 h-full flex flex-col ${selectedChatType ? 'hidden md:flex' : 'flex'}`}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800/30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedChatType(null)}
            className="p-1 hover:bg-gray-800/30 rounded"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          <Logo />
        </div>
      </div>

      {/* Desktop Logo Header */}
      <div className="hidden md:block pt-6 pb-4 border-b border-gray-800/30 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent">
        {/* Direct Messages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle icon={<MessageSquare className="w-4 h-4" />} text="Direct Messages" />
            <NewDM />
          </div>
          <div className="space-y-2">
            <ContactList contacts={directMessagesContacts || []} />
          </div>
          {(!directMessagesContacts || directMessagesContacts.length === 0) && (
            <div className="p-4 rounded-lg bg-gray-800/10 border border-gray-800/20 text-center">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No contacts yet</p>
              <p className="text-gray-600 text-xs mt-1">Start a conversation by adding a contact</p>
            </div>
          )}
        </div>

        {/* Channels Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle icon={<Hash className="w-4 h-4" />} text="Channels" />
            <CreateChannel />
          </div>
          <div className="space-y-2">
            {/* Example Channel - You can replace with actual channel data */}
            <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/20 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                <Hash className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-200">General</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <ProfileInfo />
    </div>
  );
});

// Modern Logo Component
const Logo = memo(() => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 blur-md opacity-20 rounded-lg" />
        <svg
          id="logo-38"
          width="32"
          height="32"
          viewBox="0 0 78 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          <path
            d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
            fill="url(#logo-gradient)"
          ></path>
          <path
            d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
            fill="url(#logo-gradient)"
            fillOpacity="0.8"
          ></path>
          <path
            d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
            fill="url(#logo-gradient)"
            fillOpacity="0.6"
          ></path>
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Samvaad
        </span>
        <p className="hidden md:block text-xs text-gray-500 -mt-1">by KashiKoder</p>
      </div>
    </div>
  );
});

// Modern Section Title Component
const SectionTitle = memo(({ icon, text }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-400">
        {icon}
      </div>
      <h3 className="uppercase tracking-wider text-gray-400 font-medium text-xs">
        {text}
      </h3>
    </div>
  );
});

ContactsContainer.displayName = 'ContactsContainer';
Logo.displayName = 'Logo';
SectionTitle.displayName = 'SectionTitle';

export default ContactsContainer;