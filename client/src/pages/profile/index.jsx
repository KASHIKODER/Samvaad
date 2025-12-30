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
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo?.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo?.image) {
      setImage(`${POST}/${userInfo.image}`);
    } else {
      setImage(null);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is required.");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is required.");
      return false;
    }
    return true;
  };

// In Profile component - update the saveChanges function
const saveChanges = async () => {
  if (validateProfile()) {
    try {
      const response = await authClient.post(
        UPDATE_PROFILE_ROUTE,
        { firstName, lastName, color: selectedColor },
        { withCredentials: true }
      );
      
      if (response.status === 200 && response.data) {
        console.log("Profile update successful:", response.data);
        
        // ✅ Use updateUserInfo to update specific fields
        // Assuming you have updateUserInfo in your store
        setUserInfo({
          ...userInfo,
          ...response.data,
          profileSetup: true
        });
        
        toast.success("Profile updated successfully.");
        setIsEditing(false);
        
        // Navigate immediately
        navigate("/chat", { replace: true });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    }
  }
};

  const handleLogout = async () => {
    try {
      await authClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
      setUserInfo(null);
      toast.success("Logged out successfully.");
      navigate("/auth", { replace: true }); // ✅ always redirect to auth
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
          setUserInfo({ ...userInfo, image: response.data.image });
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
      setUserInfo({ ...userInfo, image: null });
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



  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-cols gap-10 w-[80vw] md:w-max">
        {/* Back Button */}
        <div>
          <IoArrowBack
            className="text-4xl lg:text-6xl text-white/60 cursor-pointer"
            onClick={() => navigate("/chat", { replace: true })} // ✅ fixed back always to chat
          />
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 gap-1">
          {/* Avatar Section */}
          <div
            className="h-full w-8 md:w-34 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-50 w-31 md:w-34 md:h-60 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className={`uppercase h-31 w-31 md:w-50 md:h-35 text-5xl border-[1.5px] flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {firstName
                    ? firstName.charAt(0)
                    : userInfo?.email?.charAt(0)}
                </div>
              )}
            </Avatar>

            {hovered && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/40 ring-fuchsia-50 rounded-full"
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
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

          {/* Inputs + Colors + Buttons */}
          <div className="flex min-w-65 md:min-w-64 flex-col gap-6 text-white items-center justify-center">
            {/* Email */}
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo?.email}
                className="w-full rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>

            {/* First Name */}
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                disabled={!isEditing}
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                className={`rounded-lg p-6 ${
                  isEditing ? "bg-[#2c2e3b]" : "bg-[#2c2e3b]/50"
                } border-none`}
              />
            </div>

            {/* Last Name */}
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                disabled={!isEditing}
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                className={`rounded-lg p-6 ${
                  isEditing ? "bg-[#2c2e3b]" : "bg-[#2c2e3b]/50"
                } border-none`}
              />
            </div>

            {/* Color Selection */}
            {isEditing && (
              <div className="w-full flex gap-5 justify-center">
                {colors.map((color, index) => (
                  <div
                    className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                      selectedColor === index
                        ? "outline outline-white/50 outline-1"
                        : ""
                    }`}
                    key={index}
                    onClick={() => setSelectedColor(index)}
                  ></div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="w-full mt-3 flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    className="h-13 w-32 bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                    onClick={saveChanges}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-13 w-32 bg-gray-600 hover:bg-gray-800"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="h-13 w-32 bg-blue-600 hover:bg-blue-800"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="h-13 w-32 bg-red-600 hover:bg-red-800"
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
    </div>
  );
};

export default Profile;
