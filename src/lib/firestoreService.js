import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// --- Rental Products ---
export const getRentalProducts = async () => {
  const q = query(collection(db, 'rental_products'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addRentalProduct = async (productData) => {
  return await addDoc(collection(db, 'rental_products'), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateRentalProduct = async (id, productData) => {
  const docRef = doc(db, 'rental_products', id);
  return await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp()
  });
};

export const deleteRentalProduct = async (id) => {
  const docRef = doc(db, 'rental_products', id);
  return await deleteDoc(docRef);
};

// --- Rental Orders ---
export const getAllRentalOrders = async () => {
  const q = query(collection(db, 'rental_orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateRentalOrderStatus = async (orderId, status) => {
  const docRef = doc(db, 'rental_orders', orderId);
  return await updateDoc(docRef, { 
    status,
    updatedAt: serverTimestamp()
  });
};

// --- Users ---
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
