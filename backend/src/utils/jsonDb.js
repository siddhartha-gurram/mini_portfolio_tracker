const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Get file path for a collection
function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

// Read data from JSON file
async function readData(collection) {
  await ensureDataDir();
  const filePath = getFilePath(collection);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      await fs.writeFile(filePath, JSON.stringify([], null, 2));
      return [];
    }
    throw error;
  }
}

// Write data to JSON file
async function writeData(collection, data) {
  await ensureDataDir();
  const filePath = getFilePath(collection);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// CRUD operations
class JsonDb {
  constructor(collection) {
    this.collection = collection;
  }

  // Create - Add a new document
  async create(document) {
    const data = await readData(this.collection);
    const newDoc = {
      id: generateId(),
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newDoc);
    await writeData(this.collection, data);
    return newDoc;
  }

  // Read all documents
  async findAll(filter = {}) {
    const data = await readData(this.collection);
    if (Object.keys(filter).length === 0) {
      return data;
    }
    return data.filter(doc => {
      return Object.keys(filter).every(key => {
        if (Array.isArray(filter[key])) {
          return filter[key].includes(doc[key]);
        }
        return doc[key] === filter[key];
      });
    });
  }

  // Read one document by ID
  async findById(id) {
    const data = await readData(this.collection);
    return data.find(doc => doc.id === id) || null;
  }

  // Read one document by filter
  async findOne(filter) {
    const data = await readData(this.collection);
    return data.find(doc => {
      return Object.keys(filter).every(key => doc[key] === filter[key]);
    }) || null;
  }

  // Update a document
  async updateById(id, updates) {
    const data = await readData(this.collection);
    const index = data.findIndex(doc => doc.id === id);
    if (index === -1) {
      return null;
    }
    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeData(this.collection, data);
    return data[index];
  }

  // Delete a document
  async deleteById(id) {
    const data = await readData(this.collection);
    const index = data.findIndex(doc => doc.id === id);
    if (index === -1) {
      return false;
    }
    data.splice(index, 1);
    await writeData(this.collection, data);
    return true;
  }

  // Delete all documents matching filter
  async deleteMany(filter) {
    const data = await readData(this.collection);
    const initialLength = data.length;
    const filtered = data.filter(doc => {
      return !Object.keys(filter).every(key => doc[key] === filter[key]);
    });
    await writeData(this.collection, filtered);
    return initialLength - filtered.length;
  }

  // Count documents
  async count(filter = {}) {
    const data = await this.findAll(filter);
    return data.length;
  }
}

module.exports = JsonDb;
