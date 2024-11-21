import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebaseConfig";

const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const vapidKey =
        "BLkKHqJqyq246VxcyKz702XVwupcBRlU3iNi_6eSESeogln571ROZXnQpyixERlnf9nyRviYeHNlNMp1uYHY-5o"; // Replace with your VAPID key from Firebase project settings
      const token = await getToken(messaging, { vapidKey });
      if (token) {
        console.log("FCM Token:", token);
        return token;
      } else {
        console.error("Failed to get FCM token");
        return null;
      }
    } else {
      console.error("Permission denied for notifications");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export default requestNotificationPermission;
