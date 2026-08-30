# ADR-0011: Public ALSAMAD Durable Account Identity and Authentication Boundary

**Registry entry:** `REG-0028` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-08-30. Architecture only; implementation not authorized.

This ADR fixes the provider-neutral identity boundary for the Expanded V1 Public ALSAMAD Identity prerequisite architecture track. It authorizes no table, schema, migration, account row, credential, provider integration, session store, recovery mechanism, API, route, UI, real-user processing, Talibeen linkage, or deployment.

## Context

Core Release 1 is guest-first. The repository previously kept public authentication, accounts, synchronized preferences, and saved items together as Prepared material, while Talibeen governance requires one shared ALSAMAD account before any persistent private profile can exist. The Owner has promoted only the durable identity prerequisite and its authentication/session/recovery/lifecycle boundaries; optional synchronization and personalization remain deferred.

A credential, provider subject, session token, email address, phone number, username, or presentation field is replaceable and belongs to a different lifecycle from the durable account that future authorized modules may reference. Editorial Identity is already a separate accountability root under `ADR-0008`. Conflating any of these identities would create provider coupling, duplicate accounts, unstable cross-module references, or unsafe deletion behavior.

## Decision

### 1. Durable shared account identity

ALSAMAD owns one opaque, durable account subject as the shared platform identity for separately authorized clients and modules. It is the stable reference boundary for the account lifecycle and remains independent of credentials, authentication providers, sessions, recovery methods, presentation fields, Editorial Identity, and dependent private-module profiles.

The account is not Talibeen-only. Future ALSAMAD Web, mobile, standalone Talibeen clients, and other separately authorized modules reuse the same account identity rather than creating client-specific or module-specific account systems. This is a conceptual ownership decision, not a physical schema decision; identifier type, generation, fields, constraints, and persistence remain unresolved.

### 2. Authentication boundary and provider neutrality

Authentication establishes control of an accepted credential or provider identity. It may later resolve through a governed link to the durable ALSAMAD account, but it does not define, replace, or become that account identity. Credentials and provider records belong to the authentication boundary.

The architecture is provider-neutral. It selects no password, passkey, OAuth/OIDC provider, magic link, email or SMS code, Supabase Auth, Auth0, Clerk, Firebase, custom authentication, or other mechanism. Future linking may permit multiple approved authentication identities to resolve to one account, but must fail closed against takeover, ambiguous ownership, or one provider identity silently resolving to multiple accounts. Exact linking, unlinking, assurance, and provider replacement policy remain later contracts.

### 3. Session boundary

A session represents revocable authorized access associated with an authenticated account context; it is not the account identity. Architecture must support independently governed sessions across future authorized clients and devices. Account restriction, compromise, credential or recovery changes, and lifecycle transitions may require session revocation or invalidation.

Session ownership, storage, transport, token or cookie format, duration, rotation, device metadata, provider-managed behavior, API surface, and implementation remain deferred.

### 4. Recovery boundary

Recovery restores controlled access to the same durable ALSAMAD account. It must not silently create a duplicate account as normal behavior, replace the canonical account subject, or bypass current account state. Recovery is security-sensitive and fail-closed.

Email, SMS, passkey, code, provider, support-assisted, cooldown, notification, evidence, and audit mechanisms remain later Security/API/provider/implementation decisions.

### 5. Account lifecycle

The architecture distinguishes usable access, restricted or disabled access, deletion in progress, and terminal deletion completion as semantic conditions. Access state is independent of provider state. Restriction or disablement does not silently delete the account, access recovery is not terminal-account resurrection, and deletion is not complete while dependent-module disposition remains unresolved.

Exact state names, transition graph, reactivation, grace period, appeal, retention, anonymization, and physical representation remain later Product/Privacy/Security/Database contracts.

### 6. Editorial Identity separation

Public ALSAMAD Account and Editorial Identity are separate bounded contexts. A public account does not make its holder an Editorial actor, public authentication conveys no Editorial capability, and `editorial_users.id` must not become the Talibeen or public-user root. A future separately governed relationship may reference either identity without collapsing their ownership or lifecycles. `ADR-0008` remains unchanged.

### 7. Dependent private modules and deletion

Future private modules such as Talibeen may reference the shared account only after their own architecture, privacy, security, data, and Roadmap crossings. Their profiles and sensitive records remain module-owned and are not public-account fields.

Base-account deletion must not assume an unconditional physical cascade, create orphaned records, hide undeclared retention, or leave ownership ambiguous. Before production linkage, each dependent module must define its reference behavior, deletion, retention, legal/safety evidence, cleanup, user-facing disclosure, and completion acknowledgement. This ADR defines no Talibeen table, retention period, legal basis, moderation evidence rule, or deletion implementation.

### 8. Release and implementation boundary

`PUBLIC ALSAMAD IDENTITY ARCHITECTURE = OPEN / APPROVED`. `PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

Preferences, saved items, favorites, synchronization, personalization, private routines, notifications, payments, Talibeen profiles/persistence, and unrelated account features remain outside this first boundary. A later implementation requires exact Database/API/Security and privacy contracts, applicable provider/mechanism review, and an Owner-reviewed Roadmap unit with an exact file/migration boundary and acceptance contract.

## Why alternatives were rejected

- **Provider subject as canonical account identity:** couples the platform identity to a replaceable external lifecycle.
- **Email, phone, username, or display name as canonical identity:** makes mutable contact/presentation data a cross-module key.
- **Talibeen-only account:** violates the shared ALSAMAD platform identity and creates duplicate identity systems.
- **One account per client:** fragments identity, recovery, deletion, and future module ownership.
- **Public account as Editorial Identity:** violates `ADR-0008` and conflates public access with accountable staff authority.
- **Blind cascade deletion:** can erase required evidence, orphan private records, or conceal undeclared retention.
- **Bundling preferences and saved items into first activation:** expands beyond the durable identity prerequisite without a proven implementation journey.
- **Selecting an authentication provider now:** creates premature coupling before an implementation/provider decision and acceptance contract exist.

## Reversibility and ADR threshold

This decision is architecturally material and difficult to reverse. Once multiple clients or private modules persist references to the account root, replacing it or conflating it with provider, Editorial, session, or module identity would require data-shaping cross-module reconstruction and could cause account loss, takeover, duplication, orphaning, or unsafe deletion. The decision therefore meets both Registry §7 ADR conditions.

## Explicit exclusions

No physical identifier or enum; no `users`, `user_identities`, `user_sessions`, preferences, or saved-items table; no migration/ORM/schema; no auth mechanism/provider; no credentials, sessions, recovery, API/route/UI, real accounts/data, administration/support tooling, notification, payment, analytics, or deployment; no Talibeen profile/linkage/persistence/discovery/introduction/messaging/moderation; no Core Release 1 scope/table-count change; and no next implementation unit are authorized.
