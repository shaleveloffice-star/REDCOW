import {initializeApp} from 'firebase/app';
import {getFirestore,collection,getDocs,terminate} from 'firebase/firestore';
initializeApp({apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID});
for(const name of ['menuItems','brandStories']){
 const snap=await getDocs(collection(getFirestore(),name));
 console.log(JSON.stringify({collection:name,rows:snap.docs.map(d=>{const v=d.data();return {id:d.id,name:v.name,title:v.title,slug:v.slug,previousSlugs:v.previousSlugs,isActive:v.isActive};})},null,2));
}
await terminate(getFirestore());
