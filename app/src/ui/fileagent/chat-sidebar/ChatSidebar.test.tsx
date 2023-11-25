import { screen, render } from "tests";

import { ChatSidebar } from "./ChatSidebar";

describe("ChatSidebar", () => {
  it("renders children correctly", () => {
    render(<ChatSidebar>ChatSidebar</ChatSidebar>);

    const element = screen.getByText("ChatSidebar");

    expect(element).toBeInTheDocument();
  });
});
