/* eslint-disable no-param-reassign */
import { useLayoutEffect, useState } from "react";

export const useTypingSimulation = (content: string | null, enabled: boolean = true, selector: string) => {
  const [simulationEnded, setSimulationEnded] = useState(false);

  const simulateTyping = (words: string[], index: number, element: Element): void => {
    if (index === words.length) {
      setSimulationEnded(true);

      return;
    }

    const word = words[index];

    setTimeout(() => {
      element.textContent += `${word} `;

      simulateTyping(words, index + 1, element);
    }, Math.floor(Math.random() * (100 - 20 + 1) + 100));
  };

  useLayoutEffect(() => {
    if (!enabled || !content) return;

    const element = document.querySelector(selector);

    if (!element) return;

    element.textContent = "";
    setSimulationEnded(false);

    simulateTyping(content?.split(" ") || [], 0, element!);
  }, [content]);

  return {
    simulationEnded,
  };
};
