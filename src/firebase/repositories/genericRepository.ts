import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function genericRepository<T>(collectionName: string) {
  const myCollections = collection(db, collectionName);

  const add = async (data: T) => {
    await addDoc(myCollections, data as { [key: string]: any });
  };
  const getAll = async () => {
    const snapshot = await getDocs(myCollections);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  };

  const getById = async (id: string): Promise<T | null> => {
    if (!id) {
      return null;
    }
    const docRef = doc(myCollections, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  };
  const update = async (id: string, data: Partial<T>) => {
    const dataRef = doc(myCollections, id);
    await updateDoc(dataRef, data as { [key: string]: any });
  };
  const deleteById = async (id: string) => {
    const docRef = doc(myCollections, id);
    await deleteDoc(docRef);
  };

  return { myCollections, add, getAll, getById, update, deleteById };
}
