import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';

export async function GET() {
  try {
    // Fetch all published programs
    const snapshot = await adminDb
      .collection('programs')
      .where('published', '==', true)
      .get();

    // Get all published programs (excluding demos/tests)
    const allPrograms = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((program: any) => {
        // Exclude programs with "demo", "test", or "sample" in title (case-insensitive)
        const title = (program.title || '').toLowerCase();
        return !title.includes('demo') && 
               !title.includes('test') && 
               !title.includes('sample');
      })
      .sort((a: any, b: any) => {
        // Sort by creation date (newest first)
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

    // First try to get featured programs
    const featuredPrograms = allPrograms.filter((program: any) => program.featured);
    
    // If we have featured programs, use them; otherwise use latest published programs
    const programsToShow = featuredPrograms.length > 0 ? featuredPrograms : allPrograms;

    return NextResponse.json({ 
      programs: programsToShow.slice(0, 3), // Return top 3 for homepage
      success: true 
    });
  } catch (error) {
    console.error('Error fetching featured programs:', error);
    return NextResponse.json(
      { programs: [], success: false, error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
