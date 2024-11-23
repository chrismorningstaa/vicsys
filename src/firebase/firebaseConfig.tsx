import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAcEKTyd4_4ztNnAJhm-qhJK4A8IB0Up0",
  authDomain: "vicsys-a6039.firebaseapp.com",
  projectId: "vicsys-a6039",
  storageBucket: "vicsys-a6039.appspot.com",
  messagingSenderId: "96397940659",
  appId: "1:96397940659:web:e922846d71a8eb93d4ddc6",
  measurementId: "G-6Q9R8JMF0H",
};

export const firebaseApp  = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp );
export const db = getFirestore(firebaseApp );
export const storage = getStorage(firebaseApp );
export const messaging = getMessaging(firebaseApp );

export const requestForToken = () => {
  return getToken(messaging, {
    vapidKey:
      "BLkKHqJqyq246VxcyKz702XVwupcBRlU3iNi_6eSESeogln571ROZXnQpyixERlnf9nyRviYeHNlNMp1uYHY-5o",
  })
    .then((currentToken) => {
      if (currentToken) {
        return currentToken;
      } else {
        alert(
          "No registration token available. Request permission to generate one."
        );
        return null;
      }
    })
    .catch((err) => {
     
      return null;
    });
};


onMessage(messaging, ({ notification }) => {
  new Notification(notification?.title ?? "s", {
    body: notification?.body,
    icon: notification?.icon,
  });
});
