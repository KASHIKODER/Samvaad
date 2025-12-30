// 👇 Add this inside your .env file
// VITE_SERVER_URL=http://localhost:5000   (or your backend URL)

export const POST = import.meta.env.VITE_SERVER_URL;
export const AUTH_ROUTES = "api/auth";

// Auth routes
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const USER_INFO_ROUTE = `${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/add-profile-image`;
export const REMOVE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/remove-profile-image`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;

// Contacts routes
export const CONTACTS_ROUTES = "api/contacts";
export const SEARCH_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/search`;
export const GET_DM_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS_ROUTES = `${CONTACTS_ROUTES}/get-all-contacts`;

// Messages routes
export const MESSAGES_ROUTES = "api/messages";
export const GET_ALL_MESSAGES_ROUTE = `${MESSAGES_ROUTES}/get-messages`;
export const UPLOAD_FILE_ROUTE = `${MESSAGES_ROUTES}/upload-file`;
export const DELETE_MESSAGE_ROUTE = `${MESSAGES_ROUTES}/delete`; // Added this line

// Chat routes
export const DELETE_CHAT_ROUTE = "/api/chat/delete";

// Socket events (for frontend use)
export const SOCKET_EVENTS = {
  MESSAGE_RECEIVED: "messageReceived",
  MESSAGE_SENT: "messageSent",
  MESSAGE_DELETED: "messageDeleted",
  TYPING_START: "typingStart",
  TYPING_STOP: "typingStop",
  USER_ONLINE: "userOnline",
  USER_OFFLINE: "userOffline",
  NEW_CHAT: "newChat",
  CHAT_UPDATED: "chatUpdated",
  ERROR: "error"
};