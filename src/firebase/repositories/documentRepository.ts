import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";

export default function documentRepository() {
  const uploadToFirebase = async (file: File, fileName: string) => {
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { snapshot, url };
  };

  return { uploadToFirebase };
}
