import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { checkUserId, checkTodoId } from "../../modules/todos/utils/todoHelpers";

const JWT_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

function makeReq(authorization?: string): Request {
  return {
    headers: authorization ? { authorization } : {},
  } as unknown as Request;
}

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("checkUserId", () => {
  it("returns the userId when the token is valid", () => {
    const token = jwt.sign({ userId: 3, username: "alice", type: "access" }, JWT_SECRET);
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    expect(checkUserId(req, res)).toBe(3);
  });

  it("responds with 401 and throws when no token is provided", () => {
    const req = makeReq();
    const res = makeRes();
    expect(() => checkUserId(req, res)).toThrow("Authentication required");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("responds with 401 and throws when the token is invalid", () => {
    const req = makeReq("Bearer bad.token.here");
    const res = makeRes();
    expect(() => checkUserId(req, res)).toThrow("Authentication required");
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("checkTodoId", () => {
  it("does not respond when the id is a valid numeric string", () => {
    const res = makeRes();
    checkTodoId("42", res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("responds with 400 when the id is not a number", () => {
    const res = makeRes();
    checkTodoId("abc", res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid todo ID" });
  });

  it("responds with 400 when the id is an empty string", () => {
    const res = makeRes();
    checkTodoId("", res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("responds with 400 when the id contains special characters", () => {
    const res = makeRes();
    checkTodoId("1; DROP TABLE todos", res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
