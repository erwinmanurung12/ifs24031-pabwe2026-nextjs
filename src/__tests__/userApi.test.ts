import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

import { fetchApi } from "@/helpers/apiHelper";
import {
  getUserProfile,
  getUsers,
  updateProfile,
  updatePassword,
} from "@/features/users/api/userApi";

beforeEach(() => {
  vi.mocked(fetchApi).mockReset();
  vi.mocked(fetchApi).mockResolvedValue({ ok: true });
});

describe("userApi", () => {
  it("getUserProfile memanggil /users/me", async () => {
    await getUserProfile();
    expect(fetchApi).toHaveBeenCalledWith("/users/me");
  });

  it("getUsers memanggil /users", async () => {
    await getUsers();
    expect(fetchApi).toHaveBeenCalledWith("/users");
  });

  it("updateProfile mengirim PATCH dengan body JSON", async () => {
    await updateProfile({ name: "Dimas", bio: "halo" });
    expect(fetchApi).toHaveBeenCalledWith("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name: "Dimas", bio: "halo" }),
    });
  });

  it("updatePassword mengirim PATCH ke /users/password", async () => {
    await updatePassword({ old_password: "lama", new_password: "baru" });
    expect(fetchApi).toHaveBeenCalledWith("/users/password", {
      method: "PATCH",
      body: JSON.stringify({ old_password: "lama", new_password: "baru" }),
    });
  });
});