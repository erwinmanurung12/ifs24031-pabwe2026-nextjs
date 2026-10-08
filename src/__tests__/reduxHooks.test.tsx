import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setUsers } from "@/features/users/states/userSlice";

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe("hooks redux", () => {
  it("useAppSelector membaca state dan useAppDispatch memperbaruinya", () => {
    const { result } = renderHook(
      () => ({
        dispatch: useAppDispatch(),
        users: useAppSelector((s) => s.users.users),
      }),
      { wrapper }
    );

    act(() => {
      result.current.dispatch(setUsers([{ id: 5, name: "X", email: "x@test.com" }]));
    });

    expect(result.current.users).toEqual([{ id: 5, name: "X", email: "x@test.com" }]);
  });
});