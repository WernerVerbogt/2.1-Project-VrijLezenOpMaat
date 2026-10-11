// As account registration is not required for this proof of concept project,
// we will manually add accounts in the database.
// As passwords needs to be hashed, we will use bcrypt

import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole } from '../generated/prisma/client'

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const studentPassword = process.env.SEED_STUDENT_PASSWORD;
    const teacherPassword = process.env.SEED_TEACHER_PASSWORD;

    if (!studentPassword || !teacherPassword)
    {
        throw new Error('Seed passwords are not configured.');
    }

    const studentHash = await bcrypt.hash(studentPassword, 12);
    const teacherHash = await bcrypt.hash(teacherPassword, 12);

    await prisma.user.upsert({
        where: { email: 'student1@curio.nl' },
        update: {},
        create: {
            email: 'student1@curio.nl',
            passwordHash: studentHash,
            firstName: 'DummyEen',
            lastName: 'Student',
            role: UserRole.STUDENT,
        },
    });

    await prisma.user.upsert({
        where: { email: 'student2@curio.nl' },
        update: {},
        create: {
            email: 'student2@curio.nl',
            passwordHash: studentHash,
            firstName: 'DummyTwee',
            lastName: 'Student',
            role: UserRole.STUDENT,
        },
    });

        await prisma.user.upsert({
        where: { email: 'student3@curio.nl' },
        update: {},
        create: {
            email: 'student3@curio.nl',
            passwordHash: studentHash,
            firstName: 'Student 3',
            lastName: 'Student',
            role: UserRole.STUDENT,
        },
    });

    await prisma.user.upsert({
        where: { email: 'docent1@curio.nl' },
        update: {},
        create: {
            email: 'docent1@curio.nl',
            passwordHash: teacherHash,
            firstName: 'DummyTwee',
            lastName: 'Docent',
            role: UserRole.TEACHER,
        },
    });

    await prisma.user.upsert({
        where: { email: 'docent2@curio.nl' },
        update: {},
        create: {
            email: 'docent2@curio.nl',
            passwordHash: teacherHash,
            firstName: 'DummyTwee',
            lastName: 'Docent',
            role: UserRole.TEACHER,
        },
    });

    console.log('Database seeded succesfully');
}

main().catch((error) => {console.error(error);
    process.exit(1);
    }).finally(async () => {await prisma.$disconnect();});