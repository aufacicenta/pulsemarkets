import { initModels } from "@aufacicenta/fileagent-db/models";

const load = async () => {
  const module = await import("@aufacicenta/fileagent-db/db");

  return initModels(module.default);
};

export default {
  load,
};
