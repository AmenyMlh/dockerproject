import request from 'supertest';
import app from '../index';  // Assuming app is exported from your main server file
import User from '../models/user.model';
import Post from '../models/post.model';
import jwt from 'jsonwebtoken';

let userToken;
let postId;

describe('POST /create (comment)', () => {
  // Create user and post before all tests
  beforeAll(async () => {
    // Create a new user
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123', // Hash the password as needed in the model
    });
    await user.save();

    // Generate a JWT token for the user
    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a post
    const post = new Post({
      title: 'Test Post',
      content: 'This is a test post content.',
      userId: user._id,
    });
    const savedPost = await post.save();
    postId = savedPost._id;
  });

  it('should create a comment successfully', async () => {
    const res = await request(app)
      .post('/create')
      .send({ content: 'Great post!', postId, userId: '1' })
      .set('Authorization', `Bearer ${userToken}`);  // Pass the JWT token in the Authorization header

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Great post!');
  });

  it('should return error if user is not authorized', async () => {
    const res = await request(app)
      .post('/create')
      .send({ content: 'Great post!', postId, userId: '1' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You are not allowed to create this comment');
  });

  // Clean up after all tests
  afterAll(async () => {
    // Delete the created post and user to keep the database clean
    await Post.findByIdAndDelete(postId);
    await User.findOneAndDelete({ email: 'testuser@example.com' });
  });
});
