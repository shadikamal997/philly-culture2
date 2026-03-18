import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { verifyAdminAccess } from '@/lib/adminAuth';

interface UpdateProgramRequest {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  instructorName?: string;
  thumbnail?: string;
  images?: string[];
  programType?: 'intensive' | 'weekly' | 'professional';
  category?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  totalHours?: number;
  basePrice?: number;
  published?: boolean;
  featured?: boolean;
  certificateEnabled?: boolean;
  videoIntroUrl?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  maxStudents?: number;
  unlockType?: 'instant' | 'drip' | 'scheduled';
  accessDuration?: number;
  dripInterval?: number;
  isCohort?: boolean;
  startDate?: string;
  enrollmentDeadline?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    // 🔒 VERIFY ADMIN ACCESS
    const adminUser = await verifyAdminAccess(request);
    
    const { programId } = params;
    
    // Check if program exists
    const programRef = adminDb.collection('programs').doc(programId);
    const programSnap = await programRef.get();
    
    if (!programSnap.exists) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    const currentData = programSnap.data();

    // 📝 PARSE REQUEST BODY
    const body: UpdateProgramRequest = await request.json();

    // ✅ VALIDATE IF PROVIDED
    const validationErrors: string[] = [];
    
    if (body.title !== undefined && body.title.trim().length < 3) {
      validationErrors.push('Title must be at least 3 characters');
    }
    
    if (body.shortDescription !== undefined && body.shortDescription.trim().length < 10) {
      validationErrors.push('Short description must be at least 10 characters');
    }
    
    if (body.instructorName !== undefined && body.instructorName.trim().length < 2) {
      validationErrors.push('Instructor name is required');
    }
    
    if (body.basePrice !== undefined && body.basePrice < 0) {
      validationErrors.push('Price must be non-negative');
    }
    
    if (body.totalHours !== undefined && body.totalHours < 1) {
      validationErrors.push('Total hours must be at least 1');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // 📦 PREPARE UPDATE DATA (only include fields that were provided)
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Basic Info
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription.trim();
    if (body.fullDescription !== undefined) updateData.fullDescription = body.fullDescription.trim();
    if (body.instructorName !== undefined) updateData.instructorName = body.instructorName.trim();
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.images !== undefined) updateData.images = body.images;
    
    // Classification
    if (body.programType !== undefined) updateData.programType = body.programType;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.difficultyLevel !== undefined) updateData.difficultyLevel = body.difficultyLevel;
    if (body.language !== undefined) updateData.language = body.language;
    
    // Pricing & Duration
    if (body.totalHours !== undefined) updateData.totalHours = body.totalHours;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    
    // Settings
    if (body.published !== undefined) updateData.published = body.published;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.certificateEnabled !== undefined) updateData.certificateEnabled = body.certificateEnabled;
    
    // Additional Content
    if (body.videoIntroUrl !== undefined) updateData.videoIntroUrl = body.videoIntroUrl || null;
    if (body.prerequisites !== undefined) updateData.prerequisites = body.prerequisites;
    if (body.learningObjectives !== undefined) updateData.learningObjectives = body.learningObjectives;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.maxStudents !== undefined) updateData.maxStudents = body.maxStudents || null;
    
    // Access Control
    if (body.unlockType !== undefined) updateData.unlockType = body.unlockType;
    if (body.accessDuration !== undefined) updateData.accessDuration = body.accessDuration;
    if (body.dripInterval !== undefined) updateData.dripInterval = body.unlockType === 'drip' ? body.dripInterval : null;
    if (body.isCohort !== undefined) updateData.isCohort = body.isCohort;
    
    // Cohort-specific fields
    if (body.isCohort) {
      if (body.startDate !== undefined) {
        updateData.startDate = body.startDate ? new Date(body.startDate) : null;
      }
      if (body.enrollmentDeadline !== undefined) {
        updateData.enrollmentDeadline = body.enrollmentDeadline ? new Date(body.enrollmentDeadline) : null;
      }
    } else {
      // Clear cohort fields if not a cohort
      updateData.startDate = null;
      updateData.enrollmentDeadline = null;
    }

    // 🔍 HANDLE SLUG UPDATE IF TITLE CHANGED
    if (body.title !== undefined) {
      const newSlug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Check if slug is different from current
      const currentData = programSnap.data();
      if (newSlug !== currentData?.slug) {
        let slug = newSlug;
        let slugExists = true;
        let counter = 1;
        
        // Check for duplicate slugs (excluding current program)
        while (slugExists) {
          const existingProgram = await adminDb
            .collection('programs')
            .where('slug', '==', slug)
            .limit(1)
            .get();
          
          if (existingProgram.empty || existingProgram.docs[0].id === programId) {
            slugExists = false;
          } else {
            slug = `${newSlug}-${counter}`;
            counter++;
          }
        }
        
        updateData.slug = slug;
      }
    }

    // 💾 UPDATE PROGRAM IN FIRESTORE
    await programRef.update(updateData);

    // 📊 LOG AUDIT TRAIL
    await adminDb.collection('auditLogs').add({
      action: 'program_updated',
      resourceType: 'program',
      resourceId: programId,
      performedBy: adminUser.uid,
      performedByEmail: adminUser.email,
      details: {
        updatedFields: Object.keys(body),
        programTitle: updateData.title || currentData?.title || 'Unknown',
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // ✅ RETURN SUCCESS
    return NextResponse.json({
      success: true,
      programId,
      message: 'Program updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating program:', error);

    // Handle specific error types
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to update program',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch a single program (useful for the edit page)
export async function GET(
  request: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    // 🔒 VERIFY ADMIN ACCESS
    await verifyAdminAccess(request);
    
    const { programId } = params;
    
    // Fetch program
    const programRef = adminDb.collection('programs').doc(programId);
    const programSnap = await programRef.get();
    
    if (!programSnap.exists) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    const programData = programSnap.data();
    
    // Convert Firestore timestamps to ISO strings
    const program = {
      id: programSnap.id,
      ...programData,
      createdAt: programData?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: programData?.updatedAt?.toDate?.()?.toISOString() || null,
      startDate: programData?.startDate?.toDate?.()?.toISOString() || null,
      enrollmentDeadline: programData?.enrollmentDeadline?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json({ success: true, program });

  } catch (error: any) {
    console.error('Error fetching program:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch program',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
