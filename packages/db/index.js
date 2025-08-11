const { PrismaClient } = require('./generated/prisma');

const globalForPrisma = globalThis;

const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Export as both db and prisma for compatibility
const prisma = db;

module.exports = {
  db,
  prisma,
  PrismaClient,
};

// Also support ES6 imports
module.exports.default = db;
