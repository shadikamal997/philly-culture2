import * as admin from 'firebase-admin';

/**
 * Validate Firebase Admin credentials
 * Ensures all required environment variables are present
 */
function validateAdminCredentials() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

    const missing: string[] = [];

    if (!projectId) {
        missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID or FIREBASE_ADMIN_PROJECT_ID');
    }
    
    if (!clientEmail) {
        missing.push('FIREBASE_CLIENT_EMAIL or FIREBASE_ADMIN_CLIENT_EMAIL');
    }
    
    if (!privateKey) {
        missing.push('FIREBASE_PRIVATE_KEY or FIREBASE_ADMIN_PRIVATE_KEY');
    }

    if (missing.length > 0) {
        const error = [
            '❌ Missing required Firebase Admin environment variables:',
            ...missing.map(v => `   - ${v}`),
            '',
            '📝 Please add these to your .env.local file.',
            '💡 Get your service account credentials from Firebase Console > Project Settings > Service Accounts',
        ].join('\n');

        if (process.env.NODE_ENV === 'production') {
            throw new Error(error);
        } else {
            console.error('\n' + error + '\n');
            throw new Error('Firebase Admin configuration incomplete');
        }
    }

    // TypeScript type assertion - we've already validated these exist above
    const validatedPrivateKey = privateKey!;
    const validatedProjectId = projectId!;
    const validatedClientEmail = clientEmail!;

    // Validate private key format
    const hasValidKey = validatedPrivateKey.length > 100 && 
                       (validatedPrivateKey.includes('BEGIN PRIVATE KEY') || validatedPrivateKey.includes('BEGIN RSA PRIVATE KEY'));

    if (!hasValidKey) {
        const error = '❌ FIREBASE_PRIVATE_KEY appears to be invalid. It should be a PEM-formatted private key.';
        if (process.env.NODE_ENV === 'production') {
            throw new Error(error);
        } else {
            console.error(error);
            throw new Error('Invalid Firebase private key format');
        }
    }

    return { 
        projectId: validatedProjectId, 
        clientEmail: validatedClientEmail, 
        privateKey: validatedPrivateKey 
    };
}

if (!admin.apps.length) {
    try {
        const { projectId, clientEmail, privateKey } = validateAdminCredentials();

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin Initialization Error:', error);
        throw error;
    }
}

export const adminDb = admin.firestore();
export const db = adminDb; // Alias for compatibility
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export default admin;
