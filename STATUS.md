# Verification and scope

Implemented and verified on Node 24.22.1: 10 tests pass; server and browser JavaScript syntax checks pass. Tests cover agreement prerequisites, quote replacement, specification invalidation, unresolved-detail revocation, stale/invalid mutations, duplicate revision prevention, HTTP session isolation and origin rejection, provider-output parsing, image-host allowlisting and mocked provider authentication/errors.

These are automated local checks, not a live API verification. Actual YouCam cost, entitlement, latency and fidelity remain unmeasured. The provider adapter is based on the official Clothes V4 route and must be smoke-tested against your account. No key was requested or used.

Browser walkthrough was attempted but blocked by a missing Chromium executable. No browser visual verification is claimed; see docs/15-VERIFICATION.md. Local persistence is intended for a single process. There are no real authenticated actors, merchant catalog editor, actual image-upload service, payments or production-order integrations. The UI clearly labels demonstration roles and fictional catalog values.

Public deployment is not part of this archive delivery. The default host is localhost. Docker binds publicly inside its container, so protect any external ingress as described in the deployment guide.
