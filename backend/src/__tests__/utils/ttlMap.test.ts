import TTLMap from "../../shared/utils/ttlMap";

describe("TTLMap", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("set and get", () => {
    it("returns a value that was set", () => {
      const map = new TTLMap<string>(5000);
      map.set("key", "value");
      expect(map.get("key")).toBe("value");
    });

    it("returns undefined for a key that was never set", () => {
      const map = new TTLMap<string>(5000);
      expect(map.get("missing")).toBeUndefined();
    });

    it("stores different types of values", () => {
      const map = new TTLMap<unknown>(5000);
      map.set("num", 42);
      map.set("obj", { a: 1 });
      map.set("arr", [1, 2, 3]);
      expect(map.get("num")).toBe(42);
      expect(map.get("obj")).toEqual({ a: 1 });
      expect(map.get("arr")).toEqual([1, 2, 3]);
    });

    it("overwrites an existing key with a new value", () => {
      const map = new TTLMap<string>(5000);
      map.set("key", "first");
      map.set("key", "second");
      expect(map.get("key")).toBe("second");
    });
  });

  describe("TTL expiry", () => {
    it("returns undefined after the TTL has elapsed", () => {
      const map = new TTLMap<string>(1000);
      map.set("key", "value");

      jest.advanceTimersByTime(1001);

      expect(map.get("key")).toBeUndefined();
    });

    it("returns value before the TTL has elapsed", () => {
      const map = new TTLMap<string>(1000);
      map.set("key", "value");

      jest.advanceTimersByTime(999);

      expect(map.get("key")).toBe("value");
    });

    it("resets the TTL when a key is overwritten", () => {
      const map = new TTLMap<string>(1000);
      map.set("key", "first");
      jest.advanceTimersByTime(800);
      map.set("key", "second"); // overwrite resets TTL
      jest.advanceTimersByTime(500); // 500ms after overwrite, still within new TTL
      expect(map.get("key")).toBe("second");
    });
  });

  describe("delete", () => {
    it("removes a key so get returns undefined", () => {
      const map = new TTLMap<string>(5000);
      map.set("key", "value");
      map.delete("key");
      expect(map.get("key")).toBeUndefined();
    });

    it("does not throw when deleting a non-existent key", () => {
      const map = new TTLMap<string>(5000);
      expect(() => map.delete("non-existent")).not.toThrow();
    });
  });
});
