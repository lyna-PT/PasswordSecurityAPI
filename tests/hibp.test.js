const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { checkPasswordExposure } = require("../src/services/hibpService");

function sha1Parts(password) {
  const hash = crypto.createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
  return { prefix: hash.slice(0, 5), suffix: hash.slice(5) };
}

test("checks a password using only the SHA-1 hash prefix", async (t) => {
  const password = "unit-test-password";
  const { prefix, suffix } = sha1Parts(password);
  const originalFetch = global.fetch;
  let requestedUrl = "";

  global.fetch = async (url, options) => {
    requestedUrl = String(url);
    assert.equal(options.headers["Add-Padding"], "true");
    return {
      ok: true,
      text: async () => `${suffix}:12\n${"A".repeat(35)}:4`
    };
  };

  t.after(() => { global.fetch = originalFetch; });

  const result = await checkPasswordExposure(password);

  assert.equal(requestedUrl, `https://api.pwnedpasswords.com/range/${prefix}`);
  assert.equal(requestedUrl.includes(password), false);
  assert.deepEqual(result, {
    isPwned: true,
    occurrences: 12,
    source: "Have I Been Pwned"
  });
});

test("reports a password as not found when its suffix is absent", async (t) => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    text: async () => `${"A".repeat(35)}:5\n${"B".repeat(35)}:2`
  });
  t.after(() => { global.fetch = originalFetch; });

  const result = await checkPasswordExposure("another-unit-test-password");

  assert.equal(result.isPwned, false);
  assert.equal(result.occurrences, 0);
});

test("rejects invalid input and handles an unavailable service", async (t) => {
  await assert.rejects(
    () => checkPasswordExposure(""),
    /non-empty password/i
  );

  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false });
  t.after(() => { global.fetch = originalFetch; });

  await assert.rejects(
    () => checkPasswordExposure("network-error-test"),
    /unavailable/i
  );
});
