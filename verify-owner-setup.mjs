#!/usr/bin/env node
/**
 * Simple script to check if owner email exists in Firestore
 * Usage: Open Firebase Console and check manually, or run this if you have admin SDK set up
 */

console.log('🔍 How to Check Owner Email in Firestore\n');
console.log('━'.repeat(60));

const expectedEmail = 'owner@phillycultureacademy.com'; // From .env.local

console.log('\n📧 Your configured owner email (from .env.local):');
console.log(`   ${expectedEmail}\n`);

console.log('⚠️  This email MUST exist in your Firestore with role="owner"');
console.log('   Otherwise, chat creation will fail during enrollment!\n');

console.log('━'.repeat(60));
console.log('\n✅ HOW TO VERIFY:\n');

console.log('Option 1 - Firebase Console (Recommended):');
console.log('  1. Go to: https://console.firebase.google.com/project/philly-culture/firestore');
console.log('  2. Click on "users" collection');
console.log('  3. Search for email: owner@phillycultureacademy.com');
console.log('  4. Check if the document exists and has role="owner"\n');

console.log('Option 2 - Your Admin Dashboard:');
console.log('  1. Go to: https://www.phillycultrue.com/admin/users');
console.log('  2. Look for owner@phillycultureacademy.com');
console.log('  3. Check if role is "owner" or "superadmin"\n');

console.log('━'.repeat(60));
console.log('\n🔧 HOW TO FIX IF NOT FOUND:\n');

console.log('If the email does NOT exist:');
console.log('  1. Sign up at https://www.phillycultrue.com with that email');
console.log('  2. Then run: npm run set-admin owner@phillycultureacademy.com owner\n');

console.log('If the email exists but role is wrong:');
console.log('  1. Run: npm run set-admin owner@phillycultureacademy.com owner');
console.log('  2. Or edit directly in Firebase Console (users collection)\n');

console.log('━'.repeat(60));
console.log('\n💡 ALTERNATIVE: Update .env.local\n');

console.log('If you already have a different owner email with role="owner",');
console.log('you can update your .env.local file instead:\n');
console.log('  NEXT_PUBLIC_OWNER_EMAIL=your-actual-owner@email.com\n');

console.log('Then update in Vercel:');
console.log('  vercel env add NEXT_PUBLIC_OWNER_EMAIL production\n');

console.log('━'.repeat(60));
console.log('\n📝 TO TEST AFTER FIXING:\n');

console.log('1. Verify owner email exists with correct role');
console.log('2. Complete a test enrollment (buy a program)');
console.log('3. Go to "My Courses" - you should see a chat button');
console.log('4. Send a message');
console.log('5. Check /admin/chats - message should appear there\n');

console.log('━'.repeat(60));
