// Portfolio model schema and validation
class Portfolio {
  constructor(data) {
    this.userId = data.userId;
    this.name = data.name;
    this.description = data.description || '';
    this.totalValue = data.totalValue || 0;
    this.initialInvestment = data.initialInvestment || 0;
    this.currency = data.currency || 'USD';
    this.riskProfile = data.riskProfile || 'moderate'; // conservative, moderate, aggressive
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data) {
    const errors = [];
    
    if (!data.userId || typeof data.userId !== 'string') {
      errors.push('User ID is required');
    }
    
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Portfolio name is required');
    }
    
    if (data.totalValue !== undefined && (typeof data.totalValue !== 'number' || data.totalValue < 0)) {
      errors.push('Total value must be a non-negative number');
    }
    
    if (data.initialInvestment !== undefined && (typeof data.initialInvestment !== 'number' || data.initialInvestment < 0)) {
      errors.push('Initial investment must be a non-negative number');
    }
    
    if (data.riskProfile && !['conservative', 'moderate', 'aggressive'].includes(data.riskProfile)) {
      errors.push('Invalid risk profile');
    }
    
    return errors;
  }
}

module.exports = Portfolio;
