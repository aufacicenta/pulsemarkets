const DataTypes = require("sequelize").DataTypes;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("content_extractions", {
      id: {
        type: DataTypes.UUID,
        field: "id",
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
      },
      fileName: {
        type: DataTypes.STRING,
        field: "file_name",
        allowNull: false,
        unique: true,
      },
      content: {
        type: DataTypes.TEXT,
        field: "content",
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("content_extractions");
  },
};
