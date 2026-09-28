-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingProfile" (
    "studentId" UUID NOT NULL,
    "languageLevelCode" TEXT NOT NULL,
    "preferredLengthCode" TEXT NOT NULL,
    "readingGoalCode" TEXT NOT NULL,

    CONSTRAINT "ReadingProfile_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "ProfileGenre" (
    "studentId" UUID NOT NULL,
    "genreCode" TEXT NOT NULL,

    CONSTRAINT "ProfileGenre_pkey" PRIMARY KEY ("studentId","genreCode")
);

-- CreateTable
CREATE TABLE "ProfileTheme" (
    "studentId" UUID NOT NULL,
    "themeCode" TEXT NOT NULL,

    CONSTRAINT "ProfileTheme_pkey" PRIMARY KEY ("studentId","themeCode")
);

-- CreateTable
CREATE TABLE "TeacherStudentLink" (
    "studentId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,

    CONSTRAINT "TeacherStudentLink_pkey" PRIMARY KEY ("studentId","teacherId")
);

-- CreateTable
CREATE TABLE "ReadingListItem" (
    "studentId" UUID NOT NULL,
    "bookId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "addedByUserId" UUID NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingListItem_pkey" PRIMARY KEY ("studentId","bookId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ReadingProfile" ADD CONSTRAINT "ReadingProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGenre" ADD CONSTRAINT "ProfileGenre_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "ReadingProfile"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTheme" ADD CONSTRAINT "ProfileTheme_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "ReadingProfile"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudentLink" ADD CONSTRAINT "TeacherStudentLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudentLink" ADD CONSTRAINT "TeacherStudentLink_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingListItem" ADD CONSTRAINT "ReadingListItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingListItem" ADD CONSTRAINT "ReadingListItem_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
