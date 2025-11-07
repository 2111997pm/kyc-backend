module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    kycId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, {
    tableName: 'documents'
  });

  return Document;
};
