import { concatPcm } from "../src/audio/pcm";

describe("pcm playback helpers", () => {
  it("concatenates queued PCM chunks for merged playback", () => {
    const merged = concatPcm([
      new Uint8Array([0, 1, 0, 2]),
      new Uint8Array([0, 3, 0, 4]),
    ]);
    expect(merged.byteLength).toBe(8);
    expect(Array.from(merged)).toEqual([0, 1, 0, 2, 0, 3, 0, 4]);
  });
});
