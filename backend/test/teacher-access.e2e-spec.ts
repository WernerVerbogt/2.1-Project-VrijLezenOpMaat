/**
 * End-to-end tests for teacher access to linked students.
 * Verifies that a teacher can access linked students
 * and cannot access students without an active link.
 * 
 * Teacher logs in -> gets JWT -> opens linked student -> 200 OK -> opens not-linked student -> 403 Forbidden
 */

import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import dotenv from 'dotenv';

import { AppModule } from '../src/app.module';

dotenv.config({
  path: '.env.test',
});

describe('Teacher access (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  const teacherCredentials = {
    email: process.env.E2E_TEACHER_EMAIL!,
    password: process.env.E2E_TEACHER_PASSWORD!,
  };

  const linkedStudentId =
    process.env.E2E_LINKED_STUDENT_ID!;

  const unlinkedStudentId =
    process.env.E2E_UNLINKED_STUDENT_ID!;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Log in once and reuse the teacher JWT.
    const loginResponse = await request(
      app.getHttpServer(),
    )
      .post('/auth/login')
      .send(teacherCredentials)
      .expect(200);

    accessToken =
      loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows a teacher to access a linked student', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get(
        `/teacher-student-links/students/${linkedStudentId}`,
      )
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    expect(response.body).toHaveProperty(
      'id',
      linkedStudentId,
    );

    expect(response.body).toHaveProperty(
      'readingList',
    );
  });

  it('denies access to an unlinked student', async () => {
    await request(
      app.getHttpServer(),
    )
      .get(
        `/teacher-student-links/students/${unlinkedStudentId}`,
      )
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(403);
  });
});