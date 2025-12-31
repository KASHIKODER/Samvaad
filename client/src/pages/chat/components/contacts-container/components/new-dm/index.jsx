import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import { authClient } from "@/lib/auth-client.js";
import { SEARCH_CONTACTS_ROUTES, POST } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "@/store";
import Lottie from "lottie-react";

const NewDM = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await authClient.post(
          SEARCH_CONTACTS_ROUTES,
          { searchTerm },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data.contacts) {
          setSearchedContacts(response.data.contacts);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.error({ error });
    }
  };

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300 text-lg md:text-xl"
            onClick={() => setOpenNewContactModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-2 md:p-3 text-white text-xs md:text-sm">
          Select New Contact
        </TooltipContent>
      </Tooltip>

      <Dialog
        open={openNewContactModal}
        onOpenChange={setOpenNewContactModal}
      >
        <DialogContent className="bg-[#101820] border-none text-white w-[380px] max-w-[95vw] h-[420px] flex flex-col p-4">
          <DialogHeader className="px-0">
            <DialogTitle className="text-lg">
              Select a contact
            </DialogTitle>
            <DialogDescription className="sr-only">
              Search and select a contact to start a new conversation
            </DialogDescription>
          </DialogHeader>

          <div className="px-0 mb-3">
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-3 bg-[#2c2e3b] border-none w-full text-sm"
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>

          {searchedContacts.length > 0 ? (
            <ScrollArea className="flex-1 min-h-[200px] max-h-[280px] px-0">
              <div className="flex flex-col gap-2 pr-3">
                {searchedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#2c2e3b]/50 transition-all duration-200"
                    onClick={() => selectNewContact(contact)}
                  >
                    <div className="w-9 h-9 flex-shrink-0">
                      <Avatar className="h-full w-full rounded-full overflow-hidden">
                        {contact.image ? (
                          <AvatarImage
                            src={`${POST}/${contact.image}`}
                            alt={`${contact.firstName || contact.email}'s profile`}
                            className="object-cover w-full h-full bg-black rounded-full"
                          />
                        ) : (
                          <div
                            className={`uppercase h-full w-full text-sm border-[1px] flex items-center justify-center rounded-full text-white font-semibold ${getColor(
                              contact.color
                            )}`}
                          >
                            {contact.firstName
                              ? contact.firstName.split("").shift()
                              : contact.email.split("").shift()}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center px-0">
              <div className="w-[90px] h-[100px]">
                <Lottie
                  animationData={animationDefaultOptions}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full"
                />
              </div>
              <div className="text-opacity-80 text-white flex flex-col gap-2 items-center mt-3 text-center">
                <h3 className="poppins-medium text-base">
                  Search new <span className="text-purple-500">Contact</span>
                </h3>
                <p className="text-gray-400 text-xs">
                  Type in the search box to find contacts
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;