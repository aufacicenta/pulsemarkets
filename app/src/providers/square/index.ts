import { Client, Environment } from "square";

import getSquareAuthChoice from "./get-square-auth-choice";

const getClient = (accessToken: string = process.env.SQUARE_ACCESS_TOKEN as string) =>
  new Client({
    accessToken,
    environment: process.env.NODE_ENV === "production" ? Environment.Production : Environment.Sandbox,
  });

export default { getClient, getSquareAuthChoice };
