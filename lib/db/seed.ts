import 'dotenv/config';
import { db } from './index';
import { user, account, profile, introduction } from './schema';
import { eq } from 'drizzle-orm';

// Better Auth用のハッシュ関数（bcryptを使用）
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  // Better Authはデフォルトで$2a$プレフィックスを期待
  return await bcrypt.hash(password, 10);
}

async function seed() {
  console.log('🌱 Starting seed...');

  // 初期管理者ユーザーの作成
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123'; // 本番環境では変更すること

  // ユーザーが既に存在するかチェック
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, adminEmail),
  });

  if (existingUser) {
    console.log('✅ Admin user already exists');

    // 既存のアカウントがあるかチェック
    const existingAccount = await db.query.account.findFirst({
      where: eq(account.userId, existingUser.id),
    });

    if (existingAccount) {
      console.log('✅ Admin account already exists');
    } else {
      // アカウントがない場合は作成
      const hashedPassword = await hashPassword(adminPassword);
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: adminEmail,
        providerId: 'credential',
        userId: existingUser.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Admin account created for existing user');
    }

    return;
  }

  // ユーザーを作成
  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(adminPassword);

  await db.insert(user).values({
    id: userId,
    name: 'Admin',
    email: adminEmail,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Admin user created');

  // パスワード認証アカウントを作成
  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: adminEmail,
    providerId: 'credential',
    userId: userId,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Admin account created');

  // 初期プロフィールを作成
  await db.insert(profile).values({
    userId: userId,
    name: 'Admin User',
    email: adminEmail,
    phone: '000-0000-0000',
    bio: '# About Me\n\nThis is your profile bio. Edit this from the admin panel.',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Initial profile created');

  // 初期自己PRを作成
  await db.insert(introduction).values({
    title: 'Self Introduction',
    content: 'Edit your self-introduction from the admin panel.',
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Initial introduction created');

  console.log('\n🎉 Seed completed!');
  console.log(`\n📧 Admin Email: ${adminEmail}`);
  console.log(`🔑 Admin Password: ${adminPassword}`);
  console.log('\n⚠️  Please change the admin password after first login!\n');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
