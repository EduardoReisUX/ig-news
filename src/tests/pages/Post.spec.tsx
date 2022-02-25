import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { getSession } from "next-auth/react";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "test-slug",
  title: "test-title",
  content: "<p>test-content</p>",
  updatedAt: "test-updatedAt",
};

jest.mock("next-auth/react");
jest.mock("../../services/prismic");

describe("Post/[slug] page", () => {
  render(<Post post={post} />);

  it("should render with preset props", () => {
    const title = screen.getByText(post.title);
    const slug = screen.queryByText(post.slug);
    const content = screen.getByText("test-content");
    const updatedAt = screen.getByText(post.updatedAt);

    expect(title).toBeInTheDocument();
    expect(slug).not.toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(updatedAt).toBeInTheDocument();
  });

  it("should redirect user if no subscription is found", async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      user: { name: "John Doe", email: "john@example.com" },
      activeSubscription: false,
      expires: "test-expires",
    });

    const response = await getServerSideProps({
      params: {
        slug: "test-slug",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("should get data from PrismicCMS with getServerSideProps", async () => {
    const getSessionMocked = mocked(getSession);

    const prismicClientMocked = mocked(getPrismicClient);

    prismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        uid: "my-new-post",
        data: {
          title: [{ type: "heading", text: "My new post" }],
          content: [{ type: "paragraph", text: "Post content" }],
        },
        last_publication_date: "04-02-2022",
      }),
    } as any);

    getSessionMocked.mockResolvedValueOnce({
      user: { name: "John Doe", email: "john@example.com" },
      activeSubscription: true,
      expires: "test-expires",
    });

    const response = await getServerSideProps({
      params: {
        slug: "test-slug",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "test-slug",
            title: "My new post",
            content: "<p>Post content</p>",
            updatedAt: "02 de abril de 2022",
          },
        },
      })
    );
  });
});
