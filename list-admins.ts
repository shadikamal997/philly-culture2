import { adminDb } from './firebase/firebaseAdmin';

async function listAdmins() {
  console.log('🔍 Checking for admin/owner accounts in Firestore...\n');

  try {
    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in Firestore at all!');
      console.log('\n💡 You need to sign up at least one user first.');
      console.log('   Go to: https://www.phillycultrue.com/sign-up\n');
      process.exit(1);
      return;
    }

    console.log(`📋 Found ${usersSnapshot.docs.length} total users\n`);
    
    const adminUsers: any[] = [];
    const regularUsers: any[] = [];
    
    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const userInfo = {
        uid: doc.id,
        email: data.email,
        name: data.displayName || data.fullName || 'N/A',
        role: data.role || 'customer'
      };
      
      if (['owner', 'superadmin', 'admin'].includes(data.role)) {
        adminUsers.push(userInfo);
      } else {
        regularUsers.push(userInfo);
      }
    });

    if (adminUsers.length > 0) {
      console.log('✅ Admin/Owner Accounts:\n');
      adminUsers.forEach((user) => {
        console.log(`   ${user.role === 'owner' ? '👑' : '👨‍💼'} ${user.email}`);
        console.log(`      UID: ${user.uid}`);
        console.log(`      Name: ${user.name}`);
        console.log(`      Role: ${user.role}\n`);
      });
    } else {
      console.log('⚠️  No admin/owner accounts found!\n');
    }

    if (regularUsers.length > 0) {
      console.log(`📱 Regular Users (${regularUsers.length}):\n`);
      regularUsers.slice(0, 5).forEach((user) => {
        console.log(`   👤 ${user.email} (${user.role})`);
      });
      if (regularUsers.length > 5) {
        console.log(`   ... and ${regularUsers.length - 5} more\n`);
      } else {
        console.log('');
      }
    }

    // Check for the specific owner email
    const expectedOwner = 'owner@phillycultureacademy.com';
    const ownerExists = [...adminUsers, ...regularUsers].find(u => u.email === expectedOwner);
    
    console.log('━'.repeat(60));
    console.log('\n🎯 Required Owner Email:', expectedOwner);
    
    if (ownerExists) {
      if (ownerExists.role === 'owner' || ownerExists.role === 'superadmin') {
        console.log('✅ Status: EXISTS with correct role!');
        console.log('💬 Chat system will work!\n');
        process.exit(0);
      } else {
        console.log('⚠️  Status: EXISTS but role is wrong!');
        console.log(`   Current role: ${ownerExists.role}`);
        console.log('\n🔧 Fix with this command:');
        console.log(`   node set-owner-email.mjs ${expectedOwner}\n`);
        process.exit(1);
      }
    } else {
      console.log('❌ Status: DOES NOT EXIST');
      console.log('\n🔧 To fix, choose one option:\n');
      
      if (adminUsers.length > 0) {
        console.log('Option 1 - Use existing admin (RECOMMENDED):');
        console.log('  Update .env.local:');
        console.log(`  NEXT_PUBLIC_OWNER_EMAIL=${adminUsers[0].email}`);
        console.log('\n  Then update Vercel production:');
        console.log(`  vercel env rm NEXT_PUBLIC_OWNER_EMAIL production`);
        console.log(`  vercel env add NEXT_PUBLIC_OWNER_EMAIL production`);
        console.log(`  (enter: ${adminUsers[0].email})`);
        console.log('\n  Then redeploy:');
        console.log('  npx vercel --prod\n');
      }
      
      console.log('Option 2 - Create new owner account:');
      console.log('  1. Sign up at: https://www.phillycultrue.com/sign-up');
      console.log(`     using email: ${expectedOwner}`);
      console.log('  2. Then run:');
      console.log(`     node set-owner-email.mjs ${expectedOwner}\n`);
      
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listAdmins();
