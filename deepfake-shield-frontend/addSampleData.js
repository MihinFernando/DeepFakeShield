// addSampleData.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzgWtX8IAy1WIKNbpu9zAYMuylnG1i-6w",
  authDomain: "deepfakeshield-604c7.firebaseapp.com",
  projectId: "deepfakeshield-604c7",
  appId: "1:1052171112902:web:1e5331d89930637b1862c7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleData() {
  try {
    console.log("Adding sample data...");

    // Add sample user
    await setDoc(doc(db, "users", "sample-user-id"), {
      email: "test@example.com",
      role: "user",
      createdAt: new Date()
    });
    console.log("Added sample user");

    // Add sample scans
    const scans = [
      {
        filename: "image1.jpg",
        label: "fake",
        confidence: 0.87,
        timestamp: new Date(),
        userId: "sample-user-id"
      },
      {
        filename: "image2.png",
        label: "real",
        confidence: 0.92,
        timestamp: new Date(Date.now() - 86400000), // yesterday
        userId: "sample-user-id"
      },
      {
        filename: "image3.jpeg",
        label: "fake",
        confidence: 0.78,
        timestamp: new Date(),
        userId: "sample-user-id"
      },
      {
        filename: "vacation_photo.jpg",
        label: "real",
        confidence: 0.95,
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        userId: "sample-user-id"
      },
      {
        filename: "profile_pic.png",
        label: "fake",
        confidence: 0.82,
        timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        userId: "sample-user-id"
      }
    ];

    for (const scan of scans) {
      await addDoc(collection(db, "scans"), scan);
      console.log(`Added scan: ${scan.filename}`);
    }

    console.log("Sample data added successfully!");
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error("Error adding sample data:", error);
    process.exit(1); // Exit with error
  }
}

addSampleData();