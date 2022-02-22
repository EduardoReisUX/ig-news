import { render, screen } from "@testing-library/react";
import { SignInButton } from ".";
import { mocked } from "jest-mock";

import { useSession } from "next-auth/react";

jest.mock("next-auth/react");

describe("SignInButton component", () => {
  const useSessionMocked = mocked(useSession);

  it("should have 'Sign in' text when user is not autheticated", () => {
    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    render(<SignInButton />);

    expect(screen.getByText("Sign in with Github")).toBeInTheDocument();
  });

  it("should appear user name when user is autheticated", () => {
    useSessionMocked.mockReturnValueOnce({
      data: {
        user: { name: "John Doe", email: "john@example.com" },
        expires: "fake-expires",
      },

      status: "authenticated",
    });

    render(<SignInButton />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
