const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const app = require("../../src/app");

function request(path, body) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      const req = http.request({
        host: "127.0.0.1", port, path, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      }, (res) => {
        let text = "";
        res.on("data", (chunk) => { text += chunk; });
        res.on("end", () => server.close(() => resolve({ status: res.statusCode, body: JSON.parse(text) })));
      });
      req.on("error", (error) => server.close(() => reject(error)));
      req.end(body);
    });
  });
}

test("canonical and legacy webhook routes reject unauthenticated payloads", async () => {
  const originalGateway = process.env.PAYMENT_GATEWAY;
  process.env.PAYMENT_GATEWAY = "wema";
  try {
    for (const path of ["/api/v1/webhooks/wema", "/api/v1/webhooks/alatpay"]) {
      const result = await request(path, "{not-json");
      assert.equal(result.status, 401);
      assert.equal(result.body.error.code, "WEBHOOK_SIGNATURE_UNVERIFIED");
    }
  } finally {
    if (originalGateway === undefined) delete process.env.PAYMENT_GATEWAY;
    else process.env.PAYMENT_GATEWAY = originalGateway;
  }
});
