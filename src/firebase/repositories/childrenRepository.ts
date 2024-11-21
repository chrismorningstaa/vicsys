import { getDocs, query, where, writeBatch } from "firebase/firestore";
import IChild from "../../interfaces/firebase/IChild";
import genericRepository from "./genericRepository";
import { db } from "../firebaseConfig";
import { v4 as uuidv4 } from "uuid";
export default function childrenRepository() {
  const _genericRepository = genericRepository<IChild>("children");
  const getByUserId = async (userId: string) => {
    const children = await _genericRepository.getAll();
    return children.filter((c) => c.userId == userId);
  };
  const addMany = async (userId: string, data: IChild[]) => {
    data.map(async (child) => {
      await _genericRepository.add({ ...child, userId, qrId: uuidv4() });
    });
    return data;
  };
  const deleteManyByUserId = async (userId: string) => {
    const collectionRef = _genericRepository.myCollections;
    const q = query(collectionRef, where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach(async (doc) => {
      await batch.delete(doc.ref);
    });

    await batch.commit();
  };
  return {
    deleteManyByUserId,
    getByUserId,
    addMany,
    ..._genericRepository,
  };
}
