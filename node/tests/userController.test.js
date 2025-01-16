import  {updateUser}  from '../controllers/user.controller.js';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';

jest.mock('bcryptjs');
jest.mock('../models/user.model.js');

describe('updateUser', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: '123' },
      body: {
        username: 'newUsername',
        password: 'newPassword123',
      },
      params: { userId: '123' },
    };

    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should update the user successfully', async () => {
    const hashedPassword = 'hashedPassword123';
    bcryptjs.hashSync.mockReturnValue(hashedPassword);
    User.findByIdAndUpdate.mockResolvedValue({
      ...req.body,
      password: hashedPassword,
    });

    await updateUser(req, res, next);

    expect(bcryptjs.hashSync).toHaveBeenCalledWith(req.body.password, 10);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.userId,
      expect.objectContaining({ password: hashedPassword }),
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ password: hashedPassword }));
  });

  it('should handle errors and call next()', async () => {
    User.findByIdAndUpdate.mockRejectedValue(new Error('Error updating user'));

    await updateUser(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error updating user' }));
  });
});