import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/helpers/apiHelper", () => ({
  setToken: vi.fn(),
  removeToken: vi.fn(),
}));

import { setToken, removeToken } from "@/helpers/apiHelper";
import reducer, {
  setUser,
  setUsers,
  logout,
  setTokenState,
} from "@/features/users/states/userSlice";

const user = { id: 1, name: "Dimas", email: "d@test.com" };

beforeEach(() => {
  vi.mocked(setToken).mockReset();
  vi.mocked(removeToken).mockReset();
});

describe("userSlice", () => {
  it("state awal", () => {
    expect(reducer(undefined, { type: "init" })).toEqual({
      user: null,
      users: [],
      token: null,
      loading: false,
      isLoading: false,
      error: null,
    });
  });

  it("setUser mengisi dan mengosongkan user", () => {
    let state = reducer(undefined, setUser(user));
    expect(state.user).toEqual(user);
    state = reducer(state, setUser(null));
    expect(state.user).toBeNull();
  });

  it("setUsers mengisi daftar user", () => {
    const state = reducer(undefined, setUsers([user]));
    expect(state.users).toEqual([user]);
  });

  it("setTokenState menyimpan token ke state dan storage", () => {
    const state = reducer(undefined, setTokenState("abc"));
    expect(state.token).toBe("abc");
    expect(setToken).toHaveBeenCalledWith("abc");
  });

  it("logout mengosongkan user dan token serta menghapus token", () => {
    const start = reducer(reducer(undefined, setUser(user)), setTokenState("abc"));
    const state = reducer(start, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(removeToken).toHaveBeenCalledTimes(1);
  });
});