/**
 * End-to-end tests for the main student flow.
 * Verifies authentication, reading profile access and recommendations.
 * Login -> Get accesstoken -> Get reading profile -> Get recommendations
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

describe('Student flow (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  // Use an existing seeded student account.
  const studentCredentials = {
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    // Keep validation behavior equal to the real application.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {await app.close(); });

  it('logs in as a student and returns a JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(studentCredentials)
      .expect(200);

    expect(response.body.accessToken).toEqual(expect.any(String));

    expect(response.body.user.role).toBe('student');

    accessToken = response.body.accessToken;
  });

  it('returns the reading profile for the authenticated student', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/reading-profile')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    expect(response.body).toHaveProperty('studentId');

    expect(response.body).toHaveProperty('languageLevelCode');

    expect(response.body).toHaveProperty('preferredLengthCode');

    expect(response.body).toHaveProperty('answers');
  });

  it('returns recommendations for the authenticated student', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/recommendations')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    expect(
      Array.isArray(
        response.body.recommendations,
      ),
    ).toBe(true);

    expect(
      response.body.recommendations.length,
    ).toBeGreaterThanOrEqual(3);
  });
});