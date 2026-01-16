// Asset model schema and validation
class Asset {
  constructor(data) {
    this.symbol = data.symbol;
    this.name = data.name;
    this.type = data.type; // stock, etf, bond, crypto, mutual_fund
    this.currency = data.currency || 'USD';
    this.currentPrice = data.currentPrice || 0;
    this.priceHistory = data.priceHistory || [];
    this.marketCap = data.marketCap || null;
    this.sector = data.sector || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data) {
    const errors = [];
    
    if (!data.symbol || typeof data.symbol !== 'string') {
      errors.push('Asset symbol is required');
    }
    
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Asset name is required');
    }
    
    if (!data.type || !['stock', 'etf', 'bond', 'crypto', 'mutual_fund'].includes(data.type)) {
      errors.push('Valid asset type is required');
    }
    
    if (data.currentPrice !== undefined && (typeof data.currentPrice !== 'number' || data.currentPrice < 0)) {
      errors.push('Current price must be a non-negative number');
    }
    
    return errors;
  }
}

module.exports = Asset;
