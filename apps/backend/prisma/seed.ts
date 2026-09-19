import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@roxiler.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@roxiler.com',
      password: hashedPassword,
      address: '123 Admin Street, Admin City, Admin State 12345',
      role: Role.SYSTEM_ADMIN
    }
  });

  console.log('✅ Created admin user:', admin.email);

  const storeOwner = await prisma.user.upsert({
    where: { email: 'owner@roxiler.com' },
    update: {},
    create: {
      name: 'Store Owner Name',
      email: 'owner@roxiler.com',
      password: hashedPassword,
      address: '456 Owner Avenue, Owner City, Owner State 67890',
      role: Role.STORE_OWNER
    }
  });

  console.log('✅ Created store owner:', storeOwner.email);

  const store = await prisma.store.upsert({
    where: { email: 'store@roxiler.com' },
    update: {},
    create: {
      name: 'Roxiler Electronics Store',
      email: 'store@roxiler.com',
      address: '789 Store Road, Store City, Store State 11111',
      ownerId: storeOwner.id
    }
  });

  console.log('✅ Created store:', store.name);

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@roxiler.com' },
    update: {},
    create: {
      name: 'Normal User Name Here',
      email: 'user@roxiler.com',
      password: hashedPassword,
      address: '321 User Lane, User City, User State 22222',
      role: Role.NORMAL_USER
    }
  });

  console.log('✅ Created normal user:', normalUser.email);

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: normalUser.id, storeId: store.id } },
    update: { value: 5 },
    create: { value: 5, userId: normalUser.id, storeId: store.id }
  });

  console.log('✅ Created rating');

  console.log('🎉 Seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });