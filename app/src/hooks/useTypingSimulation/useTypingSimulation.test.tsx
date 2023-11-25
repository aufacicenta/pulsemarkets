import { renderHook } from "tests";

import { useTypingSimulation } from "./useTypingSimulation";

describe("useTypingSimulation", () => {
  it("returns a value", async () => {
    const { result } = renderHook(() => useTypingSimulation());

    expect(result.current).toEqual("1");
  });
});
