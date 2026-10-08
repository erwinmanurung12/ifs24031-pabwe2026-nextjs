import { describe, it, expect, vi, afterEach } from "vitest";

async function loadGetImageUrl() {
  vi.resetModules();
  return (await import("@/helpers/imageUrl")).getImageUrl;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getImageUrl", () => {
  it("mengembalikan undefined untuk nilai kosong", async () => {
    const getImageUrl = await loadGetImageUrl();
    expect(getImageUrl(undefined)).toBeUndefined();
    expect(getImageUrl(null)).toBeUndefined();
    expect(getImageUrl("")).toBeUndefined();
  });

  it("memakai URL lengkap dan data URI apa adanya", async () => {
    const getImageUrl = await loadGetImageUrl();
    expect(getImageUrl("https://x.test/a.jpg")).toBe("https://x.test/a.jpg");
    expect(getImageUrl("//x.test/a.jpg")).toBe("//x.test/a.jpg");
    expect(getImageUrl("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
  });

  it("memakai base default jika env kosong", async () => {
    vi.stubEnv("NEXT_PUBLIC_DELCOM_ASSET_BASEURL", "");
    const getImageUrl = await loadGetImageUrl();
    expect(getImageUrl("a.jpg")).toBe("https://open-api.delcom.org/a.jpg");
    expect(getImageUrl("/a.jpg")).toBe("https://open-api.delcom.org/a.jpg");
  });

  it("memakai base dari env dan membuang slash akhir", async () => {
    vi.stubEnv("NEXT_PUBLIC_DELCOM_ASSET_BASEURL", "https://cdn.test/");
    const getImageUrl = await loadGetImageUrl();
    expect(getImageUrl("a.jpg")).toBe("https://cdn.test/a.jpg");
  });
});