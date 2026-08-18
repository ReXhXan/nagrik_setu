import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.config";

export const uploadPhoto = async (file, userId) => {
  if (!file) return null;
  const fileName = `${userId}_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `reports/${fileName}`);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
