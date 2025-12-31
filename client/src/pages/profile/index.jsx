// pages/profile.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store";
import { colors, getColor } from "../../lib/utils";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client.js";
import {
  POST,
  UPDATE_PROFILE_ROUTE,
  ADD_PROFILE_IMAGE_ROUTE,
  REMOVE_PROFILE_IMAGE_ROUTE,
  LOGOUT_ROUTE,
} from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo, updateUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
      setSelectedColor(userInfo.color || 0);
      
      // Check if this is initial profile setup
      const isSetup = userInfo.profileSetup === false;
      setIsInitialSetup(isSetup);
      
      // Set isEditing to true for initial setup
      if (isSetup) {
        setIsEditing(true);
      }
      
      if (userInfo.image) {
        setImage(`${POST}/${userInfo.image}`);
      } else {
        setImage(null);
      }
    }
  }, [userInfo]);

  const validateProfile = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    if (!trimmedFirstName) {
      toast.error("First Name is required.");
      return false;
    }
    if (!trimmedLastName) {
      toast.error("Last Name is required.");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    console.log("=== SAVE CHANGES CALLED ===");
    console.log("isInitialSetup:", isInitialSetup);
    
    if (!validateProfile()) return;
    
    setIsSaving(true);
    
    try {
      const response = await authClient.post(
        UPDATE_PROFILE_ROUTE,
        { 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          color: selectedColor 
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Profile update response:", response);
      
      if (response.status === 200 && response.data) {
        // Update store with ALL user info from response
        const updatedUserInfo = {
          ...userInfo,
          ...response.data,
          profileSetup: true
        };
        
        // Update store
        setUserInfo(updatedUserInfo);
        if (updateUserInfo) {
          updateUserInfo(response.data);
        }
        
        toast.success("Profile updated successfully.");
        
        // Clear any cached data
        localStorage.removeItem('userInfo');
        
        console.log("Navigating to /chat...");
        
        // ALWAYS navigate back to chat after saving
        // Use setTimeout to ensure React state updates are complete
        setTimeout(() => {
          navigate("/chat", { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      
      if (error.response) {
        toast.error(error.response.data?.message || "Failed to update profile");
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
      setUserInfo(null);
      toast.success("Logged out successfully.");
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed.");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);

      try {
        const response = await authClient.post(
          ADD_PROFILE_IMAGE_ROUTE,
          formData,
          { withCredentials: true }
        );

        if (response.status === 200 && response.data.image) {
          const newImageUrl = `${POST}/${response.data.image}`;
          const updatedInfo = { ...userInfo, image: response.data.image };
          setUserInfo(updatedInfo);
          if (updateUserInfo) {
            updateUserInfo({ image: response.data.image });
          }
          setImage(newImageUrl);
          toast.success("Image updated successfully.");
        }
      } catch (err) {
        toast.error("Failed to upload image.");
        console.log(err);
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await authClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const updatedInfo = { ...userInfo, image: null };
        setUserInfo(updatedInfo);
        if (updateUserInfo) {
          updateUserInfo({ image: null });
        }
        setImage(null);
        toast.success("Image removed successfully.");
      } else {
        toast.error("Failed to remove image.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove image.");
    }
  };

  const handleCancel = () => {
    if (isInitialSetup) {
      toast.warning("Please complete your profile setup to continue.");
    } else {
      setIsEditing(false);
      setFirstName(userInfo?.firstName || "");
      setLastName(userInfo?.lastName || "");
      setSelectedColor(userInfo?.color || 0);
    }
  };

  const handleBack = () => {
    if (isInitialSetup) {
      toast.warning("Please complete your profile setup to continue.");
    } else {
      navigate("/chat", { replace: true });
    }
  };

  // If userInfo is null, show loading
  if (!userInfo) {
    return (
      <div className="bg-[#1b1c24] min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1b1c24] min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full max-w-4xl">
        {/* Back Button */}
        <div className="md:block">
          <IoArrowBack
            className="text-3xl md:text-4xl lg:text-6xl text-white/60 cursor-pointer hover:text-white/80 transition-colors"
            onClick={handleBack}
            title={isInitialSetup ? "Complete profile to continue" : "Back to chat"}
          />
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center">
            <div
              className="relative flex items-center justify-center mb-4"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Avatar className="h-36 w-36 md:h-48 lg:h-60 md:w-48 lg:w-60 rounded-full overflow-hidden border-4 border-[#2c2e3b]">
                {image ? (
                  <AvatarImage
                    src={image}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className={`uppercase h-full w-full text-4xl md:text-5xl lg:text-6xl flex items-center justify-center rounded-full ${getColor(
                      selectedColor
                    )}`}
                  >
                    {firstName
                      ? firstName.charAt(0).toUpperCase()
                      : userInfo?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>

              {isEditing && hovered && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer transition-all"
                  onClick={image ? handleDeleteImage : handleFileInputClick}
                >
                  {image ? (
                    <FaTrash className="text-white text-xl md:text-2xl lg:text-3xl" />
                  ) : (
                    <FaPlus className="text-white text-xl md:text-2xl lg:text-3xl" />
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
                name="profile-image"
                accept=".png, .jpg, .jpeg, .svg, .webp"
              />
            </div>
          </div>

          {/* Inputs + Colors + Buttons */}
          <div className="flex flex-col gap-4 md:gap-6 text-white">
            {/* Email */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-2 text-gray-400">
                Email
              </label>
              <Input
                type="email"
                disabled
                value={userInfo?.email || ""}
                className="w-full rounded-lg p-3 md:p-4 bg-[#2c2e3b] border-none"
              />
            </div>

            {/* First Name */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-2 text-gray-400">
                First Name
              </label>
              <Input
                placeholder="First Name"
                type="text"
                disabled={!isEditing}
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                className={`rounded-lg p-3 md:p-4 ${
                  isEditing ? "bg-[#2c2e3b]" : "bg-[#2c2e3b]/50"
                } border-none`}
              />
            </div>

            {/* Last Name */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-2 text-gray-400">
                Last Name
              </label>
              <Input
                placeholder="Last Name"
                type="text"
                disabled={!isEditing}
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                className={`rounded-lg p-3 md:p-4 ${
                  isEditing ? "bg-[#2c2e3b]" : "bg-[#2c2e3b]/50"
                } border-none`}
              />
            </div>

            {/* Color Selection */}
            {isEditing && (
              <div className="w-full">
                <label className="block text-sm font-medium mb-3 text-gray-400">
                  Profile Color
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {colors.map((color, index) => (
                    <div
                      className={`${color} h-8 w-8 md:h-10 md:w-10 rounded-full cursor-pointer transition-all duration-300 ${
                        selectedColor === index
                          ? "outline-2 outline-white outline-offset-2"
                          : ""
                      }`}
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      title={`Color ${index + 1}`}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="w-full mt-4 flex flex-col sm:flex-row gap-2 md:gap-3">
              {isEditing ? (
                <>
                  <Button
                    className="h-10 md:h-12 flex-1 bg-purple-600 hover:bg-purple-700 transition-all duration-300"
                    onClick={saveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : isInitialSetup ? "Continue to Chat" : "Save Changes"}
                  </Button>
                  {!isInitialSetup && (
                    <Button
                      variant="secondary"
                      className="h-10 md:h-12 flex-1 bg-gray-600 hover:bg-gray-700"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    className="h-10 md:h-12 flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    className="h-10 md:h-12 flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS to hide scrollbars on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          /* Hide scrollbar for Chrome, Safari and Opera */
          body {
            overflow: hidden;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          body {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          body::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;