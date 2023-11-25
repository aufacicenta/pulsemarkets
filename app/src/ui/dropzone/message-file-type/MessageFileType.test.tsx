import { screen, render } from "tests";

import { MessageFileType } from "./MessageFileType";

describe("MessageFileType", () => {
  it("renders children correctly", () => {
    render(<MessageFileType>MessageFileType</MessageFileType>);

    const element = screen.getByText("MessageFileType");

    expect(element).toBeInTheDocument();
  });
});
