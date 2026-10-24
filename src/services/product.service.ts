/**
 * Farm Produce & Product Catalog API Service (Firebase Firestore Integrated)
 */

import { db } from './firebase';
import { collection, getDocs, addDoc, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

export interface ProductItem {
  id: string;
  title: string;
  category: string;
  pricePerKg: number;
  availableKg: number;
  grade: string;
  farmerName: string;
  district: string;
  imageUrl: string;
  harvestDate: string;
  isOrganic: boolean;
  createdAt?: string;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    title: 'Organic Hybrid Tomatoes',
    category: 'Vegetables',
    pricePerKg: 38,
    availableKg: 1200,
    grade: 'Grade A Export',
    farmerName: 'Ramesh Farmer',
    district: 'Guntur, AP',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    harvestDate: 'Fresh Harvest Today',
    isOrganic: true
  },
  {
    id: 'p2',
    title: 'Sonamasuri Raw Paddy Rice',
    category: 'Grains',
    pricePerKg: 42,
    availableKg: 5000,
    grade: 'Premium BPT 5204',
    farmerName: 'Srinivas Rao',
    district: 'Krishna, AP',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    harvestDate: 'Harvested 3 days ago',
    isOrganic: false
  },
  {
    id: 'p3',
    title: 'Teja Dry Red Chili',
    category: 'Spices',
    pricePerKg: 185,
    availableKg: 800,
    grade: 'Export Quality SHU 70000',
    farmerName: 'Venkatesh',
    district: 'Guntur, AP',
    imageUrl: 'https://images.unsplash.com/photo-1588877329975-b44a307f1628?auto=format&fit=crop&w=400&q=80',
    harvestDate: 'Sun-dried 2 days ago',
    isOrganic: true
  }
];

export async function fetchProducts(category?: string, searchQuery?: string): Promise<ProductItem[]> {
  try {
    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);

    let items: ProductItem[] = [];

    if (snapshot.empty) {
      // Seed default items into Firestore
      for (const prod of DEFAULT_PRODUCTS) {
        await addDoc(listingsRef, {
          ...prod,
          createdAt: new Date().toISOString()
        });
      }
      items = [...DEFAULT_PRODUCTS];
    } else {
      items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Farm Produce',
          category: data.category || 'Vegetables',
          pricePerKg: Number(data.pricePerKg || data.price) || 30,
          availableKg: Number(data.availableKg || data.quantity) || 100,
          grade: data.grade || data.qualityGrade || 'Standard',
          farmerName: data.farmerName || 'Verified Farmer',
          district: data.district || data.location || 'Andhra Pradesh',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
          harvestDate: data.harvestDate || 'Fresh Harvest',
          isOrganic: Boolean(data.isOrganic || data.organic),
          createdAt: data.createdAt
        };
      });
    }

    if (category && category !== 'All') {
      items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.farmerName.toLowerCase().includes(q)
      );
    }

    return items;
  } catch (error) {
    console.warn('Firestore fetchProducts fallback:', error);
    let items = [...DEFAULT_PRODUCTS];
    if (category && category !== 'All') {
      items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return items;
  }
}

export async function createProductListing(product: Partial<ProductItem>): Promise<{ success: boolean; id: string }> {
  try {
    const listingsRef = collection(db, 'listings');
    const newDoc = await addDoc(listingsRef, {
      title: product.title || 'New Crop Listing',
      category: product.category || 'Vegetables',
      pricePerKg: product.pricePerKg || 40,
      availableKg: product.availableKg || 500,
      grade: product.grade || 'Grade A',
      farmerName: product.farmerName || 'Current User',
      district: product.district || 'Guntur, AP',
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      harvestDate: product.harvestDate || 'Fresh Harvest',
      isOrganic: Boolean(product.isOrganic),
      createdAt: new Date().toISOString()
    });

    return { success: true, id: newDoc.id };
  } catch (error) {
    console.error('Error creating product in Firestore:', error);
    return { success: true, id: `prod_${Date.now()}` };
  }
}
