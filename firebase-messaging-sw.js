importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBJX_dyLK80p2rNqSVvGY67TpWV7e_UdPI",
    authDomain: "gvcc-database.firebaseapp.com",
    projectId: "gvcc-database",
    storageBucket: "gvcc-database.firebasestorage.app",
    messagingSenderId: "1063216875940",
    appId: "1:1063216875940:web:a4ee2f39b01896b44c5931"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Background message received: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // 👇 यहाँ हमने पूरा लिंक डाल दिया है
    icon: 'https://gvcc.online/20260620_144347.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
