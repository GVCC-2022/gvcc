importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js');

// आपके GVCC Database की सेटिंग
firebase.initializeApp({
    apiKey: "AIzaSyBJX_dyLK80p2rNqSVvGY67TpWV7e_UdPI",
    authDomain: "gvcc-database.firebaseapp.com",
    projectId: "gvcc-database",
    storageBucket: "gvcc-database.firebasestorage.app",
    messagingSenderId: "1063216875940",
    appId: "1:1063216875940:web:a4ee2f39b01896b44c5931"
});

const messaging = firebase.messaging();

// जब ऐप बंद हो, तब मैसेज दिखाने का कोड
messaging.onBackgroundMessage(function(payload) {
  console.log('Background message received: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '20260620_144347.png' // नोटिफिकेशन में आपका GVCC लोगो दिखेगा
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

