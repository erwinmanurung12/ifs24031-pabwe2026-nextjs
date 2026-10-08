import { describe, it, expect } from "vitest";
import { store } from "@/store";
import { logout } from "@/features/auth/states/authSlice";
import { setUsers } from "@/features/users/states/userSlice";

describe("store", () => {
  it("mendaftarkan slice auth, posts, dan users", () => {
    const state = store.getState();
    expect(Object.keys(state).sort()).toEqual(["auth", "posts", "users"]);
    expect(state.posts.isLoading).toBe(true);
    expect(state.auth.token).toBeNull();
    expect(state.users.users).toEqual([]);
  });

  it("meneruskan action ke reducer yang tepat", () => {
    store.dispatch(setUsers([{ id: 1, name: "D", email: "d@test.com" }]));
    expect(store.getState().users.users).toHaveLength(1);

    store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
  });
});