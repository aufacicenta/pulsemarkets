import { screen, render } from "tests";

import { MessageTextType } from "./MessageTextType";

describe("MessageTextType", () => {
  it("renders children correctly", () => {
    render(<MessageTextType>MessageTextType</MessageTextType>);

    const element = screen.getByText("MessageTextType");

    expect(element).toBeInTheDocument();
  });
});
