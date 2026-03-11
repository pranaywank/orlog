import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDJwTC_kNJjJoUYyB80S84AIxBhIBaLv1Q",
    authDomain: "orlogapp.firebaseapp.com",
    projectId: "orlogapp",
    storageBucket: "orlogapp.firebasestorage.app",
    messagingSenderId: "574372916510",
    appId: "1:574372916510:web:7a478dc38dad9d6bc7ad0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
    console.log("Checking Firestore for sessions...");
    try {
        const querySnapshot = await getDocs(collection(db, "sessions"));
        console.log(`Found ${querySnapshot.size} documents in 'sessions' collection.`);
        if (querySnapshot.size > 0) {
            console.log("First 3 document IDs:");
            querySnapshot.docs.slice(0, 3).forEach(doc => {
                console.log(doc.id, "=>", doc.data());
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

checkData();
