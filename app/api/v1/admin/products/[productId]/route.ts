import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { productSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/roleGuard';

// GET /api/v1/admin/products/[productId] - Get single product
export async function GET(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const productDoc = await adminDb.collection('products').doc(params.productId).get();

            if (!productDoc.exists) {
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                productId: productDoc.id,
                ...productDoc.data()
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            return NextResponse.json(
                { error: 'Failed to fetch product' },
                { status: 500 }
            );
        }
    });
}

// PUT /api/v1/admin/products/[productId] - Update product
export async function PUT(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const body = await req.json();
            
            // Validate input (partial update allowed)
            const validatedData = productSchema.partial().parse(body);

            // If slug is being updated, check uniqueness
            if (validatedData.slug) {
                const existingSlug = await adminDb.collection('products')
                    .where('slug', '==', validatedData.slug)
                    .limit(2)
                    .get();

                const otherProductWithSlug = existingSlug.docs.find(
                    doc => doc.id !== params.productId
                );

                if (otherProductWithSlug) {
                    return NextResponse.json(
                        { error: 'Another product with this slug already exists' },
                        { status: 400 }
                    );
                }
            }

            // Update product
            const productRef = adminDb.collection('products').doc(params.productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                );
            }

            const updateData = {
                ...validatedData,
                updatedAt: new Date(),
            };

            await productRef.update(updateData);

            const updated = await productRef.get();

            return NextResponse.json({
                success: true,
                product: {
                    productId: updated.id,
                    ...updated.data()
                }
            });

        } catch (error: any) {
            if (error.name === 'ZodError') {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }

            console.error('Error updating product:', error);
            return NextResponse.json(
                { error: 'Failed to update product' },
                { status: 500 }
            );
        }
    });
}

// DELETE /api/v1/admin/products/[productId] - Delete product
export async function DELETE(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const productRef = adminDb.collection('products').doc(params.productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                );
            }

            await productRef.delete();

            return NextResponse.json({
                success: true,
                message: 'Product deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting product:', error);
            return NextResponse.json(
                { error: 'Failed to delete product' },
                { status: 500 }
            );
        }
    });
}
