// components/profile-info.jsx
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { POST } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/components/ui/tooltip.jsx";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoPowerSharp } from "react-icons/io5"; 
import { authClient } from "@/lib/auth-client";
import { LOGOUT_ROUTE } from "@/utils/constants";

const ProfileInfo = () => {
    const { userInfo, setUserInfo } = useAppStore();
    const navigate = useNavigate();

    const logOut = async (e) => {
        e.stopPropagation(); // Prevent event bubbling
        try {
            const response = await authClient.post(
                LOGOUT_ROUTE,
                {},
                { withCredentials: true }
            );
            if (response.status === 200) {
                setUserInfo(null);
                navigate("/auth", { replace: true });
            } 
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditProfile = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault(); // Prevent default behavior
        console.log("Edit profile clicked, navigating to /profile");
        navigate("/profile");
    };

    return (
        <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
            <div className="flex gap-3 items-center justify-center">
                <div className="w-12 h-12 relative">
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {userInfo?.image ? (
                            <AvatarImage
                                src={`${POST}/${userInfo.image}`}
                                alt="Profile"
                                className="object-cover w-full h-full bg-black"
                            />
                        ) : (
                            <div
                                className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full text-white font-semibold ${getColor(
                                    userInfo?.color || 0
                                )}`}
                            >
                                {userInfo?.firstName
                                    ? userInfo.firstName.split("").shift()
                                    : userInfo?.email?.split("").shift() || "U"}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div className="max-w-[120px] truncate">
                    {userInfo?.firstName && userInfo?.lastName
                        ? `${userInfo.firstName} ${userInfo.lastName}`
                        : userInfo?.email || "User"}
                </div>
            </div>
            <div className="flex gap-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button 
                                className="p-1 hover:bg-[#3a3b44] rounded transition-colors"
                                onClick={handleEditProfile}
                            >
                                <FiEdit2 
                                    className="text-purple-500 text-xl font-medium"
                                />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                            Edit Profile
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button 
                                className="p-1 hover:bg-[#3a3b44] rounded transition-colors"
                                onClick={logOut}
                            >
                                <IoPowerSharp  
                                    className="text-red-500 text-xl font-medium"
                                />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

export default ProfileInfo;