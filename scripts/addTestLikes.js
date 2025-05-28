import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

// Firebase config for emulator
const firebaseConfig = {
  projectId: 'kurukh-dictionary',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, 'localhost', 8081);

async function addTestLikes() {
  try {
    console.log('✅ Connected to Firestore emulator');
    
    // Get all words
    const wordsSnapshot = await getDocs(collection(db, 'words'));
    const words = wordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${words.length} words in database`);
    
    // Add test likes to different words
    const testUsers = [
      'anon_user_1',
      'anon_user_2', 
      'anon_user_3',
      'anon_user_4',
      'anon_user_5'
    ];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const numLikes = Math.floor(Math.random() * 4) + 1; // 1-4 likes
      
      console.log(`💖 Adding ${numLikes} likes to word: ${word.kurukh}`);
      
      const usersToAdd = testUsers.slice(0, numLikes);
      
      for (const user of usersToAdd) {
        await updateDoc(doc(db, 'words', word.id), {
          likesCount: increment(1),
          likedBy: arrayUnion(user)
        });
      }
    }
    
    console.log('\n🎉 Successfully added test likes to all words!');
    
    // Show final state
    const updatedSnapshot = await getDocs(collection(db, 'words'));
    console.log('\n📋 Final like counts:');
    updatedSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   ${data.kurukh}: ${data.likesCount || 0} likes`);
    });
    
  } catch (error) {
    console.error('❌ Error adding test likes:', error);
  }
}

addTestLikes();
