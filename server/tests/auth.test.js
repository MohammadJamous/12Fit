const request = require("supertest");
const express = require("express");

const { register, login } = require("../controllers/authController");

const app = express();

app.use(express.json());

app.post("/auth/register", register);
app.post("/auth/login", login);

describe("Auth API Validation Tests", () => {
  test("POST /auth/register should fail if fields are missing", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "",
        password: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  test("POST /auth/register should fail for invalid email", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "Test",
        email: "invalid-email",
        password: "123456",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  test("POST /auth/login should fail if fields are missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "",
        password: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});