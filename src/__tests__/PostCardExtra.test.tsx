import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PostCard from "@/features/posts/components/PostCard";
import type { Post } from "@/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const base = {
  id: 1,
  user_id: 7,
  title: "Judul",
  content: "Isi",
  cover: "30_1.jpeg",
  created_at: "2026-10-03T10:00:00Z",
  user: { name: "Dimas" },
} as unknown as Post;

describe("PostCard (tambahan)", () => {
  it("pemilik bisa edit dan hapus", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<PostCard post={base} currentUserId={7} onEdit={onEdit} onDelete={onDelete} priority />);
    fireEvent.click(screen.getByLabelText("Edit postingan Judul"));
    fireEvent.click(screen.getByLabelText("Hapus postingan Judul"));
    expect(onEdit).toHaveBeenCalledWith(base);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("bukan pemilik tidak melihat tombol", () => {
    render(<PostCard post={base} currentUserId={99} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByLabelText("Edit postingan Judul")).toBeNull();
  });

  it("pemilik tanpa handler tidak menampilkan tombol", () => {
    render(<PostCard post={base} currentUserId={7} />);
    expect(screen.queryByLabelText("Edit postingan Judul")).toBeNull();
    expect(screen.queryByLabelText("Hapus postingan Judul")).toBeNull();
  });

  it("menyembunyikan gambar jika gagal dimuat", () => {
    render(<PostCard post={base} />);
    const img = screen.getByAltText("Judul");
    fireEvent.error(img);
    expect(screen.queryByAltText("Judul")).toBeNull();
  });

  it("fallback judul, penulis, dan tanggal tidak valid", () => {
    const post = { ...base, title: "  ", cover: null, user: undefined, created_at: "bukan-tanggal" } as unknown as Post;
    render(<PostCard post={post} />);
    expect(screen.getAllByText("Postingan #1").length).toBeGreaterThan(0);
    expect(screen.getByText("Oleh: Pengguna Anonim")).not.toBeNull();
  });

  it("tanpa created_at", () => {
    const post = { ...base, created_at: "" } as unknown as Post;
    render(<PostCard post={post} />);
    expect(screen.getByText("Judul")).not.toBeNull();
  });
});