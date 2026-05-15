const request = require("supertest");
const app = require("../app");

describe("Basic API Tests", () => {
  test("GET / should return API running message", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("12Fit API is running");
  });

  test("GET /health should return server health status", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.uptime).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  test("GET /api/v1/health should return versioned health status", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});