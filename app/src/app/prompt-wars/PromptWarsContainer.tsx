import dynamic from "next/dynamic";

import { PromptWarsContainerProps, PromptWarsProps } from "./PromptWars.types";

const PromptWars = dynamic<PromptWarsProps>(() => import("./PromptWars").then((mod) => mod.PromptWars), { ssr: false });

export const PromptWarsContainer = ({ marketId }: PromptWarsContainerProps) => <PromptWars marketId={marketId} />;
