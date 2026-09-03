# ADR-0015 — PUBLIC ALSAMAD AUTHENTICATION SESSION GOVERNANCE BOUNDARY

**Status:** Accepted
**Date:** 2026-09-03
**Decision:** Architecture governance only; no implementation authority.

## Context

`REG-0033` completed and remotely closed the zero-row, runtime-inert authentication-identity persistence boundary. The next conceptual dependency is session governance. This ADR defines only the security and authority model for future authentication sessions.

## Decision

Authentication sessions are server-managed, revocable authority contexts subordinate to exactly one durable ALSAMAD account and the account's current authentication/security state. A session cannot establish or override durable identity authority. Distinct client/device security contexts may have independently revocable session instances, and account-wide invalidation/revoke-all must be supported. Ambiguous or invalid authority fails closed.

The conceptual lifecycle is `ISSUED`, `ACTIVE`, and `EXPIRED` or `REVOKED`. `INVALID` is an evaluation outcome and is not presumed to be a persisted state. Every session has bounded authority in time; no permanently valid session is authorized. Conceptual invalidation must cover current-session logout, account-wide logout/revoke-all, account disablement or closure, security-sensitive authentication-state change, and compromise response. Ordinary profile, content, and preference changes do not by themselves invalidate sessions.

Client/device context is a security/session context only. It does not establish physical-device identity or ownership, trusted-device status, assurance, reputation, personhood, household identity, Talibeen identity, or Editorial identity.

## Security boundary

The architecture must address fixation, theft/replay, revocation, concurrent sessions, disablement/closure, authentication-state changes, logout, account-wide logout, per-context isolation, fail-closed ambiguity, enumeration, identifier leakage, privacy, and bounded-time authority. Transport-specific CSRF requirements remain deferred until a future transport/cookie model is governed.

## Deferred decisions

This ADR freezes no table, column, status enum, index, migration, persistence or storage mechanism, token representation, cookie/header/endpoint, TTL or timeout value, refresh mechanics, cryptographic algorithm, cache, provider behavior, login/signup flow, API/runtime behavior, or operational support procedure. These require later physical, security, provider, API, privacy, and runtime governance.

## Boundaries and non-authority

This ADR authorizes no session rows, cookies, tokens, runtime authentication, provider integration, login/signup, API/session resolution, Recovery, support/admin mutation, real identity or personal-data processing, production activation, or successor unit. Recovery remains downstream and separately governed. Immutable audit-event governance remains separately required before real identity lifecycle mutation where existing authority requires it. Retention, erasure, legal-hold, backup, and privacy governance remain separately required before applicable real processing. No hidden indefinite retention or post-erasure reassignment is authorized.

## Consequences

Future physical and runtime designs must preserve account ownership, revocability, account-wide invalidation, fail-closed evaluation, provider neutrality, privacy minimization, and explicit separation from Recovery and identity lifecycle mutation. Completion of this architecture decision grants no implementation authority.
