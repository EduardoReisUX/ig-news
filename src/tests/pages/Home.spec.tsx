import { render, screen } from "@testing-library/react";
import { stripe } from "../../services/stripe";
import Home, { getStaticProps } from "../../pages";
import { mocked } from "jest-mock";

jest.mock("next-auth/react", () => {
  return {
    useSession() {
      return [null, false];
    },
  };
});

jest.mock("../../services/stripe");

describe("Home page", () => {
  render(<Home product={{ amount: 15, priceId: "abc" }} />);
  const homepage = screen.getByText(/15/);

  it("should render correctly", () => {
    expect(homepage).toBeInTheDocument();
  });

  it("getStaticProps should load initial data", async () => {
    const retrievePricesStripeMocked = mocked(stripe.prices.retrieve);

    retrievePricesStripeMocked.mockResolvedValueOnce({
      id: "fake-price-id",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: "fake-price-id",
            amount: "$10.00",
          },
        },
      })
    );
  });
});
