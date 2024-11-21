importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCAcEKTyd4_4ztNnAJhm-qhJK4A8IB0Up0",
    authDomain: "vicsys-a6039.firebaseapp.com",
    projectId: "vicsys-a6039",
    storageBucket: "vicsys-a6039.appspot.com",
    messagingSenderId: "96397940659",
    appId: "1:96397940659:web:e922846d71a8eb93d4ddc6",
    measurementId: "G-6Q9R8JMF0H",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
    click_action: payload.notification.click_action || 'https://vicsys-test-view.runasp.net/'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const clickAction = event.notification.data?.click_action || 'https://vicsys-test-view.runasp.net/';
  event.waitUntil(clients.openWindow(clickAction));
});