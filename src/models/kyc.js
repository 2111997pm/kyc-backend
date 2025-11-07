module.exports = (sequelize, DataTypes) => {
  const Kyc = sequelize.define(
    "Kyc",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED, // must be UNSIGNED too
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      documentType: { type: DataTypes.STRING, allowNull: false },
      documentNumber: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "kyc",
    }
  );

  Kyc.associate = (models) => {
    Kyc.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
  };

  return Kyc;
};
