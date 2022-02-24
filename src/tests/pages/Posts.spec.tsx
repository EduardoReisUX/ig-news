import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

const allPosts = [
  {
    title: "a",
    excerpt: "b",
    slug: "c",
    updatedAt: "22/10",
  },
  {
    title: "b",
    excerpt: "c",
    slug: "d",
    updatedAt: "23/10",
  },
];

jest.mock("../../services/prismic");

describe("a", () => {
  const { debug } = render(<Posts posts={allPosts} />);
  const PostsPage = screen.getByText("a");

  it("should render", () => {
    expect(PostsPage).toBeInTheDocument();
  });

  it("should get data from prismic CMS", async () => {
    const prismicClientMocked = mocked(getPrismicClient);

    prismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-new-post",
            data: {
              title: [{ type: "heading", text: "My new post" }],
              content: [{ type: "paragraph", text: "Post excerpt" }],
            },
            last_publication_date: "04-02-2022",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-new-post",
              title: "My new post",
              excerpt: "Post excerpt",
              updatedAt: "02 de abril de 2022",
            },
          ],
        },
      })
    );
  });
});
