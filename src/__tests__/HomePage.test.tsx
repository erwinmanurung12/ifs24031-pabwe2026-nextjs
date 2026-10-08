import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "@/features/posts/pages/HomePage";
import { fetchPosts, deletePost } from "@/features/posts/states/postSlice";

const { dispatch, mockState } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  mockState: { current: {} as any },
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: any) => selector(mockState.current),
}));

vi.mock("@/features/posts/states/postSlice", () => ({
  fetchPosts: vi.fn(() => ({ type: "posts/fetchPosts" })),
  deletePost: vi.fn((id: string | number) => ({ type: "posts/deletePost", payload: id })),
}));

vi.mock("@/components/ui/LoadingSkeleton", () => ({
  default: ({ count }: { count: number }) => <div data-testid="skeleton">{count}</div>,
}));

vi.mock("@/features/posts/components/PostCard", () => ({
  default: ({ post, priority, currentUserId, onEdit, onDelete }: any) => (
    <div data-testid="post-card" data-priority={String(priority)} data-user={currentUserId}>
      <span>{post.title}</span>
      <button onClick={() => onEdit(post)}>edit-{post.id}</button>
      <button onClick={() => onDelete(post.id)}>delete-{post.id}</button>
    </div>
  ),
}));

vi.mock("@/features/posts/components/CreatePostModal", () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={onClose}>close-create</button>
      </div>
    ) : null,
}));

vi.mock("@/features/posts/components/EditPostModal", () => ({
  default: ({ isOpen, onClose, post }: any) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <span>editing-{post?.title}</span>
        <button onClick={onClose}>close-edit</button>
      </div>
    ) : null,
}));

const posts = [
  { id: 1, title: "Post Satu" },
  { id: 2, title: "Post Dua" },
  { id: 3, title: "Post Tiga" },
];

const setState = (overrides: any = {}) => {
  mockState.current = {
    posts: { posts: [], isLoading: false, error: null, ...overrides.posts },
    auth: { user: { id: 7 }, token: "abc", ...overrides.auth },
  };
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setState();
  });

  it("memanggil fetchPosts saat token ada", () => {
    render(<HomePage />);
    expect(fetchPosts).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "posts/fetchPosts" });
  });

  it("tidak memanggil fetchPosts saat token kosong", () => {
    setState({ auth: { token: null } });
    render(<HomePage />);
    expect(fetchPosts).not.toHaveBeenCalled();
  });

  it("menampilkan skeleton saat loading", () => {
    setState({ posts: { isLoading: true } });
    render(<HomePage />);
    expect(screen.getByTestId("skeleton")).toHaveTextContent("3");
  });

  it("menampilkan error saat gagal dan belum ada post", () => {
    setState({ posts: { error: "Gagal memuat" } });
    render(<HomePage />);
    expect(screen.getByRole("alert")).toHaveTextContent("Gagal memuat");
  });

  it("menampilkan pesan kosong saat tidak ada post", () => {
    render(<HomePage />);
    expect(screen.getByText(/Belum ada postingan/i)).toBeInTheDocument();
  });

  it("menampilkan daftar post dengan priority untuk 2 item pertama", () => {
    setState({ posts: { posts } });
    render(<HomePage />);
    const cards = screen.getAllByTestId("post-card");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute("data-priority", "true");
    expect(cards[1]).toHaveAttribute("data-priority", "true");
    expect(cards[2]).toHaveAttribute("data-priority", "false");
    expect(cards[0]).toHaveAttribute("data-user", "7");
  });

  it("tetap menampilkan post jika error ada tetapi post sudah terisi", () => {
    setState({ posts: { posts, error: "error lama" } });
    render(<HomePage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("post-card")).toHaveLength(3);
  });

  it("membuka dan menutup modal buat post", () => {
    render(<HomePage />);
    expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Buat Post/i }));
    expect(screen.getByTestId("create-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("close-create"));
    expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
  });

  it("membuka dan menutup modal edit post", () => {
    setState({ posts: { posts } });
    render(<HomePage />);
    fireEvent.click(screen.getByText("edit-2"));
    expect(screen.getByText("editing-Post Dua")).toBeInTheDocument();
    fireEvent.click(screen.getByText("close-edit"));
    expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
  });

  it("menghapus post saat konfirmasi disetujui", () => {
    setState({ posts: { posts } });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<HomePage />);
    fireEvent.click(screen.getByText("delete-1"));
    expect(deletePost).toHaveBeenCalledWith(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "posts/deletePost", payload: 1 });
  });

  it("tidak menghapus post saat konfirmasi dibatalkan", () => {
    setState({ posts: { posts } });
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<HomePage />);
    fireEvent.click(screen.getByText("delete-1"));
    expect(deletePost).not.toHaveBeenCalled();
  });
});