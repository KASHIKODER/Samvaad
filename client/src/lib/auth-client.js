import axios from "axios";
import { POST } from "@/utils/constants";

export const authClient = axios.create({
  baseURL: POST,
  withCredentials: true,
});
