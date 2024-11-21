import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { IUser, IUserPublic } from "../../interfaces/firebase/IUser";
import genericRepository from "./genericRepository";
import { db } from "../firebaseConfig";
import { IMyPuchaseEvent } from "../../interfaces/firebase/INonTechUser";

export default function userRepository() {
  const _genericRepository = genericRepository<IUser>("users");

  const isEmailExisted = async (email: string) => {
    const users = await _genericRepository.getAll();
    return !!users.find((u) => u.email == email);
  };
  const getUserByEmail = async (email: string) => {
    const users = await _genericRepository.getAll();
    return users.find((u) => u.email == email);
  };
  const add = async (user: IUserPublic, uid: string) => {
    const { name, email, birthday } = user;
    return await setDoc(doc(db, "users", uid), {
      name: name,
      email: email,
      birthday: birthday,
      userId: uid,
    });
  };
  const addMyPurchaseEvents = async (
    userId: string,
    myPurchaseEvent: IMyPuchaseEvent
  ): Promise<void> => {
    const db = getFirestore();
    const eventRef = doc(db, "users", userId);

    await updateDoc(eventRef, {
      myPurchaseEvents: arrayUnion(myPurchaseEvent),
    });
  };

  //   userId: string
  // ): Promise<IMyPuchaseEvent[]> => {
  //   const purchasesRef = collection(doc(db, "users", userId), "myPuchaseEvent");
  //   const snapshot = await getDocs(purchasesRef);

  //   if (snapshot.empty) {
  //     return [];
  //   }

  //   const purchases: IMyPuchaseEvent[] = snapshot.docs.map((doc) => {
  //     const data = doc.data();

  //     const purchaseEvent: IMyPuchaseEvent = {
  //       eventId: data.eventId || "",
  //       ticketCategoryId: data.ticketCategoryId || "",
  //       price: data.price || 0,
  //       totalTickets: data.totalTickets || 0,
  //       qrcodeUrl: data.qrcodeUrl || "",
  //     };

  //     return purchaseEvent;
  //   });

  //   return purchases;
  // };
  const getPurchasesByEventId = async (
    eventId: string
  ): Promise<{ user: IUserPublic; purchases: IMyPuchaseEvent[] }[]> => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      return [];
    }

    const usersWithPurchases: {
      user: IUserPublic;
      purchases: IMyPuchaseEvent[];
    }[] = [];

    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data() as IUserPublic;

      const purchases: IMyPuchaseEvent[] = (
        userData?.myPurchaseEvents || []
      ).filter((purchase) => purchase.eventId === eventId) as IMyPuchaseEvent[];
      if (purchases.length > 0) {
        await usersWithPurchases.push({ user: userData, purchases });
      }
    }

    return usersWithPurchases;
  };
  const updateUserPurchaseEvent = async (
    userId: string,
    purchaseEventId: string,
    updatedData: IMyPuchaseEvent
  ) => {
    // Function to get the user document from the "users" collection
    const userDocRef = doc(db, "users", userId);
    let userDoc = await getDoc(userDocRef);

    // If the user document does not exist in "users", search in "nonTechUsers"
    if (!userDoc.exists()) {
      const nonTechUsersCollection = collection(db, "nonTechUsers");
      const q = query(nonTechUsersCollection, where("id", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Assuming there's only one document matching the query
        userDoc = querySnapshot.docs[0];
      } else {
        throw new Error("User document not found in either collection");
      }
    }

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const myPurchaseEvents = userData?.myPurchaseEvents || [];

      // Find the event index to update
      const eventIndex = myPurchaseEvents.findIndex(
        (event: any) => event.purchaseEventId === purchaseEventId
      );

      if (eventIndex !== -1) {
        // Update the event data
        myPurchaseEvents[eventIndex] = {
          ...myPurchaseEvents[eventIndex],
          ...updatedData,
        };

        // Update the document in Firestore
        const userDocRef = userDoc.ref; // Reference to the found document
        await updateDoc(userDocRef, { myPurchaseEvents });
      } else {
        throw new Error("Purchase event not found");
      }
    } else {
      throw new Error("User document not found in either collection");
    }
  };

  return {
    ..._genericRepository,
    updateUserPurchaseEvent,
    getPurchasesByEventId,
    getUserByEmail,
    isEmailExisted,
    addMyPurchaseEvents,
    add,
  };
}
