import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { verifyAuth } from '@/lib/authGuard';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/v1/admin/blog - Get all blog posts
export async function GET(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req);

    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const snapshot = await adminDb
      .collection('blog')
      .orderBy('createdAt', 'desc')
      .get();

    const posts = snapshot.docs.map(doc => ({
      postId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/blog - Create new blog post
export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req);

    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { title, slug, excerpt, content, category, image, isPublished } = data;

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await adminDb
      .collection('blog')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (!existingPost.empty) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      );
    }

    const postData = {
      title,
      slug,
      excerpt,
      content,
      category: category || '',
      image: image || '',
      isPublished: isPublished ?? false,
      authorId: authUser.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('blog').add(postData);

    return NextResponse.json({
      message: 'Blog post created successfully',
      postId: docRef.id,
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
