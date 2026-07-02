import { parseLinearGradient } from "../src/theme/parse-gradient";

describe("parseLinearGradient", () => {
  it("parses angle and color stops", () => {
    const parsed = parseLinearGradient(
      "linear-gradient(135deg, #7DD3FC 0%, #2563EB 100%)",
    );
    expect(parsed?.colors).toEqual(["#7DD3FC", "#2563EB"]);
    expect(parsed?.locations).toEqual([0, 1]);
  });

  it("returns null for invalid input", () => {
    expect(parseLinearGradient("not-a-gradient")).toBeNull();
    expect(parseLinearGradient("linear-gradient(#fff)")).toBeNull();
  });
});
