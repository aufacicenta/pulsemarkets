import { screen, render } from "tests";

import { ShareModal } from "./ShareModal";

describe("ShareModal", () => {
  it("renders children correctly", () => {
    render(<ShareModal>ShareModal</ShareModal>);

    const element = screen.getByText("ShareModal");

    expect(element).toBeInTheDocument();
  });
});
