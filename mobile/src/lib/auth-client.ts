import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as storage from "./storage";
import { Platform } from "react-native";

// In development, Android emulator needs 10.0.2.2 to access host localhost
const baseURL = Platform.OS === "android" 
  ? "http://10.0.2.2:3000" 
  : "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "networth",
      storagePrefix: "networth",
      storage: storage as any,
    }),
  ],
});
