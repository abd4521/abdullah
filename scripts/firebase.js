const firebaseConfig = {
    apiKey: "AIzaSyDjbEkfu8fJmPTDQ8xksGehPday9lrcSrg",
    authDomain: "abdullah-bb8ab.firebaseapp.com",
    projectId: "abdullah-bb8ab",
    storageBucket: "abdullah-bb8ab.appspot.com",
    messagingSenderId: "286504008164",
    appId: "1:286504008164:web:8642bc9d56f36393052ff1"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();