// Test script to run in browser console
// This tests the auth flow that happens in the React app

console.log('🧪 Testing browser auth flow...');

// Import Firebase from the global window if available
const auth = window.firebase?.auth();
const db = window.firebase?.firestore();

if (!auth || !db) {
  console.error('❌ Firebase not available in browser');
} else {
  console.log('✅ Firebase available');
  
  // Check current auth state
  auth.onAuthStateChanged(async (user) => {
    console.log('🔐 Auth state changed:', user ? user.email : 'Not logged in');
    
    if (user) {
      // Check user document
      try {
        const userDocRef = db.doc(`users/${user.uid}`);
        const userDoc = await userDocRef.get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log('👤 User data:', userData);
          console.log('🔑 User roles:', userData.roles);
          console.log('👑 Is admin:', userData.roles?.includes('admin'));
          
          // Try to query pending words
          if (userData.roles?.includes('admin')) {
            console.log('🔍 Querying pending words as admin...');
            const pendingQuery = db.collection('words')
              .where('status', '==', 'pending_review')
              .orderBy('createdAt', 'desc');
              
            const snapshot = await pendingQuery.get();
            console.log('📄 Pending words count:', snapshot.size);
            
            snapshot.forEach(doc => {
              console.log('📝 Pending word:', doc.data().kurukh_word);
            });
          }
        } else {
          console.log('❌ User document not found');
        }
      } catch (error) {
        console.error('❌ Error querying user data:', error);
      }
    }
  });
}
