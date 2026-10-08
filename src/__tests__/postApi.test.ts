import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

import { fetchApi } from "@/helpers/apiHelper";
import { postApi } from "@/features/posts/api/postApi";

beforeEach(() => {
  vi.mocked(fetchApi).mockReset();
});

describe("postApi", () => {
  it("getAll dan getById", () => {
    postApi.getAll();
    postApi.getById(5);
    expect(fetchApi).toHaveBeenNthCalledWith(1, "/posts");
    expect(fetchApi).toHaveBeenNthCalledWith(2, "/posts/5");
  });

  it("create mengirim POST dengan body JSON", () => {
    postApi.create({ title: "t", content: "c" });
    expect(fetchApi).toHaveBeenCalledWith("/posts", {
      method: "POST",
      body: JSON.stringify({ title: "t", content: "c" }),
    });
  });

  it("update, delete, dan updateCover memakai method yang benar", () => {
    postApi.update(1, { title: "t", content: "c" });
    postApi.delete(1);
    postApi.updateCover(1, "x.jpg");
    expect(fetchApi).toHaveBeenNthCalledWith(1, "/posts/1", {
      method: "PUT",
      body: JSON.stringify({ title: "t", content: "c" }),
    });
    expect(fetchApi).toHaveBeenNthCalledWith(2, "/posts/1", { method: "DELETE" });
    expect(fetchApi).toHaveBeenNthCalledWith(3, "/posts/1/cover", {
      method: "PATCH",
      body: JSON.stringify({ cover: "x.jpg" }),
    });
  });
});