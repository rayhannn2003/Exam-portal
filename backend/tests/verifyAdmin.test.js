const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "replace_with_test_only_secret";

const { verifyAdmin } = require("../middleware/verifyAdmin");

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("verifyAdmin rejects requests without a bearer token", () => {
  const req = { headers: {} };
  const res = createResponse();

  verifyAdmin(req, res, () => assert.fail("next should not be called"));

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Unauthorized" });
});

test("verifyAdmin rejects student tokens", () => {
  const token = jwt.sign({ id: "student-id", role: "student" }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();

  verifyAdmin(req, res, () => assert.fail("next should not be called"));

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: "Forbidden" });
});

test("verifyAdmin accepts admin tokens", () => {
  const token = jwt.sign({ id: "admin-id", role: "admin" }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let called = false;

  verifyAdmin(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.user.role, "admin");
});
