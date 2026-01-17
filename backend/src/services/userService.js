const JsonDb = require('../utils/jsonDb');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = new JsonDb('users');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class UserService {
  // Register a new user
  async register(userData) {
    const errors = User.validate(userData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await db.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user (ensure isActive is set, exclude password from userData)
    const { password, ...userDataWithoutPassword } = userData;
    const user = await db.create({
      ...userDataWithoutPassword,
      password: hashedPassword,
      isActive: userData.isActive !== undefined ? userData.isActive : true
    });

    const userObj = new User(user);
    userObj.id = user.id;
    return userObj.toPublic();
  }

  // Login user
  async login(email, password) {
    const user = await db.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: (() => {
        const userObj = new User(user);
        userObj.id = user.id;
        return userObj.toPublic();
      })()
    };
  }

  // Get all users
  async getAllUsers(filter = {}) {
    const users = await db.findAll(filter);
    return users.map(user => {
      const userObj = new User(user);
      userObj.id = user.id;
      return userObj.toPublic();
    });
  }

  // Get user by ID
  async getUserById(id) {
    const user = await db.findById(id);
    if (!user) {
      return null;
    }
    const userObj = new User(user);
    userObj.id = user.id;
    return userObj.toPublic();
  }

  // Update user
  async updateUser(id, updates) {
    const user = await db.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await db.updateById(id, updates);
    const userObj = new User(updatedUser);
    userObj.id = updatedUser.id;
    return userObj.toPublic();
  }

  // Delete user
  async deleteUser(id) {
    const user = await db.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await db.deleteById(id);
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new UserService();
