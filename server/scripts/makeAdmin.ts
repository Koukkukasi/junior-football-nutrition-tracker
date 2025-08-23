import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin(clerkId: string) {
  try {
    const user = await prisma.user.update({
      where: { clerkId },
      data: { role: 'ADMIN' }
    });
    
    console.log(`✅ User ${user.name} (${user.email}) has been granted ADMIN role`);
    return user;
  } catch (error) {
    console.error('❌ Failed to update user role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get Clerk ID from command line argument or use the one we know
const clerkId = process.argv[2] || 'user_31WS21sVk2eoGZkMe14EM8Eje1o';

makeUserAdmin(clerkId)
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });