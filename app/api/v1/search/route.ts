import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    // Search courses
    const coursesSnapshot = await adminDb
      .collection('courses')
      .where('isPublished', '==', true)
      .get();

    coursesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const title = data.title?.toLowerCase() || '';
      const description = data.description?.toLowerCase() || '';
      
      if (title.includes(query) || description.includes(query)) {
        results.push({
          type: 'course',
          id: doc.id,
          title: data.title,
          slug: data.slug,
          description: data.shortDescription || data.description,
          price: data.price,
          image: data.thumbnail,
        });
      }
    });

    // Search products
    const productsSnapshot = await adminDb
      .collection('products')
      .where('isActive', '==', true)
      .get();

    productsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const name = data.name?.toLowerCase() || '';
      const description = data.description?.toLowerCase() || '';
      
      if (name.includes(query) || description.includes(query)) {
        results.push({
          type: 'product',
          id: doc.id,
          title: data.name,
          slug: data.slug,
          description: data.shortDescription || data.description,
          price: data.price,
          image: data.images?.[0],
        });
      }
    });

    // Search blog posts
    const blogSnapshot = await adminDb
      .collection('blog')
      .where('isPublished', '==', true)
      .get();

    blogSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const title = data.title?.toLowerCase() || '';
      const content = data.excerpt?.toLowerCase() || '';
      
      if (title.includes(query) || content.includes(query)) {
        results.push({
          type: 'blog',
          id: doc.id,
          title: data.title,
          slug: data.slug,
          description: data.excerpt,
          image: data.image,
        });
      }
    });

    // Sort results by relevance (title matches first)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aStartsWith = aTitle.startsWith(query);
      const bStartsWith = bTitle.startsWith(query);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });

    return NextResponse.json({ 
      results: results.slice(0, 10) // Limit to 10 results
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
