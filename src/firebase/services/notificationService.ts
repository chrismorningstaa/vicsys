export default function notificationService() {
  const sendMessage = async () => {
    // const message = {
    //   notification: {
    //     title: "Hello!",
    //     body: "This is a test notification.",
    //   },
    //   token:
    //     "BLkKHqJqyq246VxcyKz702XVwupcBRlU3iNi_6eSESeogln571ROZXnQpyixERlnf9nyRviYeHNlNMp1uYHY-5o",
    // };
    // admin
    //   .messaging()
    //   .send(message)
    //   .then((response: any) => {
    //     console.log("Successfully sent message:", response);
    //   })
    //   .catch((error: any) => {
    //     console.error("Error sending message:", error);
    //   });
  };

  return {
    sendMessage,
  };
}
