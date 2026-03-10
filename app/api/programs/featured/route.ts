import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';

export async function GET() {
  try {
    // Fetch published and featured programs
    const snapshot = await adminDb
      .collection('programs')
      .where('published', '==', true)
      .limit(6) // Get up to 6 featured programs
      .get();

    // Sort by featured status and creation date
    const programs = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        // Featured programs first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by creation date
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

    return NextResponse.json({ 
      programs: programs.slice(0, 3), // Return top 3 for homepage
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
