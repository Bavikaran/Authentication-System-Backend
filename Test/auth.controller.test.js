import request from 'supertest';  // For HTTP request simulation
import app from '../index.js';  // Assuming your Express app is in app.js
import { User } from '../models/user.model.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import CustomError from '../utils/customError.js';

// Mock the send emails to avoid sending actual emails during testing
jest.mock('../utils/emails.js', () => ({
  sendVerificationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendResetSuccessEmail: jest.fn(),
}));

describe('Auth Controller', () => {
  
  // Helper function to create a user in the database for testing
  const createUser = async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      userType: 'student',
    });
    await user.save();
    return user;
  };

  // Test for the signup function
  describe('POST /signup', () => {
    it('should create a new user and return success', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          userType: 'student',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.user.email).toBe('newuser@example.com');
      expect(res.body.user.password).toBeUndefined();  // Password should not be returned
    });

    it('should return validation errors if input is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalidemail',
          password: '',
          name: '',
          userType: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(4);  // There should be 4 validation errors
    });
  });

  // Test for the verifyEmail function
  describe('POST /verify-email', () => {
    it('should verify the email successfully', async () => {
      const user = await createUser();

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: user.verificationToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Email verified successfully');
    });

    it('should return an error if the verification code is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: 'invalidcode' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired verification code');
    });
  });

  // Test for the login function
  describe('POST /login', () => {
    it('should log in the user and return success', async () => {
      const user = await createUser();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged in successfully');
    });

    it('should return an error if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  // Test for the logout function
  describe('POST /logout', () => {
    it('should log out the user successfully', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  // Test for the forgotPassword function
  describe('POST /forgot-password', () => {
    it('should send a password reset link', async () => {
      const user = await createUser();

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: user.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password reset link sent to your email');
    });

    it('should return an error if the email is not found', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found with this email');
    });
  });

  // Test for the resetPassword function
  describe('PUT /reset-password/:token', () => {
    it('should reset the user password', async () => {
      const user = await createUser();
      const resetToken = user.resetPasswordToken;

      const res = await request(app)
        .put(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password reset successful');
    });

    it('should return an error if the token is invalid or expired', async () => {
      const res = await request(app)
        .put('/api/auth/reset-password/invalidtoken')
        .send({
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid or expired reset token');
    });
  });

  // Test for the checkAuth function
  describe('GET /check-auth', () => {
    it('should return user data if the user is authenticated', async () => {
      const user = await createUser();

      // Mock the JWT token generation for authentication
      const res = await request(app)
        .get('/api/auth/check-auth')
        .set('Cookie', [`token=${generateTokenAndSetCookie({}, user._id)}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(user.email);
    });

    it('should return an error if the user is not authenticated', async () => {
      const res = await request(app).get('/api/auth/check-auth');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized - no token provided');
    });
  });
});