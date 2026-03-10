import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { contactFormSchema } from '@/lib/validation';
import { emailService } from '@/services/emailService';

// POST /api/v1/contact - Submit contact form
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Validate input
        const validatedData = contactFormSchema.parse(body);

        // Store in Firestore
        const contactRef = await adminDb.collection('contact_submissions').add({
            ...validatedData,
            status: 'new',
            createdAt: new Date(),
        });

        // Send email notification to admin
        try {
            await emailService.sendContactFormNotification({
                adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
                senderName: validatedData.name,
                senderEmail: validatedData.email,
                subject: validatedData.subject,
                message: validatedData.message,
            });
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the request if email fails - submission is still saved
        }

        return NextResponse.json({
            success: true,
            message: 'Contact form submitted successfully',
            id: contactRef.id
        }, { status: 201 });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error submitting contact form:', error);
        return NextResponse.json(
            { error: 'Failed to submit contact form' },
            { status: 500 }
        );
    }
}
