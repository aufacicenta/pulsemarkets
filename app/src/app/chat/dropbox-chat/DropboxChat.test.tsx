import { screen, render } from "tests";

import { DropboxChat } from "./DropboxChat";

describe("DropboxChat", () => {
  it("renders children correctly", () => {
    render(<DropboxChat>DropboxChat</DropboxChat>);

    const element = screen.getByText("DropboxChat");

    expect(element).toBeInTheDocument();
  });
});
