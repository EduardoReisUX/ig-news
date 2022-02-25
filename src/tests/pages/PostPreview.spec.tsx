import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import PostPreview, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "test-slug",
  title: "test-title",
  content: "test-content",
  updatedAt: "test-updatedAt",
};

jest.mock("next-auth/react");
jest.mock("next/router");
jest.mock("../../services/prismic");

describe("Post Preview page", () => {
  it("should render with preset props", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      status: "unauthenticated",
      data: null,
    });

    render(<PostPreview post={post} />);

    const title = screen.getByText(post.title);
    const slug = screen.queryByText(post.slug);
    const content = screen.getByText("test-content");
    const updatedAt = screen.getByText(post.updatedAt);

    expect(title).toBeInTheDocument();
    expect(slug).not.toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(updatedAt).toBeInTheDocument();
  });

  it("should have 'Wanna continue reading?' text", () => {
    render(<PostPreview post={post} />);
    const text = screen.getByText("Wanna continue reading?");

    expect(text).toBeInTheDocument();
  });

  it("should redirects user to full post when user is subscribed", () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      status: "authenticated",
      data: {
        expires: "test-expires",
        activeSubscription: "test-active",
      },
    });

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<PostPreview post={post} />);

    expect(pushMock).toHaveBeenCalledWith(`/posts/${post.slug}`);
  });

  it("should get data from PrismicCMS with getServerSideProps", async () => {
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

    const response = await getStaticProps({ params: { slug: "test-slug" } });

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
