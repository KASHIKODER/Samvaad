// components/contact-list.jsx
import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { POST } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import { fetchMessages } from "@/utils/api/messages";

const ContactList = ({ contacts = [], isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  // ✅ Ensure contacts is always an array
  const contactList = Array.isArray(contacts) ? contacts : [];

  const handleClick = async (contact) => {
    if (isChannel) {
      setSelectedChatType("channel");
    } else {
      setSelectedChatType("contact");
    }

    setSelectedChatData(contact);

    // Clear old messages before loading new chat
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }

    // Fetch messages only for contacts (not for channels yet)
    if (!isChannel) {
      try {
        const messages = await fetchMessages(contact._id);
        setSelectedChatMessages(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  // ✅ Show empty state if no contacts
  if (!contactList.length) {
    return (
      <div className="mt-5 p-4 text-center text-gray-400">
        {isChannel ? "No channels available" : "No contacts available"}
      </div>
    );
  }

  return (
    <div className="mt-5">
      {contactList.map((contact) => (
        <div
          key={contact._id || contact.id || Math.random()}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex items-center gap-5 justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contact.image ? (
                  <AvatarImage
                    src={`${POST}/${contact.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`${
                      selectedChatData && selectedChatData._id === contact._id
                        ? "bg-[#ffffff22] border border-white/70"
                        : getColor(contact.color || 0)
                    } uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                  >
                    {contact.firstName
                      ? contact.firstName.charAt(0)
                      : contact.email?.charAt(0) || '?'}
                  </div>
                )}
              </Avatar>
            )}

            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}

            {isChannel ? (
              <span>{contact.name || 'Unnamed Channel'}</span>
            ) : (
              <span>{`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email || 'Unknown'}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;