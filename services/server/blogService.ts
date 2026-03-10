import { adminDb } from '@/firebase/firebaseAdmin';

export interface BlogPost {
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  category?: string;
  image?: string;
  publishedAt?: Date;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const snapshot = await adminDb.collection('blog')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { slug: doc.id, ...doc.data() } as BlogPost;
}
