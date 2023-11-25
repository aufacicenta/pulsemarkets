"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("content_extractions", "bucket_name", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "default",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("content_extractions", "bucket_name");
  },
};
