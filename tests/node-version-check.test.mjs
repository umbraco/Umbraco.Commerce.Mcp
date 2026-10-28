import { test } from "node:test";
import assert from "node:assert/strict";
import { assessNodeVersion, checkNodeVersion } from "../build/common/node-version-check.js";

test("classifies Node.js versions against CVE-2026-111497", () => {
    const cases = {
        "22.0.0": "vulnerable",
        "22.23.3": "vulnerable",
        "22.23.4": "ok",
        "24.22.0": "vulnerable",
        "24.22.1": "ok",
        "26.12.0": "vulnerable",
        "26.12.1": "ok",
        "27.0.0": "ok",
        "20.19.0": "unsupported",
        "23.11.0": "unsupported",
        "25.0.0": "unsupported",
        "v22.23.4": "ok",
        "Latest": "unknown"
    };
    for (const [version, status] of Object.entries(cases)) {
        assert.equal(assessNodeVersion(version), status, version);
    }
});

test("warns for affected versions only", () => {
    const logged = [];
    const message = checkNodeVersion("22.17.0", m => logged.push(m));
    assert.match(message, /CVE-2026-111497/);
    assert.deepEqual(logged, [message]);

    assert.equal(checkNodeVersion("22.23.4", m => logged.push(m)), null);
    assert.equal(logged.length, 1);
});
