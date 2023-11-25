import type { Sequelize, Model } from "sequelize";
import { ContentExtraction } from "./ContentExtraction";

export { ContentExtraction };

export function initModels(sequelize: Sequelize) {
  ContentExtraction.initModel(sequelize);

  return {
    ContentExtraction,
  };
}
