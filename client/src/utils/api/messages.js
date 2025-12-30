// client/src/utils/api/messages.js
import { authClient } from "@/lib/auth-client";
import { GET_ALL_MESSAGES_ROUTE } from '/src/utils/constants.js';

export const fetchMessages = async (recipientId) => {
  try {
    // ✅ CORRECT: POST request with body
    const response = await authClient.post(
      GET_ALL_MESSAGES_ROUTE,  // No /{recipientId}
      { id: recipientId },     // Send recipientId in body
      { withCredentials: true }
    );
    return response.data.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};