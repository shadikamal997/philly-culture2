import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { verifyAuth } from '@/lib/authGuard';
import { FieldValue } from 'firebase-admin/firestore';

// PUT /api/v1/admin/blog/[postId] - Update blog post
export async function PUT(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const authUser = await verifyAuth(req);

    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { postId } = params;
    const data = await req.json();
    const { title, slug, excerpt, content, category, image, isPublished } = data;

    // Check if post exists
    const postDoc = await adminDb.collection('blog').doc(postId).get();

    if (!postDoc.exists) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== postDoc.data()?.slug) {
      const existingPost = await adminDb
        .collection('blog')
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (!existingPost.empty && existingPost.docs[0].id !== postId) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    await adminDb.collection('blog').doc(postId).update(updateData);

    return NextResponse.json({
      message: 'Blog post updated successfully',
      postId,
    });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/blog/[postId] - Delete blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const authUser = await verifyAuth(req);

    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { postId } = params;

    // Check if post exists
    const postDoc = await adminDb.collection('blog').doc(postId).get();

    if (!postDoc.exists) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await adminDb.collection('blog').doc(postId).delete();

    return NextResponse.json({
      message: 'Blog post deleted successfully',
      postId,
    });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
