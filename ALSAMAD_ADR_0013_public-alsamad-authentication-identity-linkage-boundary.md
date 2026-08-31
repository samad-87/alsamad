# ADR-0013: Public ALSAMAD Authentication Identity Linkage Boundary

**Registry entry:** `REG-0031` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-08-31. Architecture/threat/data-flow governance only; physical contract and implementation are not authorized.

## Context

`REG-0028` and accepted `ADR-0011` establish one provider-neutral durable ALSAMAD account distinct from credentials, provider subjects, sessions, recovery, Editorial Identity, and dependent-module profiles. `REG-0029`/`ADR-0012` freeze only the minimal physical `users` root, and implemented `REG-0030` records its runtime-inert persistence as COMPLETE/PASS. Authentication identity linkage remains conceptual and deferred.

A future replaceable authentication identity must resolve safely to the stable ALSAMAD account without becoming that account identity. Incorrect cardinality, contact-based inference, ambiguous ownership, unsafe unlinking, or automatic merge/transfer could cause duplicate accounts, account takeover, loss of access, cross-account data exposure, or destruction of security evidence. This ADR settles only the provider-neutral architecture invariants needed before any physical contract can be considered.

## Decision

### 1. Durable account and authentication identity separation

The durable ALSAMAD account remains the stable platform identity. An authentication identity is a replaceable proof-bearing access identity and never becomes, replaces, or redefines the durable account. One durable account may eventually link to multiple authentication identities. One authentication identity may resolve to at most one durable account.

Conflict, ambiguity, collision, stale ownership evidence, or an authentication identity already linked to another durable account fails closed. There is no automatic account merge, transfer, takeover, reassignment, or duplicate-account creation.

### 2. Proof of control and contact independence

Future additional linkage requires proof of control of the existing durable ALSAMAD account and proof of control of the new authentication identity. Matching email, phone, username, or another mutable contact or presentation attribute is never sufficient to infer equivalence, ownership, merge, or transfer.

A provider subject or authenticator identity is conceptually distinct from mutable provider-side contact attributes. Changing a provider-side email or contact attribute must not create a new durable ALSAMAD identity, redefine ownership, or silently move access between accounts.

### 3. Unlink, replacement, and lineage invariants

Unlinking must not silently strand the durable account without another separately governed secure access or recovery path. Exact unlink eligibility, recovery, cooldown, notification, and exceptional-support mechanics remain deferred.

Replacement or relinking must not automatically erase necessary security or audit lineage. Exact audit fields, storage, access, retention, deletion, legal basis, and user-rights treatment remain later governance before real processing.

### 4. Assurance independence

Authentication assurance proves only the governed control relationship necessary for account access. It implies no trust, reputation, piety, compatibility, Editorial authority, Talibeen authority, membership tier, payment status, entitlement, ranking, safety status, or social standing.

### 5. Provider neutrality

This boundary selects no provider, authenticator, credential, OAuth/OIDC system, Google or Apple integration, passkey mechanism, password, email or SMS method, hosted identity service, or custom authentication implementation. Provider-specific subject formats, normalization, assurance, replacement, and operational behavior remain later research and governance.

### 6. Threat and conceptual data-flow boundary

Conceptual actors are the durable ALSAMAD account, a replaceable authentication identity, a future authenticator/provider, a future client, and a future account-resolution boundary. The conceptual future flow is proof of control presented through a separately governed authentication mechanism so the resolution boundary may resolve one authentication identity to one durable account.

Threats to address before physical or runtime authorization include account duplication, account takeover, mutable-contact collision, provider-subject collision, ambiguous mapping, stale linkage, unsafe unlink, accidental cross-account transfer, privilege or trust conflation, enumeration, and leakage of provider subjects or durable account identifiers. Linking, unlinking, replacement, conflict handling, and resolution failure behavior require concrete later contracts.

### 7. Privacy, legal, and research boundary

No real personal-data processing begins through this ADR. Before physical or runtime authorization, separate governance and applicable research must resolve purpose limitation, data minimization, lawful basis, notice, provider metadata, retention, deletion completion, access/export, audit/log access, support access, subprocessors, transfers, and jurisdiction obligations.

No external research is required for this narrow provider-neutral conceptual boundary. External provider, authentication-security, operational, privacy/legal, and jurisdiction research becomes mandatory before provider selection or integration, real authentication identities, runtime linkage, session mechanisms, recovery mechanisms, real-user activation, or production processing.

### 8. Release and future governance boundary

`PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE ARCHITECTURE = OPEN / APPROVED`.

`PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE PHYSICAL CONTRACT = BLOCKED / NOT AUTHORIZED`.

`PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

Broader `PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`. A separate physical-contract governance crossing must decide whether persistence is justified and, if so, its physical representation. A later separate Owner-reviewed Roadmap crossing must define an exact implementation boundary and acceptance contract. Governance sequencing is linkage governance → session governance → recovery governance; this ordering authorizes no implementation.

## Why alternatives were rejected

- **Provider subject as durable account identity:** couples stable ownership to a replaceable external lifecycle.
- **Email or phone equivalence:** mutable contact data is not proof of durable-account ownership and enables collision or takeover.
- **One authentication identity linked to multiple accounts:** creates ambiguous access and cross-account exposure.
- **Automatic merge or transfer:** can move ownership or data without adequate proof and review.
- **Unconditional unlink:** can strand access and force unsafe recovery.
- **Discarding linkage history on replacement:** can erase evidence needed for security, user rights, or incident response.
- **Freezing a table now:** would decide provider-sensitive persistence before its physical, privacy, and operational contracts exist.

## Reversibility and ADR threshold

Persistent identity linkage becomes difficult to reverse once account access depends on it. Cardinality, uniqueness, control proof, merge/transfer, and unlink semantics directly affect takeover, duplication, access loss, and cross-account exposure. The decision is therefore material and meets the Registry §7 ADR threshold.

## Explicit exclusions

No `user_identities` schema or physical table name; no columns, keys, indexes, foreign keys, constraints, migration, journal change, ORM declaration, test, seed, row, provider selection/integration, Google/Apple/passkey integration, credential, email/phone storage, signup/login, session, recovery, account or session API, route, server action, serialization, repository/service, runtime reader/writer, account creation, real personal data, preference, saved item, public profile, deletion/retention implementation, Editorial linkage, Talibeen linkage, notification, payment, SEO, analytics, AI, background job, deployment, implementation file boundary, or next runtime unit is authorized.
