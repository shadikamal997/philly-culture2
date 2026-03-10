import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/firebase/firebaseAdmin';
import { verifyAdminAccess } from '@/lib/adminAuth';

interface CreateProgramRequest {
  title: string;
  shortDescription: string;
  fullDescription?: string;
  instructorName: string;
  thumbnail: string;
  programType: 'intensive' | 'weekly' | 'professional';
  category: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  totalHours: number;
  basePrice: number;
  published: boolean;
  featured: boolean;
  certificateEnabled: boolean;
  videoIntroUrl?: string;
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
  maxStudents?: number;
  unlockType: 'instant' | 'drip' | 'scheduled';
  accessDuration: number;
  dripInterval?: number;
  isCohort: boolean;
  startDate?: string;
  enrollmentDeadline?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 VERIFY ADMIN ACCESS
    const adminUser = await verifyAdminAccess(request);
    
    // 📝 PARSE REQUEST BODY
    const body: CreateProgramRequest = await request.json();

    // ✅ VALIDATE REQUIRED FIELDS
    const validationErrors: string[] = [];
    
    if (!body.title || body.title.trim().length < 3) {
      validationErrors.push('Title must be at least 3 characters');
    }
    
    if (!body.shortDescription || body.shortDescription.trim().length < 10) {
      validationErrors.push('Short description must be at least 10 characters');
    }
    
    if (!body.instructorName || body.instructorName.trim().length < 2) {
      validationErrors.push('Instructor name is required');
    }
    
    if (body.basePrice < 0) {
      validationErrors.push('Price must be non-negative');
    }
    
    if (body.totalHours < 1) {
      validationErrors.push('Total hours must be at least 1');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // 🔍 GENERATE UNIQUE SLUG
    const baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    let slug = baseSlug;
    let slugExists = true;
    let counter = 1;
    
    // Check for duplicate slugs
    while (slugExists) {
      const existingProgram = await adminDb
        .collection('programs')
        .where('slug', '==', slug)
        .limit(1)
        .get();
      
      if (existingProgram.empty) {
        slugExists = false;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // 📦 PREPARE PROGRAM DATA
    const programData: any = {
      // Basic Info
      title: body.title.trim(),
      slug,
      shortDescription: body.shortDescription.trim(),
      fullDescription: body.fullDescription?.trim() || body.shortDescription.trim(),
      instructorName: body.instructorName.trim(),
      thumbnail: body.thumbnail,
      
      // Classification
      programType: body.programType,
      category: body.category,
      difficultyLevel: body.difficultyLevel,
      language: body.language,
      
      // Pricing & Duration
      totalHours: body.totalHours,
      basePrice: body.basePrice,
      
      // Settings
      published: body.published,
      featured: body.featured,
      certificateEnabled: body.certificateEnabled,
      
      // Additional Content
      videoIntroUrl: body.videoIntroUrl || null,
      prerequisites: body.prerequisites || [],
      learningObjectives: body.learningObjectives || [],
      tags: body.tags || [],
      maxStudents: body.maxStudents || null,
      
      // Access Control
      unlockType: body.unlockType,
      accessDuration: body.accessDuration,
      dripInterval: body.unlockType === 'drip' ? body.dripInterval : null,
      isCohort: body.isCohort,
      
      // Statistics (initialized)
      enrolledCount: 0,
      completionRate: 0,
      averageRating: 0,
      reviewCount: 0,
      totalRevenue: 0,
      
      // Metadata
      createdBy: adminUser.uid,
      createdByEmail: adminUser.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add cohort-specific fields
    if (body.isCohort) {
      if (body.startDate) {
        programData.startDate = new Date(body.startDate);
      }
      if (body.enrollmentDeadline) {
        programData.enrollmentDeadline = new Date(body.enrollmentDeadline);
      }
    }

    // 💾 CREATE PROGRAM IN FIRESTORE
    const docRef = await adminDb.collection('programs').add(programData);

    // 📊 LOG AUDIT TRAIL
    await adminDb.collection('auditLogs').add({
      action: 'program_created',
      resourceType: 'program',
      resourceId: docRef.id,
      performedBy: adminUser.uid,
      performedByEmail: adminUser.email,
      details: {
        programTitle: body.title,
        programSlug: slug,
        published: body.published,
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // ✅ RETURN SUCCESS
    return NextResponse.json({
      success: true,
      programId: docRef.id,
      slug,
      message: 'Program created successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating program:', error);

    // Handle specific error types
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create program',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
