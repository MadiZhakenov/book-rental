import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@bookrental.com';
    const adminPassword = 'admin123';
    const adminName = 'Администратор';

    // Проверяем, существует ли уже админ
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log('Админ-аккаунт уже существует!');
        console.log('Email:', adminEmail);
        console.log('Пароль:', adminPassword);
        return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Создаем админ-аккаунт
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password_hash: hashedPassword,
            bio: adminName,
            role: 'ADMIN',
            isPremium: true,
        },
    });

    console.log('✅ Админ-аккаунт успешно создан!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Пароль:', adminPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('Ошибка при создании админ-аккаунта:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

