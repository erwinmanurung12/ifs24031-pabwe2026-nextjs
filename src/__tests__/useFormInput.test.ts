import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { useFormInput } from "@/hooks/useFormInput";

const change = (name: string, value: string) =>
  ({ target: { name, value } }) as ChangeEvent<HTMLInputElement>;

describe("useFormInput", () => {
  it("memakai nilai awal", () => {
    const { result } = renderHook(() => useFormInput({ title: "", content: "" }));
    expect(result.current.values).toEqual({ title: "", content: "" });
  });

  it("handleChange memperbarui field sesuai name", () => {
    const { result } = renderHook(() => useFormInput({ title: "", content: "" }));
    act(() => result.current.handleChange(change("title", "Halo")));
    expect(result.current.values).toEqual({ title: "Halo", content: "" });
  });

  it("setValues mengganti seluruh nilai dan reset mengembalikan nilai awal", () => {
    const { result } = renderHook(() => useFormInput({ title: "a", content: "b" }));
    act(() => result.current.setValues({ title: "x", content: "y" }));
    expect(result.current.values).toEqual({ title: "x", content: "y" });
    act(() => result.current.reset());
    expect(result.current.values).toEqual({ title: "a", content: "b" });
  });
});