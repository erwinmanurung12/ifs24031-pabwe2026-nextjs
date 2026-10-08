import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    getMeLegacy: vi.fn(),
  },
}));

import { authApi } from "@/features/auth/api/authApi";
import { ApiError } from "@/helpers/apiHelper";
import reducer, {
  loginUser,
  registerUser,
  fetchMe,
  hydrateAuth,
  logout,
  clearError,
} from "@/features/auth/states/authSlice";

const api = authApi as any;
const user = { id: 1, name: "Dimas", email: "d@test.com" };

function makeStore() {
  return configureStore({ reducer: { auth: reducer } });
}
const state = (s: any) => s.getState().auth;

beforeEach(() => {
  Object.values(api).forEach((fn: any) => fn.mockReset());
  localStorage.clear();
});

describe("loginUser", () => {
  it("berhasil: menyimpan token dan user", async () => {
    api.login.mockResolvedValue({ data: { token: "tok", user } });
    const store = makeStore();
    await store.dispatch(loginUser({ email: "a", password: "b" }) as any);
    expect(state(store).token).toBe("tok");
    expect(state(store).user).toEqual(user);
    expect(localStorage.getItem("token")).toBe("tok");
  });

  it("berhasil tanpa user: user menjadi null", async () => {
    api.login.mockResolvedValue({ data: { token: "tok" } });
    const store = makeStore();
    await store.dispatch(loginUser({}) as any);
    expect(state(store).user).toBeNull();
  });

  it("gagal bila respons tanpa token", async () => {
    api.login.mockResolvedValue({ data: {} });
    const store = makeStore();
    await store.dispatch(loginUser({}) as any);
    expect(state(store).error).toBe("Token tidak ditemukan pada respons server");
    expect(state(store).isLoading).toBe(false);
  });

  it("gagal bila API menolak", async () => {
    api.login.mockRejectedValue(new Error("salah password"));
    const store = makeStore();
    await store.dispatch(loginUser({}) as any);
    expect(state(store).error).toBe("salah password");
  });
});

describe("registerUser", () => {
  it("berhasil dengan token: langsung login", async () => {
    api.register.mockResolvedValue({ data: { token: "t2", user } });
    const store = makeStore();
    await store.dispatch(registerUser({}) as any);
    expect(state(store).token).toBe("t2");
    expect(state(store).user).toEqual(user);
    expect(localStorage.getItem("token")).toBe("t2");
  });

  it("berhasil tanpa token: state tidak berubah", async () => {
    api.register.mockResolvedValue({ data: {} });
    const store = makeStore();
    await store.dispatch(registerUser({}) as any);
    expect(state(store).token).toBeNull();
    expect(state(store).user).toBeNull();
    expect(state(store).isLoading).toBe(false);
  });

  it("gagal menyimpan pesan error", async () => {
    api.register.mockRejectedValue(new Error("email dipakai"));
    const store = makeStore();
    await store.dispatch(registerUser({}) as any);
    expect(state(store).error).toBe("email dipakai");
  });
});

describe("fetchMe", () => {
  it("berhasil mengisi user", async () => {
    api.getMe.mockResolvedValue({ data: { user } });
    const store = makeStore();
    await store.dispatch(fetchMe() as any);
    expect(state(store).user).toEqual(user);
  });

  it("404 beralih ke endpoint cadangan", async () => {
    api.getMe.mockRejectedValue(new ApiError("nf", 404));
    api.getMeLegacy.mockResolvedValue({ data: { user } });
    const store = makeStore();
    await store.dispatch(fetchMe() as any);
    expect(api.getMeLegacy).toHaveBeenCalled();
    expect(state(store).user).toEqual(user);
  });

  it("405 juga beralih ke endpoint cadangan", async () => {
    api.getMe.mockRejectedValue(new ApiError("mna", 405));
    api.getMeLegacy.mockResolvedValue({ data: { user } });
    const store = makeStore();
    await store.dispatch(fetchMe() as any);
    expect(state(store).user).toEqual(user);
  });

  it("401 menghapus token dan mengosongkan sesi", async () => {
    localStorage.setItem("token", "lama");
    api.getMe.mockRejectedValue(new ApiError("unauth", 401));
    const store = makeStore();
    store.dispatch(hydrateAuth());
    await store.dispatch(fetchMe() as any);
    expect(state(store).token).toBeNull();
    expect(state(store).user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("error lain tidak mengeluarkan user", async () => {
    api.getMe.mockRejectedValue(new Error("jaringan"));
    const store = makeStore();
    store.dispatch(hydrateAuth());
    await store.dispatch(fetchMe() as any);
    expect(state(store).user).toBeNull();
  });

  it("ApiError non-401/404/405 dilempar ulang sebagai pesan", async () => {
    api.getMe.mockRejectedValue(new ApiError("server", 500));
    const store = makeStore();
    const res: any = await store.dispatch(fetchMe() as any);
    expect(res.payload).toBe("server");
  });
});

describe("reducer sinkron", () => {
  it("hydrateAuth membaca token dari storage", () => {
    localStorage.setItem("token", "xyz");
    const store = makeStore();
    store.dispatch(hydrateAuth());
    expect(state(store).token).toBe("xyz");
    expect(state(store).initialized).toBe(true);
  });

  it("logout dan clearError", () => {
    localStorage.setItem("token", "xyz");
    const store = makeStore();
    store.dispatch(hydrateAuth());
    store.dispatch(logout());
    expect(state(store).token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();

    const withError = reducer({ ...state(store), error: "x" }, clearError());
    expect(withError.error).toBeNull();
  });
});