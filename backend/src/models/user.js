// User model schema and validation
class User {
  constructor(data) {
    this.email = data.email;
    this.password = data.password; // Will be hashed
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role || 'investor'; // investor, admin, analyst
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data) {
    const errors = [];
    
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
      errors.push('Valid email is required');
    }
    
    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!data.firstName || typeof data.firstName !== 'string') {
      errors.push('First name is required');
    }
    
    if (!data.lastName || typeof data.lastName !== 'string') {
      errors.push('Last name is required');
    }
    
    if (data.role && !['investor', 'admin', 'analyst'].includes(data.role)) {
      errors.push('Invalid role');
    }
    
    return errors;
  }

  toPublic() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
