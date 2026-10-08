import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

import { fetchApi } from "@/helpers/apiHelper";
import { authApi } from "@/features/auth/api/authApi";

beforeEach(() => {
  vi.mocked(fetchApi).mockReset();
});

describe("authApi", () => {
  it("login mengirim POST ke /auth/login", () => {
    authApi.login({ email: "a@b.c", password: "x" });
    expect(fetchApi).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.c", password: "x" }),
    });
  });

  it("register mengirim POST ke /auth/register", () => {
    authApi.register({ name: "D", email: "a@b.c", password: "x" });
    expect(fetchApi).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "D", email: "a@b.c", password: "x" }),
    });
  });

  it("getMe dan getMeLegacy memanggil endpoint yang benar", () => {
    authApi.getMe();
    authApi.getMeLegacy();
    expect(fetchApi).toHaveBeenNthCalledWith(1, "/users/me");
    expect(fetchApi).toHaveBeenNthCalledWith(2, "/auth/me");
  });
});