import { adminDb } from '@/firebase/firebaseAdmin';
import { Product } from '@/types/firestore/product';

export async function getActiveProducts(): Promise<Product[]> {
    const snapshot = await adminDb.collection('products')
        .where('isActive', '==', true)
        .get();

    return snapshot.docs.map(doc => ({ productId: doc.id, ...doc.data() } as Product));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const snapshot = await adminDb.collection('products')
        .where('slug', '==', slug)
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    return { productId: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
}
