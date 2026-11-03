import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: key } = process.env;
if (!projectId || !clientEmail || !key) throw new Error('Firebase Admin configuration missing');
initializeApp({credential:cert({projectId,clientEmail,privateKey:key.replace(/\\n/g,'\n')})});
const db=getFirestore();
const refs=[];
for(const slug of ['ketchup','mayonnaise']) {
 const snap=await db.collection('menuItems').where('slug','==',slug).get();
 if(snap.size!==1) throw new Error('Expected exactly one item for '+slug);
 const doc=snap.docs[0]; const data=doc.data();
 console.log(JSON.stringify({id:doc.id,slug:data.slug,name:data.name,price:data.price,isActive:data.isActive}));
 refs.push({ref:doc.ref,slug});
}
if(process.argv.includes('--apply')) {
 await db.runTransaction(async tx=>{
  const docs=await Promise.all(refs.map(({ref})=>tx.get(ref)));
  docs.forEach((doc,i)=>{if(doc.data()?.slug!==refs[i].slug)throw new Error('Item changed');});
  refs.forEach(({ref})=>tx.update(ref,{price:0,updatedAt:new Date().toISOString()}));
 });
 for(const {ref} of refs){const data=(await ref.get()).data(); console.log(JSON.stringify({slug:data.slug,price:data.price,isActive:data.isActive,verified:true}));}
}
await db.terminate();
