import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { productSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/roleGuard';

// GET /api/v1/admin/products - List all products
export async function GET(req: NextRequest) {
    return requireAdmin(req, async () => {
        try {
            const snapshot = await adminDb.collection('products')
                .orderBy('createdAt', 'desc')
                .get();

            const products = snapshot.docs.map(doc => ({
                productId: doc.id,
                ...doc.data()
            }));

            return NextResponse.json({ products });
        } catch (error) {
            console.error('Error fetching products:', error);
            return NextResponse.json(
                { error: 'Failed to fetch products' },
                { status: 500 }
            );
        }
    });
}

// POST /api/v1/admin/products - Create new product
export async function POST(req: NextRequest) {
    return requireAdmin(req, async () => {
        try {
            const body = await req.json();
            
            // Validate input
            const validatedData = productSchema.parse(body);

            // Check if slug already exists
            const existingSlug = await adminDb.collection('products')
                .where('slug', '==', validatedData.slug)
                .limit(1)
                .get();

            if (!existingSlug.empty) {
                return NextResponse.json(
                    { error: 'A product with this slug already exists' },
                    { status: 400 }
                );
            }

            // Create product
            const productRef = adminDb.collection('products').doc();
            const productData = {
                ...validatedData,
                productId: productRef.id,
                currency: 'USD',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await productRef.set(productData);

            return NextResponse.json({
                success: true,
                product: productData
            }, { status: 201 });

        } catch (error: any) {
            if (error.name === 'ZodError') {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }

            console.error('Error creating product:', error);
            return NextResponse.json(
                { error: 'Failed to create product' },
                { status: 500 }
            );
        }
    });
}
