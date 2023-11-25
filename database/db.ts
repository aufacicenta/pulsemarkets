import { Sequelize, Options } from "sequelize";
import configs from "./config/config.js";
import pg from "pg";

const env = process.env.NODE_ENV || "development";
const config = (configs as { [key: string]: Options })[env];

const db: Sequelize = new Sequelize({
  ...config,
  dialectModule: pg,
  define: {
    underscored: true,
  },
});

export default db;
