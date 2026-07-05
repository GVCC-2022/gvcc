importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBJX_dyLK80p2rNqSVvGY67TpWV7e_UdPI",
    projectId: "gvcc-database",
    messagingSenderId: "1063216875940",
    appId: "1:1063216875940:web:a4ee2f39b01896b44c5931"
});

const messaging = firebase.messaging();

// जब ऐप बंद होगा, तब यह कोड फोन की स्क्रीन पर नोटिफिकेशन गिराएगा
messaging.onBackgroundMessage(function(payload) {
    console.log("Background Message Received:", payload);
    const notificationTitle = payload.notification.title || "GVCC New Update";
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/20260620_144347.png', // आपके कोचिंग का लोगो
        badge: '/20260620_144347.png'
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
