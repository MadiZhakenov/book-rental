import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Проверяем количество книг
    const totalBooks = await prisma.book.count();
    const availableBooks = await prisma.book.count({
        where: { status: 'AVAILABLE' },
    });

    console.log('📚 Всего книг в базе:', totalBooks);
    console.log('✅ Доступных книг:', availableBooks);

    if (availableBooks === 0) {
        console.log('\n⚠️  Нет доступных книг! Создаю тестовые книги...\n');

        // Находим админа
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@bookrental.com' },
        });

        if (!admin) {
            console.error('❌ Админ не найден! Сначала создайте админ-аккаунт.');
            return;
        }

        // Создаем тестовые книги
        const testBooks = [
            {
                title: 'Война и мир',
                author: 'Лев Толстой',
                description: 'Эпический роман о России эпохи наполеоновских войн',
                genre: 'Классика',
                dailyPrice: 500,
                deposit: 2000,
                status: 'AVAILABLE' as const,
                ownerId: admin.id,
                images: [],
                language: 'ru',
            },
            {
                title: 'Преступление и наказание',
                author: 'Фёдор Достоевский',
                description: 'Философский роман о морали и преступлении',
                genre: 'Классика',
                dailyPrice: 450,
                deposit: 1800,
                status: 'AVAILABLE' as const,
                ownerId: admin.id,
                images: [],
                language: 'ru',
            },
            {
                title: 'Мастер и Маргарита',
                author: 'Михаил Булгаков',
                description: 'Мистический роман о добре и зле',
                genre: 'Фантастика',
                dailyPrice: 600,
                deposit: 2500,
                status: 'AVAILABLE' as const,
                ownerId: admin.id,
                images: [],
                language: 'ru',
            },
            {
                title: '1984',
                author: 'Джордж Оруэлл',
                description: 'Антиутопия о тоталитарном обществе',
                genre: 'Фантастика',
                dailyPrice: 550,
                deposit: 2200,
                status: 'AVAILABLE' as const,
                ownerId: admin.id,
                images: [],
                language: 'ru',
            },
        ];

        for (const bookData of testBooks) {
            await prisma.book.create({
                data: bookData,
            });
            console.log(`✅ Создана книга: "${bookData.title}"`);
        }

        console.log('\n🎉 Тестовые книги успешно созданы!');
    } else {
        console.log('\n✅ В базе есть доступные книги, они должны отображаться на главной странице.');
    }
}

main()
    .catch((e) => {
        console.error('Ошибка:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

