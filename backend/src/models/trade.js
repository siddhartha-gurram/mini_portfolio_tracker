// Trade model schema and validation
class Trade {
  constructor(data) {
    this.portfolioId = data.portfolioId;
    this.assetId = data.assetId;
    this.type = data.type; // buy, sell
    this.quantity = data.quantity;
    this.price = data.price;
    this.totalAmount = data.totalAmount || (data.quantity * data.price);
    this.status = data.status || 'pending'; // pending, executed, failed, cancelled
    this.executedAt = data.executedAt || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data) {
    const errors = [];
    
    if (!data.portfolioId || typeof data.portfolioId !== 'string') {
      errors.push('Portfolio ID is required');
    }
    
    if (!data.assetId || typeof data.assetId !== 'string') {
      errors.push('Asset ID is required');
    }
    
    if (!data.type || !['buy', 'sell'].includes(data.type)) {
      errors.push('Trade type must be buy or sell');
    }
    
    if (!data.quantity || typeof data.quantity !== 'number' || data.quantity <= 0) {
      errors.push('Quantity must be a positive number');
    }
    
    if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Price must be a positive number');
    }
    
    if (data.status && !['pending', 'executed', 'failed', 'cancelled'].includes(data.status)) {
      errors.push('Invalid trade status');
    }
    
    return errors;
  }
}

module.exports = Trade;
