import { screen, render } from "tests";

import { Dropzone } from "./Dropzone";

describe("Dropzone", () => {
  it("renders children correctly", () => {
    render(<Dropzone>Dropzone</Dropzone>);

    const element = screen.getByText("Dropzone");

    expect(element).toBeInTheDocument();
  });
});
