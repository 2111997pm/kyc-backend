const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: { underscored: false, timestamps: true }
  }
);

// Models
const User = require('./user')(sequelize, DataTypes);
const Kyc = require('./kyc')(sequelize, DataTypes);
const Document = require('./document')(sequelize, DataTypes);

// Relations
User.hasMany(Kyc, { foreignKey: 'userId', as: 'kycRecords' });
Kyc.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Kyc.hasMany(Document, { foreignKey: 'kycId', as: 'documents' });
Document.belongsTo(Kyc, { foreignKey: 'kycId', as: 'kyc' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Kyc,
  Document
};
