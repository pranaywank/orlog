import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

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
    console.log("Checking Firestore for ordered sessions...");
    try {
        const q = query(
            collection(db, "sessions"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} documents in 'sessions' collection.`);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

checkData();
