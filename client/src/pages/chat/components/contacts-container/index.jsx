import ProfileInfo from "./components/profile-info";
import NewDM from "./components/new-dm";
import { authClient } from "@/lib/auth-client"; 
import { GET_DM_CONTACTS_ROUTES } from "@/utils/constants";
import { useEffect, useState } from "react"; // ✅ Add useState
import CreateChannel from "./components/create-channel";
import { useAppStore } from "@/store"; 
import ContactList from "@/components/contact-list";

const ContactsContainer = () => {
  const { setDirectMessagesContacts, directMessagesContacts } = useAppStore();
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const getContacts = async () => {
      try {
        setLoading(true);
        const response = await authClient.get(GET_DM_CONTACTS_ROUTES, {
          withCredentials: true,
        });
        
        console.log("Contacts API response:", response.data); // ✅ Debug log
        
        if (response.data?.contacts) {
          setDirectMessagesContacts(response.data.contacts);
        } else {
          // Set empty array if no contacts
          setDirectMessagesContacts([]);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        // Set empty array on error
        setDirectMessagesContacts([]);
      } finally {
        setLoading(false);
      }
    };
    
    getContacts();
  }, [setDirectMessagesContacts]); // ✅ Add dependency

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
        <div className="pt-3">
          <Logo />
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text="Direct Message" />
            <NewDM />
          </div>
          <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
            <div className="p-4 text-center text-gray-400">Loading contacts...</div>
          </div>
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text="Channels" />
            <CreateChannel />
          </div>
        </div>
        <ProfileInfo />
      </div>
    );
  }

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Message" />
          <NewDM />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          {/* ✅ Pass contacts or empty array */}
          <ContactList contacts={directMessagesContacts || []} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Channels" />
          <CreateChannel />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

// Keep Logo and Title components as they are
const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>
      </svg>
      <span className="text-3xl font-semibold ">Samvaad</span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};