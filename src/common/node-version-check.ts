// Node.js releases before these are affected by CVE-2026-111497 (out-of-bounds write in the
// bundled Brotli decoder). Node's built-in fetch decompresses Brotli responses, so a malicious
// or compromised Umbraco instance could reach the decoder. Only a Node.js upgrade fixes it.
const FIXED_NODE_VERSIONS: Record<number, string> = {
    22: "22.23.4",
    24: "24.22.1",
    26: "26.12.1"
};

const LATEST_FIXED_MAJOR = 26;

export type NodeVersionStatus = "ok" | "vulnerable" | "unsupported" | "unknown";

function parseVersion(version: string): number[] | null {
    const match = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)/);
    return match ? match.slice(1, 4).map(Number) : null;
}

function isBefore(a: number[], b: number[]): boolean {
    for (let i = 0; i < 3; i++) {
        if (a[i] !== b[i]) return a[i] < b[i];
    }
    return false;
}

export function assessNodeVersion(version: string): NodeVersionStatus {
    const parsed = parseVersion(version);
    if (!parsed) return "unknown";

    const major = parsed[0];
    const fixed = FIXED_NODE_VERSIONS[major] ?? (major > LATEST_FIXED_MAJOR ? FIXED_NODE_VERSIONS[LATEST_FIXED_MAJOR] : undefined);
    if (!fixed) return "unsupported";

    return isBefore(parsed, parseVersion(fixed)!) ? "vulnerable" : "ok";
}

// Warns on stderr (stdout carries the MCP stdio protocol) and never blocks startup.
export function checkNodeVersion(version: string = process.versions.node, log: (message: string) => void = console.error): string | null {
    const status = assessNodeVersion(version);
    if (status !== "vulnerable" && status !== "unsupported") return null;

    const reason = status === "vulnerable"
        ? "is affected by CVE-2026-111497 (out-of-bounds write in the bundled Brotli decoder)"
        : "does not receive security fixes (including CVE-2026-111497)";
    const message = `[umbraco-commerce-mcp] WARNING: Node.js v${version.replace(/^v/, "")} ${reason}. ` +
        "Upgrade Node.js to 22.23.4, 24.22.1 or 26.12.1 (or newer in the same line). Continuing anyway.";
    log(message);
    return message;
}
