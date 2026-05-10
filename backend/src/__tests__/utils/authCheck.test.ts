import jwt from "jsonwebtoken";
import { getUserFromToken } from "../../shared/utils/authCheck";
import { Request } from "express";

const JWT_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

function makeReq(authorization?: string): Request {
  return {
    headers: authorization ? { authorization } : {},
  } as unknown as Request;
}

describe("getUserFromToken", () => {
  it("returns the userId from a valid access token", () => {
    const token = jwt.sign({ userId: 7, username: "alice", type: "access" }, JWT_SECRET);
    const req = makeReq(`Bearer ${token}`);
    expect(getUserFromToken(req)).toBe(7);
  });

  it("returns null when no Authorization header is present", () => {
    const req = makeReq();
    expect(getUserFromToken(req)).toBeNull();
  });

  it("returns null when the token is malformed", () => {
    const req = makeReq("Bearer not.a.valid.token");
    expect(getUserFromToken(req)).toBeNull();
  });

  it("returns null when the token is signed with a different secret", () => {
    const token = jwt.sign({ userId: 7, type: "access" }, "wrong-secret");
    const req = makeReq(`Bearer ${token}`);
    expect(getUserFromToken(req)).toBeNull();
  });

  it("returns null when a refresh token is used as an access token", () => {
    const token = jwt.sign({ userId: 7, username: "alice", type: "refresh" }, JWT_SECRET);
    const req = makeReq(`Bearer ${token}`);
    expect(getUserFromToken(req)).toBeNull();
  });

  it("returns null when the token has expired", () => {
    const token = jwt.sign({ userId: 7, type: "access" }, JWT_SECRET, { expiresIn: "-1s" });
    const req = makeReq(`Bearer ${token}`);
    expect(getUserFromToken(req)).toBeNull();
  });

  it("accepts tokens without a type field (legacy tokens)", () => {
    // A token without type should still pass (type check only blocks non-access types)
    const token = jwt.sign({ userId: 5, username: "bob" }, JWT_SECRET);
    const req = makeReq(`Bearer ${token}`);
    expect(getUserFromToken(req)).toBe(5);
  });
});
