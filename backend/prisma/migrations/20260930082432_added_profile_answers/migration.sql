-- CreateEnum
CREATE TYPE "ProfileAnswerType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SCALE', 'OPEN_TEXT');

-- CreateTable
CREATE TABLE "ProfileAnswer" (
    "studentId" UUID NOT NULL,
    "questionCode" TEXT NOT NULL,
    "answerType" "ProfileAnswerType" NOT NULL,
    "stringValue" TEXT,
    "stringValues" TEXT[],
    "numberValue" INTEGER,
    "textValue" TEXT,

    CONSTRAINT "ProfileAnswer_pkey" PRIMARY KEY ("studentId","questionCode")
);

-- AddForeignKey
ALTER TABLE "ProfileAnswer" ADD CONSTRAINT "ProfileAnswer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "ReadingProfile"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;
