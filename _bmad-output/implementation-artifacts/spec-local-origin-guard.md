---
title: 'Harden Local Origin Guard'
type: 'bugfix'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The local development API allows only two hard-coded Vite origins. If Vite selects another local port, the browser is incorrectly rejected with “Origine non autorisée”, even though it is the same local development environment.

**Approach:** Accept loopback browser origins on any explicit port outside production, preserve the fixed production allowlist, and verify the Vite proxy can start a Nursing mission from `http://localhost:5173`.

</frozen-after-approval>

## Implementation Notes

- Development now accepts only explicit-port HTTP loopback origins (`localhost` and `127.0.0.1`), so Vite may choose a fallback port without weakening the production origin allowlist.
- The regression test exercises both fallback loopback origins and rejects production-loopback, lookalike-host, and arbitrary external origins.
- Review hardening: cover IPv6 loopback and port-less local origins, require an `Origin` header to be a canonical origin rather than a path-bearing URL, and exercise the corresponding Referer path.

## Review Triage Log

- medium — IPv6 loopback was rejected in development. Fixed by accepting `::1` only over HTTP and only outside production.
- low — Port-less HTTP loopback was rejected. Fixed by allowing the canonical local origin without requiring an explicit port.
- medium — A path-bearing value could pass `isLoopbackDevelopmentOrigin` despite not being a valid `Origin` header. Fixed by requiring `origin === new URL(origin).origin`.
- medium — The Referer-only guard path lacked loopback regression coverage. Fixed with local IPv4, IPv6, and fallback-port Referer tests.
