import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // Create demo user with REAL hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    const user = await prisma.user.upsert({
        where: { email: 'demo@nirogi.ai' },
        update: {
            password: hashedPassword // Update password if exists
        },
        create: {
            email: 'demo@nirogi.ai',
            password: hashedPassword,
            name: 'Dr. John Demo',
            role: 'ADMIN',
        },
    });

    // Create demo patient
    const patient = await prisma.patient.create({
        data: {
            displayName: 'Alice Wonderland',
            dob: new Date('1990-05-15'),
            sex: 'Female',
            createdByUserId: user.id,
        },
    });

    console.log({ user, patient });

    // Drug synonyms demo
    await prisma.drugSynonym.createMany({
        data: [
            { canonical: 'ibuprofen', synonym: 'advil' },
            { canonical: 'ibuprofen', synonym: 'motrin' },
            { canonical: 'acetaminophen', synonym: 'tylenol' },
        ],
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
