import { render, screen, fireEvent } from "@testing-library/react";
import { mocked } from "jest-mock";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { SubscribeButton } from ".";

jest.mock("next-auth/react");
jest.mock("next/router");

describe("SubscribeButton Component", () => {
  const useSessionMocked = mocked(useSession);

  it("should have 'Subscribe now' text", () => {
    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });
    render(<SubscribeButton />);
    const subscribeButton = screen.getByText(/Subscribe now/);

    expect(subscribeButton).toBeInTheDocument();
  });

  it("should redirect user to sign in when not authenticated", () => {
    const signInMocked = mocked(signIn);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    render(<SubscribeButton />);
    const subscribeButton = screen.getByText(/Subscribe now/);

    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it("should redirect to posts when user has a subscription", () => {
    const useRouterMocked = mocked(useRouter);
    const useSessionMocked = mocked(useSession);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: { name: "John Doe", email: "john@example.com" },
        expires: "fake-expires",
        activeSubscription: "fake-active",
      },
      status: "authenticated",
    });

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<SubscribeButton />);
    const subscribeButton = screen.getByText(/Subscribe now/);

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith("/posts");
  });
});
