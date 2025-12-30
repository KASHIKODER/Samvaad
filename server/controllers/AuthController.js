import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";
import fs from "fs";
import path from "path";

const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(404).send("Email and Password is required.");
    }
    const user = await User.create({ email, password });
    response.cookie("jwt", createToken(email, user.id), {
      maxAge: maxAge * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log({ error });
    if (error.code === 11000) {
      return response.status(409).send("Email already exists.");
    }
    return response.status(500).send("Internal Server Error");
  }
};

export const login = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(404).send("Email and Password is required.");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).send("User with the given email not found.");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return response.status(400).send("Password is incorrect.");
    }
    response.cookie("jwt", createToken(email, user.id), {
      maxAge: maxAge * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (request, response) => {
  try {
    const userData = await User.findById(request.userId);
    if (!userData) {
      return response.status(404).json({ 
        message: "User not found." 
      });
    }
    
    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
      // Add any other fields you need
    });
  } catch (error) {
    console.error("Get user info error:", error);
    return response.status(500).json({ 
      message: "Internal Server Error" 
    });
  }
};

export const updateProfile = async (request, response) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;
    
    // ✅ Better validation with clearer messages
    if (!firstName?.trim() || !lastName?.trim()) {
      return response.status(400).json({ 
        message: "First name and last name are required." 
      });
    }

    // ✅ Use findById and save() instead of findByIdAndUpdate for better control
    const user = await User.findById(userId);
    
    if (!user) {
      return response.status(404).json({ 
        message: "User not found." 
      });
    }

    // ✅ Update user fields
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.color = color || 0; // Default to 0 if not provided
    user.profileSetup = true; // ✅ Mark profile as setup

    // ✅ Save the updated user
    await user.save();

    return response.status(200).json({
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      color: user.color,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return response.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
};

export const addProfileImage = async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is Required.");
    }
    const date = Date.now();
    let fileName = "uploads/profiles/" + date + "-" + request.file.originalname;
    renameSync(request.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      request.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );
    return response.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const removeProfileImage = async (request, response) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);

    if (!user) return response.status(404).send("User not found.");

    if (user.image) {
      // Ensure absolute path
      const filePath = path.isAbsolute(user.image)
        ? user.image
        : path.join(process.cwd(), user.image);

      console.log("Trying to delete file:", filePath); // 🔍 debug

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.log("File does not exist:", filePath);
      }
    }

    user.image = null;
    await user.save();

    return response.status(200).send("Profile image removed successfully.");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const logout = async (request, response) => {
  try {
    response.cookie("jwt", "", {
      maxAge: 1,
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });
    return response.status(200).send("Logout Successfull.");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
