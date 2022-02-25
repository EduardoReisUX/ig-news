import { render, screen } from "@testing-library/react";
import { ActiveLink } from ".";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/",
      };
    },
  };
});

describe("ActiveLink component", () => {
  render(
    <ActiveLink href="/" activeClassName="active">
      <a>Home</a>
    </ActiveLink>
  );

  const activeLinkComponent = screen.getByText("Home");

  it("should renders correctly", () => {
    expect(activeLinkComponent).toBeInTheDocument();
  });

  it("should receive 'active' className if it's active", () => {
    expect(activeLinkComponent).toHaveClass("active");
  });
});
