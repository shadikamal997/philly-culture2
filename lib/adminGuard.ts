import { NextRequest } from 'next/server';
import { verifyAuth } from './authGuard';

export async function verifyAdmin(request: NextRequest) {
    const user = await verifyAuth(request);

    if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('Forbidden: Admin access required');
    }

    return user;
}
