import { Platform } from 'react-native';

export async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } else {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  } else {
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  }
}

export async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } else {
    const SecureStore = require('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  }
}

export const getItemAsync = getItem;
export const setItemAsync = setItem;
export const deleteItemAsync = removeItem;
