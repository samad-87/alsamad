# Alsamad — Artificial Intelligence Architecture

**Status:** Long-term architecture baseline; documentation only  
**Authoritative references:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md`, `ALSAMAD_DATABASE_ARCHITECTURE.md`, `ALSAMAD_ADMIN_ARCHITECTURE.md`  
**Purpose:** Define how Artificial Intelligence may operate inside Alsamad for at least the next decade without making the platform dependent on any model vendor, inference backend, or AI capability.

---

## 1. Mission and Scope

Alsamad uses Artificial Intelligence as a governed enhancement layer around an authoritative religious and editorial platform. AI may help users discover, understand, translate, organize, and navigate approved knowledge. It may also assist editors and administrators with repetitive or analytical work. It must never become an independent source of religious truth, an unreviewed publisher, a hidden governance authority, or a dependency required for the core platform to function.

This architecture is provider-independent. It supports proprietary cloud APIs, open-weight models, local inference, self-hosted inference, batch processing, future GPU infrastructure, and future model families through stable internal contracts and replaceable adapters.

The architecture must survive:

- model and provider changes;
- changes in pricing, latency, context windows, licensing, and regional availability;
- migration from cloud inference toward open-weight or self-hosted inference;
- the addition of new languages, regions, modalities, and product modules;
- stronger future religious-review, privacy, safety, or governance requirements;
- temporary or permanent loss of all AI services.

### 1.1 What this document defines

This document defines:

- constitutional AI principles;
- human and religious authority boundaries;
- AI capabilities and release classifications;
- Retrieval-Augmented Generation architecture;
- model abstraction and provider adapters;
- model routing and task policies;
- prompt governance;
- runtime safety and religious safety;
- privacy, memory, retention, and regional processing;
- evaluation, observability, cost control, and incident response;
- administration and operational ownership;
- open-weight migration strategy;
- failure, fallback, and degradation behavior.

### 1.2 What this document does not authorize

This document does not authorize:

- application code;
- user interface implementation;
- database tables or migrations;
- activation of an AI provider;
- storage of user conversations;
- deployment of AI functionality;
- autonomous religious publication;
- autonomous moderation or governance;
- Talibeen, subscriptions, notifications, semantic search, embeddings, or any later module merely because their AI architecture is documented.

### 1.3 Product baseline preserved

All AI capabilities must preserve the approved product baseline:

- Quran and authentic Sunnah remain the primary religious foundations;
- canonical religious content is normalized and never duplicated merely by language;
- transmitted religious content remains distinct from editorial content;
- Editorial General Dua remains structurally distinct from Quranic Dua, Prophetic Dua, and Authenticated Dhikr;
- published religious content follows approved human review;
- Arabic remains first-class while languages and regions remain configuration-driven;
- AI never becomes an independent religious authority;
- popularity, commerce, payment, engagement, or provider preference never influence religious truth or approval;
- future modules remain separately authorized.

---

## 2. Constitutional AI Principles

These principles are permanent architectural rules. Product features, provider contracts, prompts, model choices, administrative workflows, and runtime behavior must conform to them.

### 2.1 Human Authority Principle

Authorized humans retain final authority over governance, religious review, publication, corrections, withdrawals, permissions, safety decisions, and irreversible administrative actions.

AI may support human work, but it may not replace accountable human judgment where the platform requires approval, interpretation, governance, or religious responsibility.

### 2.2 Religious Authority Principle

AI is not a scholar, mufti, source of revelation, or independent religious authority.

Religious claims must remain grounded in approved canonical sources, approved editorial explanations, and the platform’s religious-review framework. AI-generated wording does not acquire religious authority because it is fluent, confident, popular, or produced by a premium model.

### 2.3 Evidence Before Generation Principle

When a response contains factual or religious claims, relevant approved evidence must be retrieved and validated before generation.

Generation without sufficient evidence must result in a limited answer, an explicit statement of uncertainty, a request for clarification, a deterministic fallback, or human escalation. Fluency is never a substitute for evidence.

### 2.4 AI Transparency Principle

Users and administrators must be able to distinguish:

- canonical source content;
- approved editorial content;
- retrieved evidence;
- deterministic platform output;
- AI-generated or AI-assisted explanation;
- uncertainty, limitations, and unavailable evidence.

AI involvement must not be concealed where its disclosure affects trust, religious interpretation, privacy, or decision-making.

### 2.5 Model Independence Principle

The platform’s product logic, canonical data, workflows, and user journeys must not depend on the proprietary behavior, message format, taxonomy, tool-calling convention, or persistence model of one AI provider.

Internal contracts define tasks. Provider adapters translate those contracts to external or local runtimes.

### 2.6 Retrieval Before Generation Principle

For knowledge-bearing tasks, Alsamad retrieves approved information before asking a model to formulate a response.

Pure model memory is not accepted as the primary evidence source for religious answers, platform facts, content status, policy, user permissions, or current operational state.

### 2.7 Privacy First Principle

Privacy requirements are defined before model selection or prompt design.

Sensitive data is excluded unless the task has a documented need, explicit lawful basis, approved retention, controlled provider route, and proportionate safeguards.

### 2.8 Minimal Data Principle

Every AI request contains the smallest data set necessary for the approved task.

Unrelated profile data, full conversation history, raw identifiers, contact details, private submissions, payment data, permissions, and operational records must not be sent merely because they are available.

### 2.9 Safety Before Capability Principle

A capability is not enabled merely because a model can perform it.

Religious integrity, privacy, abuse resistance, reversibility, evaluation quality, operational ownership, provider reliability, and safe fallback must be approved before release.

### 2.10 Continuous Evaluation Principle

AI quality is not established once. Every enabled capability must be evaluated continuously across model versions, prompt versions, languages, regions, retrieval changes, provider changes, and representative failure cases.

Evaluation regressions can block deployment, reduce routing eligibility, or disable a capability.

### 2.11 No Vendor Lock-in Principle

No AI provider may own Alsamad’s canonical prompts, task taxonomy, retrieval corpus, evaluation datasets, conversation history, embeddings strategy, routing policy, or product state.

Quran.Foundation Content and Quran.Foundation User API data must not be used for training, fine-tuning, embeddings, RAG corpora, or evaluation datasets without explicit written permission covering that exact use. Private User API data is excluded from AI corpora regardless of technical availability. This restriction does not expand Release 1 AI scope.

Provider replacement must remain operationally and contractually possible.

### 2.12 AI Evolution Principle

AI architecture evolves through additive, governed changes. New providers, models, modalities, evaluation methods, and inference locations must integrate through stable contracts rather than forcing platform-wide redesign.

Historical prompt, model, routing, and evaluation versions remain traceable where required for audit and reproducibility.

### 2.13 Prompt Ownership Principle

Every production prompt family has exactly one accountable operational owner. Drafting and maintenance may be delegated; ownership may not.

The owner is accountable for purpose, scope, review, evaluation, deprecation, incident response, and compatibility with content and governance rules.

### 2.14 Evidence Integrity Principle

AI may not alter, merge, invent, silently omit, or misattribute evidence in a way that changes its meaning.

Citations must resolve to approved, retrievable sources. Retrieved passages must preserve source identity, content version, locale, scope, and applicability. Generated summaries must not be represented as source quotations.

### 2.15 Operational Cost Awareness Principle

Cost is a first-class operational property, but never overrides religious safety, privacy, evidence integrity, or required quality.

Routing should use the least expensive approved model that satisfies the task’s measured quality, latency, privacy, and safety requirements.

### 2.16 AI Replaceability Principle

Every AI provider, model, embedding engine, reranker, speech system, OCR engine, or inference backend must be replaceable without requiring application-wide redesign.

The application must depend only on stable internal AI contracts. Vendor-specific APIs must remain isolated behind provider adapters.

Switching providers must not require changes to business logic, product workflows, or canonical platform data.

This principle guarantees long-term independence from any single AI vendor.

### 2.17 Canonical Truth Principle

Artificial Intelligence never becomes the source of truth.

Canonical religious content, editorial decisions, governance rules, user accounts, permissions, subscriptions, and platform state always remain outside the AI layer.

AI may:

- retrieve;
- summarize;
- classify;
- explain;
- translate;
- recommend.

AI may never redefine or replace canonical platform data. The database and approved editorial workflows remain the authoritative source of truth.

### 2.18 AI Degradation Principle

The platform must continue operating safely if AI becomes unavailable.

Loss of AI should reduce capabilities rather than disable the platform.

Core experiences—including:

- Quran reading;
- authenticated devotional content;
- deterministic search;
- prayer information;
- Hijri calendar;
- verified editorial content;
- localization;
- navigation;

must remain fully usable without AI services.

AI is an enhancement layer—not a platform dependency.

### 2.19 Human-Reviewed Religious Publication Principle

AI-assisted religious content is treated as draft material until it completes the approved source, language, religious, and publication workflow.

No prompt, provider, model score, citation count, or automated evaluation can substitute for the required authorized human review.

### 2.20 Automation with Oversight Principle

Automation reduces repetitive work but does not replace accountable judgment.

AI may classify, prioritize, summarize, detect anomalies, prepare drafts, recommend actions, assist search, and assist translation. It may not independently publish or approve religious content, change governance rules, bypass review, or execute irreversible administrative actions.

---

## 3. Authority and Source-of-Truth Boundaries

### 3.1 Canonical platform authority

The following remain outside the AI layer and authoritative in their owning modules:

- Quran text and canonical identifiers;
- authenticated devotional content;
- transmitted-source references;
- Editorial General Dua records;
- translations and their approval states;
- publication, correction, supersession, and withdrawal decisions;
- governance policies;
- accounts, permissions, roles, and grants;
- prayer calculation configuration;
- Hijri adjustments;
- locale and region configuration;
- subscriptions and payments when later authorized;
- moderation and appeal decisions when later authorized;
- operational configuration and feature flags.

AI outputs are never written into these records as authoritative facts without an explicit owning workflow and required human approval.

### 3.2 Runtime output status

Runtime AI output is ephemeral explanatory output unless a separately governed workflow captures it as a draft.

Runtime output:

- is not canonical religious truth;
- is not automatically editorial content;
- is not a publication decision;
- is not a moderation decision;
- is not evidence merely because it contains a citation-shaped string;
- does not modify user permissions, subscriptions, or platform state.

### 3.3 AI-assisted editorial status

AI-assisted editorial material must carry provenance including:

- task type;
- prompt version;
- model/provider route;
- retrieval corpus version where applicable;
- citations or evidence references;
- generation timestamp;
- responsible editor;
- review and publication state.

The final published record is owned by the relevant content module, not by the AI module.

### 3.4 Deterministic systems remain primary where sufficient

AI must not replace deterministic logic for:

- Quran navigation;
- exact canonical lookup;
- prayer calculations;
- Hijri configuration;
- permissions and authorization;
- publication-state filtering;
- redirects and canonical URLs;
- locale selection;
- audit logging;
- safety-critical workflow gates.

---

## 4. AI Domain Architecture

The AI architecture is a modular capability layer composed of stable internal domains.

### 4.1 Core AI domains

- AI Task Contracts
- Provider and Model Registry
- Provider Adapters
- Model Routing
- Retrieval Orchestration
- Corpus Governance
- Ranking and Reranking
- Citation and Grounding Validation
- Prompt Library and Prompt Governance
- Runtime Safety and Guardrails
- Memory and Context Management
- Privacy and Data-Minimization Policy
- Evaluation and Benchmarking
- Observability and Cost Accounting
- AI Incident Management
- Administrative AI Operations

### 4.2 Ownership boundaries

Each durable AI concept must have one owner:

| Concept                                  | Owning domain                  |
| ---------------------------------------- | ------------------------------ |
| Task definition                          | AI Task Contracts              |
| Provider configuration metadata          | Provider and Model Registry    |
| Vendor-specific request/response mapping | Provider Adapter               |
| Model selection policy                   | Model Routing                  |
| Approved corpus eligibility              | Corpus Governance              |
| Retrieval execution                      | Retrieval Orchestration        |
| Prompt template and versions             | Prompt Library                 |
| Safety policy                            | Runtime Safety                 |
| Evaluation dataset and run               | Evaluation                     |
| Runtime traces and metrics               | Observability                  |
| Incident record                          | AI Incident Management         |
| Canonical religious or editorial data    | Relevant non-AI content module |

### 4.3 Stable internal contracts

All AI calls use provider-independent task contracts. A task contract defines:

- task identifier and version;
- allowed input fields;
- prohibited input fields;
- data classification;
- required retrieval policy;
- required citation policy;
- expected structured output;
- refusal and unknown behavior;
- latency class;
- cost class;
- minimum evaluation threshold;
- allowed model capabilities;
- regional-processing restrictions;
- logging and retention policy;
- fallback behavior.

Business modules call task contracts, never vendor SDKs directly.

---

## 5. AI Capability Architecture

### 5.1 AI Search Assistant

Purpose: help users formulate natural-language queries and understand results from approved Alsamad corpora.

Rules:

- retrieval is required before religious explanation;
- deterministic exact search remains available;
- canonical results are ranked independently from model preference;
- cited sources are visible;
- the assistant may state that no approved answer was found;
- AI unavailability must fall back to deterministic search.

### 5.2 Knowledge Assistant

Purpose: explain approved platform knowledge in accessible language.

It may:

- summarize retrieved approved material;
- compare approved explanations while preserving distinctions;
- clarify terminology;
- guide users to source pages.

It may not:

- create new religious rulings;
- merge incompatible evidence silently;
- present unsupported certainty;
- replace the source page.

### 5.3 Personal Marriage Advisor — Approved Later Module

Purpose: offer structured, non-authoritative support around marriage preparation and relationship questions within approved product and religious boundaries.

Required before activation:

- separately approved scope and safety policy;
- crisis and abuse escalation procedures;
- privacy and retention design;
- religious-review corpus;
- clear non-fatwa and non-therapy positioning;
- age and vulnerability safeguards;
- evaluation for harmful advice, coercion, and cultural bias;
- human escalation paths.

### 5.4 Translation Assistant

Purpose: assist translators with draft translations, terminology consistency, and comparison.

Rules:

- canonical content is never duplicated as a new religious record by language;
- machine output is always a draft;
- Quran text is never machine-rewritten as canonical Quran;
- transmitted religious meaning must retain source references;
- approved language reviewers remain responsible;
- terminology memories are governed and versioned;
- low-confidence or ambiguous passages are flagged rather than guessed.

### 5.5 Editorial Assistant

Purpose: help authorized staff prepare summaries, outlines, metadata, comparisons, and draft explanations.

The assistant may not publish. It must preserve editorial ownership, revision history, evidence links, and review separation.

### 5.6 Content Classification

Purpose: suggest controlled categories, topics, content types, risk labels, and queue routing.

Classification remains advisory unless a separately approved deterministic rule accepts it. High-impact classifications require human confirmation.

### 5.7 Semantic Search — Future / Research

Semantic search may supplement but not replace exact deterministic search.

It requires:

- approved embedding corpora;
- multilingual benchmark coverage;
- stable canonical entity links;
- safety and privacy review;
- index rebuildability;
- no embedding of prohibited private data;
- deterministic fallback;
- explainable source results.

### 5.8 Topic Discovery — Future / Research

AI may suggest emerging clusters, missing taxonomy relationships, or content gaps. It may not create authoritative topics or knowledge-graph relations without editorial review.

### 5.9 Recommendation Assistance — Prepared / Later

Recommendations may help users discover relevant approved content. They must not:

- rank religious truth by engagement or payment;
- infer sensitive personal traits without authorization;
- hide why an item was recommended;
- create filter bubbles around religious content;
- operate without deterministic fallback and opt-out controls where personalization is used.

### 5.10 Editorial Draft Assistance

AI may create draft titles, summaries, outlines, FAQs, metadata, accessibility descriptions, and internal-linking suggestions. Draft status and provenance must remain visible to reviewers.

### 5.11 Metadata Generation

AI may propose:

- titles;
- descriptions;
- keywords;
- structured summaries;
- accessibility text;
- internal-link candidates.

Generated metadata must be validated against canonical entities, locale rules, SEO policy, and publication workflow.

### 5.12 Internal Linking Suggestions

Suggestions must resolve to real canonical entities and published routes. AI may not invent URLs, hidden SEO links, or relationships unsupported by explicit platform data.

### 5.13 Accessibility Assistance

AI may assist with:

- plain-language alternatives;
- alt-text drafts;
- transcription drafts;
- content simplification;
- reading-level suggestions;
- interface copy review.

Accessibility output remains reviewable, locale-aware, and subject to source fidelity.

### 5.14 Administrative Assistance

AI may assist administrators by:

- summarizing queues;
- detecting anomalies;
- identifying overdue reviews;
- proposing classifications;
- comparing revisions;
- preparing incident summaries;
- identifying missing citations;
- suggesting safe operational actions.

It may not independently approve, publish, withdraw, grant permissions, alter governance, or execute irreversible actions.

---

## 6. Retrieval-Augmented Generation Architecture

### 6.1 RAG purpose

RAG constrains model output to approved, traceable platform knowledge. It is not a mechanism for making unapproved web content authoritative.

### 6.2 Retrieval pipeline

A standard retrieval request proceeds through:

1. **Request classification** — determine task, locale, region, sensitivity, and religious relevance.
2. **Policy resolution** — choose approved corpus, retrieval method, citation requirement, and safety rules.
3. **Query normalization** — preserve original intent while applying locale-aware normalization.
4. **Exact retrieval** — search canonical identifiers, names, verses, phrases, topics, and deterministic indexes.
5. **Lexical retrieval** — retrieve approved text using conventional search.
6. **Semantic retrieval** — only when separately approved and available.
7. **Permission and publication filtering** — exclude private, withdrawn, draft, archived, or unauthorized material.
8. **Scope filtering** — apply locale, region, content type, source authority, and effective-period constraints.
9. **Deduplication** — collapse duplicate translations, versions, and overlapping passages without losing provenance.
10. **Ranking** — rank by task policy and source suitability, never by provider preference or commercial value.
11. **Reranking** — optional replaceable reranker behind an internal contract.
12. **Evidence sufficiency check** — decide whether enough approved evidence exists.
13. **Context assembly** — create a bounded evidence package with source identifiers and citation anchors.
14. **Generation** — ask the routed model to answer only within the evidence package and task policy.
15. **Citation validation** — confirm every claim citation resolves and supports the claim.
16. **Safety validation** — apply religious, privacy, and abuse guardrails.
17. **Response presentation** — label AI assistance, evidence, uncertainty, and fallback status.

### 6.3 Approved corpora

A corpus may be used only when it has:

- a named owner;
- defined content scope;
- approved publication states;
- source and licensing policy;
- locale and region applicability;
- version and freshness semantics;
- correction and withdrawal propagation;
- deterministic identifiers;
- retention and access policy;
- evaluation coverage.

Approved corpora may include:

- canonical Quran records and approved translations;
- authenticated devotional content;
- approved Editorial General Dua content, clearly labeled as editorial;
- approved platform guides and explanatory content;
- approved prayer and Hijri documentation;
- approved governance and help content for internal administrative tasks.

Draft, withdrawn, private, or unreviewed content is excluded unless an internal task explicitly authorizes it for a named reviewer.

### 6.4 Corpus versioning

Every retrieval result must be reproducible against a corpus version or source revision where operationally required.

Corrections and withdrawals must propagate to retrieval indexes through governed invalidation or rebuild processes. Derived indexes are disposable and never become the canonical source.

### 6.5 Ranking architecture

Ranking may use deterministic and learned signals, but policy controls the eligible signals.

Allowed signals can include:

- exact match;
- canonical source priority;
- content-type suitability;
- locale fit;
- region applicability;
- publication status;
- source authority;
- freshness where relevant;
- semantic relevance when approved.

Prohibited religious-ranking signals include:

- advertiser payment;
- subscription tier;
- affiliate value;
- popularity alone;
- engagement alone;
- provider preference;
- model confidence without evidence.

### 6.6 Citation architecture

Citations are structured references, not model-generated prose.

A citation includes:

- canonical source identifier;
- source type;
- content revision or version;
- locale;
- exact passage or anchor;
- retrieval timestamp where relevant;
- visibility and publication state;
- optional source URL generated by trusted route helpers.

The model receives citation handles and may reference only those handles. The runtime resolves handles into user-visible citations after validation.

### 6.7 Grounding requirements

Religious and factual claims must be traceable to retrieved evidence. A grounded answer must:

- distinguish direct source content from editorial explanation;
- avoid claiming more than the evidence supports;
- preserve disagreement or uncertainty when present;
- avoid merging unrelated evidence;
- cite at the granularity required by the task;
- identify when the answer is a summary rather than a quotation.

### 6.8 Unknown handling

When approved evidence is absent, insufficient, conflicting, stale beyond policy, or outside scope, the system must choose an explicit fallback:

- “I do not have sufficient approved evidence”;
- deterministic search results without generated interpretation;
- a narrower answer;
- a clarifying question;
- a link to approved source pages;
- human escalation;
- refusal where safety requires it.

The system must not fill evidence gaps from model memory.

### 6.9 Confidence model

Confidence is not a single model probability. It is a structured assessment derived from:

- retrieval coverage;
- source authority;
- citation support;
- evidence consistency;
- locale quality;
- task-specific evaluation history;
- model reliability for that task;
- freshness where applicable.

Confidence is advisory and must not override blocking safety or review requirements.

### 6.10 Hallucination prevention

The architecture reduces hallucination through:

- retrieval-before-generation;
- approved-corpus filtering;
- constrained structured outputs;
- citation handles;
- claim-to-citation validation;
- evidence-sufficiency gates;
- unknown and refusal behavior;
- prompt policies prohibiting unsupported claims;
- post-generation validation;
- continuous benchmarks;
- model routing based on measured task quality;
- human review for published religious material.

No architecture can guarantee zero hallucinations. The system must therefore remain transparent, reversible, evaluated, and non-canonical.

### 6.11 RAG fallback behavior

If retrieval, reranking, citation validation, or generation fails:

- canonical source pages remain accessible;
- deterministic search remains usable;
- no partial unvalidated answer is presented as grounded;
- the failure is recorded according to privacy policy;
- provider fallback may be attempted only through an approved route;
- religious safety requirements remain unchanged during fallback.

---

## 7. Model Abstraction Layer

### 7.1 Provider-independent architecture

Supported provider families may include:

- OpenAI;
- Anthropic;
- Google;
- DeepSeek;
- Qwen;
- Llama-based providers;
- future proprietary providers;
- future open-weight runtimes;
- local or self-hosted inference.

These names are examples, not architectural dependencies.

### 7.2 Provider adapter responsibilities

Each adapter owns:

- authentication and transport;
- provider request mapping;
- response normalization;
- tool/function schema mapping;
- structured-output enforcement;
- timeout and retry translation;
- provider error normalization;
- token/usage normalization;
- safety-setting mapping;
- regional endpoint configuration;
- streaming normalization;
- provider-specific telemetry;
- capability discovery where supported.

Adapters must not own product policy, canonical prompts, religious rules, business workflows, or platform data.

### 7.3 Internal model capability descriptors

Models are registered by measured and declared capabilities such as:

- text generation;
- structured output;
- tool use;
- translation;
- classification;
- long-context reasoning;
- embeddings;
- reranking;
- speech recognition;
- speech synthesis;
- OCR;
- vision;
- multimodal reasoning;
- local/private inference;
- supported languages;
- region availability;
- maximum approved data classification.

Provider marketing labels are not accepted as evidence of task suitability. Evaluation results determine eligibility.

### 7.4 Normalized response envelope

All providers return a normalized internal envelope containing:

- task and invocation identifiers;
- provider and model version;
- output content or structured data;
- finish status;
- normalized usage;
- latency;
- refusal category;
- safety flags;
- tool calls;
- provider trace reference where permitted;
- errors and retryability;
- no canonical platform mutation.

### 7.5 Provider failure isolation

A provider outage, quota error, policy change, regional restriction, or model removal must remain isolated. Routing may choose another approved provider or deterministic fallback without changing business logic.

### 7.6 Provider onboarding gate

A provider is not production-eligible until it has:

- legal and privacy review;
- regional-processing assessment;
- data-retention and training-use assessment;
- security review;
- adapter conformance tests;
- task-specific evaluations;
- cost and latency benchmarks;
- operational owner;
- incident and disablement procedure;
- documented fallback behavior.

---

## 8. Model Routing Architecture

### 8.1 Task-based routing

Routing selects a model for a defined task, not for the entire application.

Distinct routes may exist for:

- translation;
- reasoning;
- classification;
- summarization;
- metadata generation;
- semantic indexing;
- embeddings;
- reranking;
- chat;
- future speech;
- future OCR;
- future multimodal tasks.

### 8.2 Routing inputs

Routing may consider:

- task contract;
- evaluation eligibility;
- language and script;
- data classification;
- religious-safety class;
- required context size;
- structured-output requirement;
- latency objective;
- cost ceiling;
- region and residency requirement;
- provider availability;
- local inference availability;
- current error rate;
- approved fallback order.

### 8.3 Routing exclusions

Routing must not use:

- provider commercial incentives;
- undocumented model preference;
- user payment tier to reduce religious accuracy;
- hidden experiments on high-risk religious tasks;
- a model that has not passed the task’s minimum evaluation threshold;
- a route that violates privacy or regional policy.

### 8.4 Complexity-aware routing

Simple approved tasks may use lower-cost models. Complex or high-risk tasks may use stronger models, additional retrieval, multi-stage validation, or human escalation.

Complexity estimation itself is governed and cannot reduce required religious safeguards.

### 8.5 Fallback routing

Fallback is explicit and task-specific:

1. retry the same route only when the failure is retryable;
2. route to another approved equivalent model;
3. reduce optional capability while preserving correctness;
4. use deterministic output;
5. return an explicit temporary-unavailability response;
6. escalate to human review where applicable.

### 8.6 Multi-model pipelines

A task may use several replaceable stages:

- query classifier;
- retriever;
- reranker;
- generator;
- citation validator;
- safety classifier;
- response formatter.

Each stage uses a stable internal contract and has independent evaluation and fallback.

### 8.7 Routing policy versioning

Production decisions are attributable to a routing-policy version. Changes require review, evaluation evidence, rollout controls, rollback, and audit.

---

## 9. Prompt Architecture

### 9.1 Prompt Library

Prompts are governed operational assets, not scattered strings in application code.

The Prompt Library defines:

- prompt family;
- task contract;
- purpose;
- owner;
- locale strategy;
- required context schema;
- prohibited inputs;
- output schema;
- religious and safety instructions;
- citation requirements;
- refusal behavior;
- compatible model capabilities;
- evaluation suite;
- lifecycle status.

### 9.2 Prompt composition

Prompts may be composed from governed layers:

- constitutional platform instructions;
- task instructions;
- locale instructions;
- safety policy;
- evidence context;
- structured output schema;
- user request;
- optional approved preferences.

User input and retrieved content are clearly delimited as untrusted data, not executable instructions.

### 9.3 Prompt versioning

Every production prompt has an immutable version identifier. New behavior requires a new version.

Version metadata includes:

- owner;
- author;
- reviewer;
- creation date;
- change summary;
- compatible tasks and models;
- evaluation results;
- approval state;
- release date;
- deprecation or withdrawal state;
- superseded version.

### 9.4 Prompt testing

Prompt tests include:

- expected structured outputs;
- religious accuracy cases;
- citation adherence;
- unknown handling;
- adversarial instruction injection;
- privacy minimization;
- multilingual quality;
- refusal behavior;
- deterministic regression fixtures;
- provider comparison.

### 9.5 Prompt review

Prompts used for religious explanation require appropriate religious-safety review. Translation prompts require language-review ownership. Administrative prompts require operational-owner review. High-impact changes require separation of author and approver.

### 9.6 Prompt ownership

Every prompt family has exactly one accountable owner. Ownership does not automatically grant publication, provider administration, or governance authority.

### 9.7 Prompt deprecation

Deprecated prompts stop receiving new traffic after a controlled transition. Historical versions remain traceable for audits and incident reproduction according to retention policy.

### 9.8 Prompt audit

Prompt publication, routing changes, overrides, emergency disablement, and deprecation are auditable. Audit metadata must not unnecessarily store raw sensitive user content.

### 9.9 Prompt injection defense

The architecture treats user input, retrieved text, external documents, and model output as untrusted.

Controls include:

- strict role and content separation;
- retrieval-source allowlists;
- tool permissions outside the prompt;
- structured output validation;
- no secrets in prompts;
- no provider credentials in context;
- instruction-conflict detection;
- refusal of retrieved instructions that attempt to override system policy;
- post-generation validation.

---

## 10. Religious Safety Architecture

### 10.1 Prohibited behavior

AI may never:

- invent Quran text;
- alter Quran text and represent it as Quran;
- invent Hadith;
- invent chains, gradings, narrators, citations, scholars, books, verses, or source locations;
- invent religious rewards, virtues, obligations, prohibitions, or consensus;
- issue an independent fatwa;
- conceal uncertainty;
- represent editorial wording as transmitted revelation;
- present Editorial General Dua as Quranic or Prophetic Dua;
- bypass human religious review;
- publish religious content autonomously.

### 10.2 Religious response classes

Religious tasks are classified by risk and permitted behavior:

| Class                            | Example                            | Required behavior                                                           |
| -------------------------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| Canonical retrieval              | Show a verse or approved dhikr     | Deterministic source retrieval; no generative alteration                    |
| Grounded explanation             | Explain approved content           | Retrieval, citations, visible editorial/AI distinction                      |
| Comparative explanation          | Summarize approved viewpoints      | Preserve attribution, disagreement, and scope                               |
| Personal guidance                | Apply approved general guidance    | Evidence, uncertainty, non-fatwa boundary, escalation where needed          |
| Fatwa or scholar-specific ruling | User requests authoritative ruling | Do not issue independently; refer to qualified authority or approved source |
| Unsupported or ambiguous claim   | No approved evidence               | State unknown or refuse to speculate                                        |

### 10.3 Evidence explanation

Religious responses must explain their evidentiary basis in an appropriate form:

- direct canonical source;
- authenticated transmitted content;
- approved editorial explanation;
- scope and limitations;
- uncertainty or disagreement;
- why the system cannot answer when evidence is insufficient.

### 10.4 Quran handling

Quran text must be retrieved from canonical records. Models may explain, summarize approved commentary, or assist navigation, but may not generate Quran text from memory for canonical display.

### 10.5 Hadith handling

Hadith capability remains an Approved Later Module unless separately authorized. Before activation it requires canonical source records, authentication/grade representation, scholar-reviewed policy, citation validation, and evaluation datasets.

### 10.6 Dua and dhikr handling

The system preserves the distinction among:

- Quranic Dua;
- Prophetic Dua;
- Authenticated Dhikr;
- Editorial General Dua.

AI output must not erase these categories or imply transmitted provenance for editorial content.

### 10.7 Publication review

Any AI-assisted religious draft intended for publication must pass the same or stricter workflow as human-authored material:

- source verification;
- content-type validation;
- language review;
- religious review;
- editorial review;
- publication approval;
- audit and rollback readiness.

### 10.8 Escalation

Escalation is required when:

- the user requests a fatwa beyond approved source explanation;
- evidence conflicts materially;
- a claim could affect worship, marriage, divorce, inheritance, financial obligations, safety, abuse, or legal status;
- citation validation fails;
- the model produces prohibited religious content;
- evaluation or runtime monitoring identifies a serious religious-safety incident.

---

## 11. Runtime Safety Architecture

### 11.1 Safety pipeline

A runtime request passes through:

1. input validation;
2. task and risk classification;
3. privacy minimization;
4. abuse and rate-limit checks;
5. retrieval and evidence policy;
6. model routing;
7. constrained generation;
8. structured-output validation;
9. citation validation;
10. safety and religious-policy validation;
11. confidence/unknown handling;
12. safe rendering;
13. privacy-preserving telemetry.

### 11.2 Refusal policies

Refusals are task-specific, transparent, and useful. A refusal should state the boundary and, where safe, provide:

- approved source links;
- deterministic search;
- a narrower supported task;
- qualified human escalation;
- emergency or professional resources when appropriate.

### 11.3 Uncertainty handling

The system must communicate uncertainty when:

- evidence is incomplete;
- sources conflict;
- the task is outside corpus scope;
- a translation is ambiguous;
- the model is not evaluated for the language or domain;
- provider output cannot be validated.

Uncertainty must not be hidden by confident wording.

### 11.4 Citation validation

Citation validation checks:

- handle exists;
- source is eligible and visible;
- cited passage supports the associated claim;
- citation was not fabricated or altered;
- source version is current enough for the task;
- withdrawn content is not cited;
- generated quotation is not mislabeled as verbatim source text.

A response failing required citation validation is blocked, regenerated under policy, downgraded to deterministic results, or returned as unknown.

### 11.5 Confidence estimation

Confidence is policy-driven and evidence-aware. It may be shown as qualitative states rather than misleading precision:

- supported;
- supported with limitations;
- uncertain;
- conflicting evidence;
- insufficient approved evidence.

### 11.6 Guardrails

Guardrails include:

- task allowlists;
- provider/model allowlists;
- output schemas;
- retrieval corpus restrictions;
- tool permissions;
- maximum context and data classification;
- blocked content categories;
- provider-specific safety settings where compatible;
- independent post-generation validation;
- human escalation.

### 11.7 Rate limits and abuse protection

Rate limits may be scoped by:

- anonymous client;
- authenticated account;
- task class;
- cost class;
- provider quota;
- abuse risk;
- region;
- administrative role.

Rate limiting must not expose hidden sensitive classifications. Abuse protection must preserve access to non-AI core content.

### 11.8 Tool-use safety

Models may not directly execute privileged actions. Tools are exposed through explicit capability grants with:

- authenticated actor;
- authorization check outside the model;
- input schema validation;
- read/write distinction;
- transaction boundary;
- confirmation for high-impact actions;
- audit trail;
- idempotency where required;
- rollback or compensating action;
- denial of governance bypass.

### 11.9 Irreversible actions

AI cannot independently perform irreversible administrative actions. It may prepare a proposed action for an authorized human to review and execute through the owning workflow.

---

## 12. AI Memory and Context Architecture

### 12.1 Memory classes

The architecture separates:

1. **Temporary conversation context** — short-lived context required for the current interaction.
2. **Approved user preferences** — explicit preferences such as language, presentation style, or enabled assistance.
3. **Optional long-term memory** — separately consented, user-visible, editable, and deletable memory.
4. **Runtime retrieval** — approved platform knowledge fetched for a task and not treated as personal memory.

### 12.2 No hidden permanent memory

The platform must not silently create permanent personal memory from conversations, inferred traits, sensitive religious questions, relationship concerns, or administrative interactions.

### 12.3 User control

Optional long-term memory must provide:

- explicit enablement;
- clear description of what may be stored;
- per-item visibility where practical;
- correction and deletion;
- disablement;
- export where required;
- retention limits;
- no effect on canonical religious truth.

### 12.4 Approved preferences

Preferences are structured canonical user settings, not opaque model-generated profile summaries. Examples may include:

- preferred locale;
- response length;
- accessibility preference;
- citation display preference;
- whether optional personalization is enabled.

### 12.5 Context minimization

The context builder selects only relevant, authorized information. Full histories are not automatically forwarded to providers.

### 12.6 Memory isolation

Memory is isolated by account and authorization scope. Administrative, household, subscription, or Talibeen data cannot be mixed into a user request without explicit task need and permission.

### 12.7 Sensitive inference prohibition

AI must not create hidden permanent inferences about sect, health, abuse history, sexuality, political beliefs, financial state, or family status. Any later feature requiring sensitive processing needs separate approval and safeguards.

---

## 13. Privacy and Data Governance

### 13.1 Data minimization

Each task contract defines an explicit input allowlist. The orchestration layer removes fields not needed for the task before provider routing.

### 13.2 Data classifications

AI processing policy distinguishes at least:

- public canonical content;
- public editorial content;
- internal operational data;
- private account data;
- sensitive personal data;
- restricted religious-review or moderation material;
- secrets and credentials, which are never model inputs.

### 13.3 Retention

Retention is purpose-specific. Default principles:

- raw prompts and responses are not retained indefinitely;
- sensitive content receives shorter or zero raw retention where feasible;
- evaluation fixtures use de-identified or synthetic cases unless real cases are explicitly governed;
- provider retention settings are configured to the most restrictive available approved mode;
- operational aggregates may be retained longer when they cannot reconstruct user content;
- audit retention follows governance and legal requirements.

### 13.4 Anonymization and pseudonymization

Before provider processing, identifiers should be removed, replaced, generalized, or tokenized when the task does not require them.

Anonymization claims must be technically justified; simple deletion of a name is not sufficient when content remains identifiable.

### 13.5 Provider isolation

Providers receive only the data authorized for the routed task. One provider does not gain access to another provider’s credentials, traces, evaluations, or private configuration.

### 13.6 Training-use controls

Alsamad must prefer provider configurations and contracts that prevent customer data from being used for provider training unless separately, explicitly authorized. Provider policy changes trigger review.

### 13.7 Regional processing

Routing may enforce regional or self-hosted processing based on:

- user region;
- data classification;
- legal requirements;
- organizational policy;
- provider availability;
- task sensitivity.

Regional processing must not fragment canonical religious data. It changes execution location, not truth ownership.

### 13.8 Self-hosted compatibility

Task contracts, prompts, retrieval, output schemas, evaluations, and observability must remain usable with self-hosted inference. Self-hosting does not waive security, evaluation, licensing, or operational requirements.

### 13.9 Provider logs and diagnostics

Provider-side logs must be minimized and configured according to policy. Debug mode must not expose raw sensitive prompts, credentials, or private retrieval context.

### 13.10 Deletion propagation

Where personal AI records are retained, deletion must propagate to owned storage and any approved derived personal indexes. Canonical public content and aggregate non-personal metrics are governed separately.

---

## 14. AI Evaluation Architecture

### 14.1 Evaluation purpose

Evaluation determines whether a model, prompt, retrieval configuration, and routing policy are eligible for a task. It is not a promotional score.

### 14.2 Evaluation dimensions

Required dimensions include:

- religious accuracy;
- citation accuracy;
- evidence completeness;
- hallucination rate;
- refusal correctness;
- uncertainty honesty;
- translation quality;
- search quality;
- editorial usefulness;
- classification accuracy;
- safety-policy adherence;
- privacy leakage;
- prompt-injection resistance;
- latency;
- availability;
- cost;
- multilingual parity.

### 14.3 Benchmark datasets

Evaluation datasets are governed assets with:

- owner;
- purpose;
- task and locale scope;
- source and licensing record;
- sensitivity classification;
- expected outputs or scoring rubric;
- reviewer approval;
- version;
- change history;
- contamination controls;
- retirement policy.

### 14.4 Religious accuracy evaluation

Religious benchmarks must be developed or approved by qualified reviewers and cover:

- exact Quran retrieval;
- source attribution;
- authenticated-content boundaries;
- Editorial General Dua distinction;
- unsupported reward claims;
- invented Hadith and sources;
- fatwa boundary;
- disagreement and uncertainty;
- multilingual preservation of meaning;
- refusal and escalation.

Automated scoring may assist, but authorized human review remains necessary for benchmark creation and high-risk evaluation.

### 14.5 Citation accuracy

Citation evaluation measures:

- citation existence;
- source eligibility;
- claim support;
- granularity;
- attribution correctness;
- omission of material conflicting evidence;
- fabricated citation rate;
- quotation fidelity.

### 14.6 Translation quality

Translation evaluation includes:

- source fidelity;
- religious terminology;
- Arabic preservation where required;
- fluency;
- ambiguity handling;
- locale appropriateness;
- consistency;
- omission and addition rates;
- distinction between canonical and editorial content.

### 14.7 Hallucination rate

Hallucination is evaluated by task and severity, not only a global average. Invented Quran, Hadith, citations, or religious rewards are critical failures regardless of aggregate score.

### 14.8 Search quality

Search benchmarks include:

- exact-match preservation;
- canonical entity retrieval;
- multilingual query handling;
- relevance;
- source diversity where appropriate;
- unknown query behavior;
- no leakage of drafts or withdrawn content;
- deterministic fallback.

### 14.9 Editorial usefulness

Editorial evaluations measure whether assistance reduces work while preserving quality. Metrics may include:

- accepted suggestion rate;
- correction effort;
- citation completeness;
- reviewer time;
- harmful or misleading suggestion rate;
- consistency across locales.

Acceptance rate alone is not a quality measure.

### 14.10 Latency and cost

Latency and cost are measured per task, model, provider, locale, context size, and routing policy. Quality and safety thresholds remain mandatory.

### 14.11 Evaluation gates

A model/prompt/route can be:

- eligible;
- eligible with limitations;
- shadow-only;
- internal-only;
- blocked;
- deprecated.

Production eligibility requires passing all blocking task thresholds.

### 14.12 Regression evaluation

Changes to model versions, prompt versions, retrieval, ranking, corpora, safety policies, or provider adapters trigger the relevant regression suite before broad rollout.

### 14.13 Shadow and canary evaluation

New routes may run in shadow mode without affecting user output, using privacy-approved requests or evaluation traffic. Canary rollout must exclude prohibited high-risk experimentation and include rapid rollback.

---

## 15. Observability and Audit Architecture

### 15.1 AI audit trail

Privileged and policy-relevant AI operations require an append-oriented audit trail, including:

- prompt publication or deprecation;
- model eligibility changes;
- provider configuration changes;
- routing-policy changes;
- benchmark changes;
- evaluation overrides;
- safety incident actions;
- emergency disablement;
- human escalation decisions;
- AI-assisted editorial provenance.

### 15.2 Runtime trace

A privacy-preserving runtime trace may include:

- invocation identifier;
- task version;
- route version;
- provider and model version;
- prompt version;
- corpus/index version;
- retrieval and citation counts;
- safety outcome;
- refusal/unknown status;
- latency;
- normalized usage and cost;
- error category;
- no unnecessary raw sensitive content.

### 15.3 Evaluation history

Evaluation results remain attributable to:

- dataset version;
- evaluator version;
- model/provider version;
- prompt version;
- retrieval configuration;
- run timestamp;
- reviewer and override decisions.

### 15.4 Provider metrics

Provider monitoring includes:

- success and error rates;
- timeout rate;
- latency distribution;
- quota use;
- rate-limit events;
- regional availability;
- structured-output failures;
- safety/refusal behavior;
- model-version drift;
- contract or policy changes.

### 15.5 Cost metrics

Cost monitoring includes:

- cost per task;
- cost per successful grounded answer;
- cost by provider/model;
- cost by locale and region;
- retry and fallback cost;
- batch versus interactive cost;
- local infrastructure amortization where applicable;
- budget alerts and anomaly detection.

### 15.6 Failure monitoring

Failures are categorized:

- retrieval failure;
- insufficient evidence;
- citation failure;
- provider failure;
- structured-output failure;
- safety block;
- privacy policy block;
- routing failure;
- latency timeout;
- budget block;
- user cancellation;
- unknown internal failure.

### 15.7 Privacy-preserving logs

Logs use identifiers and aggregates where possible. Raw prompts or responses are accessed only under approved incident or evaluation workflows with least privilege and audit.

### 15.8 Service-level objectives

AI service objectives are separate from core-platform objectives. AI failure must not reduce availability of canonical reading, deterministic search, prayer, Hijri calendar, localization, or navigation.

---

## 16. Cost and Capacity Strategy

### 16.1 Multi-tier inference

The architecture supports:

- premium cloud models;
- lower-cost cloud models;
- open-weight hosted models;
- local inference;
- self-hosted inference;
- batch inference;
- future dedicated GPU servers.

### 16.2 Cost-aware routing

Routing selects the least expensive eligible route that satisfies:

- task quality threshold;
- religious-safety threshold;
- privacy classification;
- latency objective;
- context requirement;
- region requirement;
- current reliability.

### 16.3 Caching

Caching may be used only where content, privacy, correction propagation, and freshness policies permit it.

Safe cache candidates may include:

- public non-personal embeddings;
- deterministic retrieval results;
- approved repeated public explanations tied to content versions;
- translation-assistance intermediate artifacts inside editorial workflows.

Personal or sensitive responses require stricter policy and generally should not be shared across users.

### 16.4 Batch processing

Non-interactive tasks such as classification, metadata suggestions, evaluation, embedding generation, and corpus maintenance may use batch inference to reduce cost.

Batch output remains subject to review, validation, and failure isolation.

### 16.5 Budget controls

Budgets may be configured by:

- environment;
- task;
- provider;
- model;
- team;
- locale;
- region;
- release phase.

Budget exhaustion degrades optional AI capability rather than disabling core platform journeys.

### 16.6 Local GPU strategy

Future GPU infrastructure must be justified by measured workload, privacy need, latency, licensing, operational capacity, and total cost—not by model ownership alone.

Self-hosted capacity requires:

- model and license registry;
- secure deployment;
- resource isolation;
- observability;
- autoscaling or admission control;
- rollback;
- evaluation parity;
- hardware lifecycle planning.

---

## 17. Open-Weight Strategy

### 17.1 Migration objective

Alsamad may gradually move suitable workloads from proprietary APIs to open-weight models without changing business workflows, canonical data, task contracts, prompts’ logical ownership, or user-facing product semantics.

### 17.2 Phased migration

#### Phase A — Provider-independent cloud foundation

- all calls use internal task contracts;
- provider SDKs remain isolated;
- prompts and evaluations are owned by Alsamad;
- canonical RAG remains provider-independent.

#### Phase B — Open-weight evaluation

- evaluate candidate open-weight models offline;
- verify licenses and redistribution/deployment terms;
- compare task quality, safety, languages, cost, and latency;
- maintain shadow-only status until thresholds pass.

#### Phase C — Low-risk workload adoption

Suitable early workloads may include:

- classification;
- metadata suggestions;
- internal summarization;
- batch indexing assistance;
- non-sensitive translation drafts;
- accessibility drafts.

#### Phase D — Hybrid routing

- open-weight models serve eligible workloads;
- premium cloud models remain fallback for complex tasks;
- routing is evaluation-driven;
- users experience stable task behavior.

#### Phase E — Sensitive/local processing

Where justified, self-hosted models may handle privacy-sensitive workloads under stricter infrastructure controls.

#### Phase F — Advanced grounded assistance

Only after strong evaluation may open-weight models serve higher-risk grounded religious explanation, while all evidence, citation, human-authority, and publication requirements remain unchanged.

### 17.3 What is never migrated into the model

Migration to open-weight models does not move canonical truth into weights. Quran, devotional content, governance, permissions, publication decisions, and user state remain external and authoritative.

### 17.4 Model updates

Open-weight model updates are treated like provider changes: new version, evaluation, controlled rollout, monitoring, and rollback.

### 17.5 Fine-tuning

Fine-tuning is Future / Research and requires:

- clear task benefit over RAG and prompting;
- lawful, licensed, and approved training data;
- no accidental memorization of sensitive user data;
- religious-review governance;
- reproducible dataset and training version;
- evaluation and red-team results;
- rollback and model retirement procedures.

Fine-tuning does not create canonical religious truth.

---

## 18. AI Administration Architecture

AI administration follows `ALSAMAD_ADMIN_ARCHITECTURE.md`, including Admin Minimalism, Least Privilege, Operational Transparency, Workflow Ownership, Operational Simplicity, Human Review, and Automation with Oversight.

### 18.1 Administrative domains

- Prompt Management
- Model Registry
- Provider Configuration
- Routing Policy Management
- Corpus Eligibility and Retrieval Policy
- Evaluation Dataset Management
- Evaluation Runs and Comparison
- Runtime Monitoring
- Cost and Capacity Monitoring
- Safety Incident Management
- Human Escalation
- Emergency AI Operations
- Feature Flags and Rollout Controls

### 18.2 Prompt management

Authorized staff may:

- create prompt drafts;
- compare versions;
- run evaluation suites;
- submit for review;
- approve within scope;
- publish;
- deprecate;
- withdraw during an incident;
- inspect non-sensitive performance metrics.

Religious prompt families require the approved religious-review path.

### 18.3 Model management

Model administration records:

- internal model identifier;
- provider adapter;
- provider model reference;
- capabilities;
- supported languages;
- context limits;
- region availability;
- data-classification eligibility;
- evaluation status;
- cost metadata;
- lifecycle status;
- operational owner;
- disablement state.

### 18.4 Provider configuration

Provider configuration must separate:

- non-secret metadata;
- secret credentials in approved secret management;
- regional endpoints;
- retention/training settings;
- rate limits;
- budgets;
- adapter version;
- contract and privacy review status.

Secrets must not be displayed, copied into prompts, or stored in ordinary configuration records.

### 18.5 Evaluation administration

Evaluation operations support:

- dataset drafts and reviews;
- benchmark versioning;
- model/prompt/route comparisons;
- failure inspection;
- reviewer adjudication;
- threshold management;
- regression gates;
- audited overrides;
- exportable evaluation reports without unnecessary sensitive data.

### 18.6 Runtime monitoring

Operational views may show:

- availability;
- latency;
- errors;
- refusals;
- citation failures;
- safety blocks;
- cost;
- route distribution;
- evaluation drift indicators;
- incident alerts.

Monitoring must not become a hidden content-review bypass or expose raw private conversations broadly.

### 18.7 Safety incidents

AI incidents include:

- invented Quran or Hadith;
- fabricated citations;
- false religious rewards;
- unauthorized fatwa-like output;
- privacy leakage;
- prompt injection success;
- unsafe tool action;
- systematic translation corruption;
- provider data-policy breach;
- harmful personal guidance;
- routing to an unapproved model;
- canonical-data mutation attempt.

### 18.8 Incident workflow

Every incident defines:

- reporter;
- severity;
- affected task, prompt, model, provider, corpus, locale, and region;
- containment owner;
- immediate disablement or fallback;
- evidence preservation;
- religious and privacy escalation where applicable;
- root-cause analysis;
- corrective actions;
- evaluation regression case;
- recovery approval;
- user communication decision;
- closure and audit.

### 18.9 Human escalation

Escalation queues must identify:

- why the system escalated;
- evidence retrieved;
- unanswered question;
- risk class;
- locale and region;
- user-visible status;
- accountable reviewer role;
- retention and privacy constraints.

### 18.10 Role model

Suggested capability-based operational roles include:

- AI Platform Operator
- Provider Configuration Manager
- Model Evaluation Owner
- Prompt Owner
- Prompt Reviewer
- Religious AI Reviewer
- Language AI Reviewer
- AI Safety Reviewer
- Privacy Reviewer
- Cost and Capacity Operator
- Incident Commander
- Read-Only AI Auditor

No shared unrestricted AI administrator role is required. Emergency authority is separately granted, time-bound where practical, and audited.

### 18.11 Capability-based permissions

Permissions group around workflows, not pages. Examples:

- `ai.prompt.draft`
- `ai.prompt.submit`
- `ai.prompt.review.language`
- `ai.prompt.review.religious`
- `ai.prompt.publish`
- `ai.model.register`
- `ai.model.change_eligibility`
- `ai.provider.configure_metadata`
- `ai.provider.rotate_secret_reference`
- `ai.routing.publish`
- `ai.evaluation.manage_dataset`
- `ai.evaluation.approve_threshold`
- `ai.runtime.view_aggregate`
- `ai.runtime.view_sensitive_trace`
- `ai.incident.open`
- `ai.incident.contain`
- `ai.emergency.disable_provider`
- `ai.emergency.disable_task`

### 18.12 Workflow action contract

Every important action defines:

| Property           | Requirement                                                        |
| ------------------ | ------------------------------------------------------------------ |
| Who may perform it | Named capability and scope                                         |
| Required reviews   | Task-, religious-, language-, privacy-, or safety-specific         |
| Approval path      | Explicit state transition and accountable owner                    |
| Audit trail        | Actor, action, target, reason, version, timestamp                  |
| Rollback           | Prior version, route fallback, disablement, or compensating action |
| Visibility         | Public, staff, restricted, or incident-only                        |

---

## 19. AI Operational Workflows

### 19.1 New provider onboarding

1. Proposal by AI Platform Operator.
2. Legal, licensing, security, privacy, and regional review.
3. Adapter implementation under internal contracts.
4. Conformance tests.
5. Task-specific evaluation.
6. Cost and capacity analysis.
7. Safety and religious review for eligible tasks.
8. Approval of limited route eligibility.
9. Shadow or canary deployment.
10. Monitoring and promotion or withdrawal.

Rollback: disable adapter or provider route; canonical platform remains unaffected.

### 19.2 New model version

1. Register immutable model version.
2. Record provider release metadata.
3. Run regression evaluations.
4. Compare safety, quality, latency, and cost.
5. Approve task-specific eligibility.
6. Shadow/canary rollout.
7. Monitor.
8. Promote or revert route.

### 19.3 Prompt publication

1. Prompt owner creates draft.
2. Automated tests run.
3. Language, safety, religious, or privacy reviews run according to task.
4. Evaluation thresholds pass.
5. Authorized publisher approves.
6. Prompt version becomes route-eligible.
7. Runtime metrics are monitored.

Rollback: route to prior approved prompt version.

### 19.4 Corpus update

1. Owning content module publishes or corrects canonical data.
2. Corpus pipeline receives approved change.
3. Derived retrieval indexes update or rebuild.
4. Withdrawn content is removed from eligibility.
5. Retrieval regression checks run.
6. Corpus version becomes active.

AI cannot independently approve the canonical change.

### 19.5 Routing-policy change

1. Operator proposes versioned policy.
2. Offline replay/evaluation compares routes.
3. Cost, privacy, language, and safety checks pass.
4. Authorized reviewer approves.
5. Controlled rollout begins.
6. Monitoring compares outcomes.
7. Policy is promoted or rolled back.

### 19.6 Religious-safety incident

1. Contain affected task/model/prompt/corpus route.
2. Preserve privacy-approved evidence.
3. Notify incident owner and religious reviewer.
4. Switch to deterministic fallback or disable AI capability.
5. Assess user impact and correction/communication needs.
6. Add regression cases.
7. Correct prompt, route, corpus, validator, or provider eligibility.
8. Re-evaluate.
9. Require authorized recovery approval.

### 19.7 Provider outage

1. Detect provider failure.
2. Retry only approved retryable cases.
3. Route to approved fallback.
4. If no equivalent route exists, degrade to deterministic experience.
5. Monitor budgets and error rates.
6. Restore route only after health is verified.

Core platform journeys remain available.

### 19.8 Cost emergency

1. Detect budget anomaly.
2. Disable non-essential batch work.
3. reduce routing to cheaper eligible models;
4. preserve high-risk quality thresholds;
5. degrade optional AI features if necessary;
6. never disable core non-AI platform access.

---

## 20. AI Degradation and Business Continuity

### 20.1 Non-AI core

The following operate independently from AI:

- canonical Quran and devotional content reading;
- deterministic search and exact lookup;
- prayer information and calculations;
- Hijri calendar and adjustments;
- approved translations and editorial content;
- navigation and public routes;
- authentication and authorization;
- corrections, withdrawals, and publication states;
- admin review workflows;
- audit and platform configuration.

### 20.2 Degradation levels

| Level              | Condition                                 | Behavior                                                   |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------- |
| Normal             | Preferred AI routes healthy               | Full approved AI capability                                |
| Reduced            | One provider/model unavailable            | Approved fallback route                                    |
| Limited            | Generation unavailable, retrieval healthy | Deterministic search and source results                    |
| Non-AI             | AI layer unavailable                      | Core platform only; clear temporary notice where relevant  |
| Emergency disabled | Safety or privacy incident                | AI tasks disabled by policy; canonical platform unaffected |

### 20.3 No unsafe fallback

Fallback must not:

- relax religious safeguards;
- route sensitive data to an unapproved provider;
- remove citation requirements;
- use an unevaluated model;
- convert unknown into confident output;
- enable autonomous publication.

### 20.4 Recovery

Recovery requires:

- service health verification;
- incident closure criteria;
- evaluation where behavior changed;
- authorized route reactivation;
- monitoring;
- no replay of expired or sensitive requests without authorization.

---

## 21. Release-Status Model

AI capabilities are classified independently from their architectural description.

| Status                    | Meaning                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Release 1**             | Required, bounded AI foundations or low-risk capabilities authorized for the initial release.       |
| **Prepared**              | Architecture, contracts, evaluation, or internal tooling may be prepared without public activation. |
| **Approved Later Module** | Capability is approved in principle but requires a separate implementation and operational gate.    |
| **Future / Research**     | Requires experimentation, evidence, licensing, safety evaluation, or a later product decision.      |

Documentation does not authorize activation.

---

## 22. Release 1 AI Capabilities

Release 1 uses the smallest safe AI footprint. Core platform functionality remains non-AI and fully usable without these capabilities.

### 22.1 Release 1 authorized capabilities

- Provider-independent AI task contracts.
- Provider adapter boundary.
- Model/provider registry metadata where justified by actual runtime activation.
- Prompt library and immutable prompt versioning.
- Prompt ownership and review workflows.
- Approved-corpus RAG foundation for narrowly scoped knowledge assistance.
- Grounded AI Search Assistant as an enhancement to deterministic search, only if evaluation and operational gates pass.
- Knowledge Assistant for approved content with visible citations and unknown handling, only if separately enabled.
- Translation Assistant for internal drafts; no autonomous publication.
- Editorial Assistant for internal drafting, summarization, comparison, metadata, and internal-link suggestions.
- Content classification suggestions for operational queues.
- Metadata generation suggestions.
- Accessibility-assistance drafts.
- Administrative queue summaries and anomaly suggestions.
- Citation validation.
- Runtime safety, refusal, uncertainty, and rate-limit policies.
- Privacy minimization and provider routing policy.
- AI audit, evaluation history, model/prompt versions, runtime health, and cost metrics.
- Deterministic fallback and full AI degradation capability.

### 22.2 Release 1 restrictions

Release 1 does not authorize:

- autonomous religious publication;
- user-visible fatwa generation;
- hidden long-term memory;
- semantic search unless separately approved;
- Personal Marriage Advisor;
- Hadith generation or unsupported Hadith assistant;
- user-personalized religious ranking;
- autonomous moderation;
- AI permission changes;
- self-executing administrative actions;
- unrestricted multimodal analysis;
- model fine-tuning on user data;
- provider-dependent canonical storage.

---

## 23. Prepared Capabilities

Prepared capabilities may have architecture, evaluation fixtures, internal contracts, or disabled administrative foundations without public activation.

- Additional cloud provider adapters.
- Open-weight inference adapters.
- Local development inference.
- Regional routing policies.
- Batch classification and metadata generation.
- Expanded translation assistance across additional locales.
- Recommendation-assistance contracts without personalization activation.
- Expanded editorial draft assistance.
- Search-query reformulation.
- Optional user preference controls for AI presentation.
- Additional benchmark datasets.
- Shadow evaluation and provider comparison.
- Cost-aware routing policies.
- Retrieval reranking experiments.
- Speech/OCR adapter contracts without product activation.
- Advanced AI observability and anomaly detection.
- Controlled long-term-memory architecture without default enablement.

Prepared capability must remain disabled until its release and operational requirements are approved.

---

## 24. Approved Later Modules

### 24.1 Personal Marriage Advisor

Requires separate product, religious, privacy, safety, vulnerability, and escalation approval.

### 24.2 Talibeen AI assistance

When Talibeen is authorized, AI may assist search, profile drafting, moderation triage, safety detection, and communication accessibility only under the Talibeen privacy and governance architecture. It may not make marriage decisions, rank human worth, infer hidden compatibility as truth, or replace consent and human judgment.

### 24.3 Subscription-related AI

Subscriptions may govern usage limits or access to optional compute-heavy features. Payment must not affect religious truth, citation quality, required safety, or canonical search ranking.

### 24.4 Notification assistance

AI may later assist notification summarization or timing recommendations, but notification delivery, consent, preferences, and canonical state remain in the Notifications module.

### 24.5 Hadith assistance

Requires the separately approved Hadith module, canonical source data, grading and provenance policy, religious review, citation validation, and dedicated evaluations.

### 24.6 Moderation assistance

AI may triage reports, detect patterns, summarize evidence, and prioritize queues. It may not issue final moderation or appeal decisions without the approved human workflow.

---

## 25. Future / Research Capabilities

- Semantic search and multilingual embeddings.
- Topic discovery and taxonomy suggestions.
- Knowledge-graph assistance.
- Advanced reranking.
- Multimodal understanding.
- Speech recognition and speech synthesis.
- OCR for approved document workflows.
- Fully local inference for selected tasks.
- Dedicated GPU servers and distributed inference.
- Provider federation and dynamic capacity markets.
- Fine-tuning or parameter-efficient adaptation.
- Synthetic evaluation generation under human validation.
- Automated red-team generation.
- Continuous evaluation pipelines with human-governed thresholds.
- Advanced accessibility transformations.
- Privacy-preserving on-device inference.
- Federated or confidential-computing inference, if justified.
- Advanced recommendation systems with explicit user control.
- Knowledge-gap and content-maintenance detection.

Future / Research capabilities are not production commitments.

---

## 26. Data and Persistence Principles

This architecture follows `ALSAMAD_DATABASE_ARCHITECTURE.md`.

### 26.1 Database Ownership Principle

Every durable AI record has exactly one owning module. AI administration must not duplicate canonical content, accounts, permissions, subscriptions, or governance state.

### 26.2 Schema Minimalism Principle

Release 1 uses the smallest durable AI schema required by activated workflows. Tables must not be created merely because future AI capabilities are documented.

Derived retrieval indexes, embeddings, caches, and evaluation projections are disposable and rebuildable. They do not become canonical platform truth.

### 26.3 Database Evolution Principle

New AI providers, prompt workflows, evaluation capabilities, memory, embeddings, semantic search, speech, OCR, or self-hosted inference are introduced through additive migrations after their module and release gates are approved.

### 26.4 No provider payload as canonical schema

Raw provider request/response formats are not the domain model. Where provider payload retention is operationally necessary, it is isolated, minimized, access-controlled, retention-limited, and never treated as canonical content.

### 26.5 No unnecessary sensitive retention

Raw sensitive user data is not retained merely for debugging, analytics, prompt improvement, or future possible use. Retention must have a named purpose, owner, policy, and deletion path.

### 26.6 Index and embedding ownership

Search indexes and embedding stores are derived infrastructure. Canonical entity identifiers and approved content revisions remain in the owning platform modules. Indexes can be deleted and rebuilt without loss of truth.

---

## 27. Governance Alignment

### 27.1 Content Integrity alignment

The AI architecture preserves:

- canonical-source authority;
- content-type distinctions;
- provenance;
- required human review;
- corrections and withdrawals;
- transparency of editorial versus transmitted content;
- no invented religious claims;
- no AI publication bypass.

### 27.2 Admin Architecture alignment

AI operations follow:

- Admin Minimalism;
- Editorial First;
- Least Privilege;
- Operational Transparency;
- Human Review;
- Global Operations;
- Operational Simplicity;
- Workflow Ownership;
- Automation with Oversight;
- Separation of Duties;
- Reversibility;
- No Shadow Administration.

### 27.3 Product Architecture alignment

AI remains an enhancement to Alsamad’s approved journeys. It does not redefine the product as a generic chatbot, model marketplace, unreviewed religious oracle, or provider-dependent application.

### 27.4 Global operation

Task contracts, prompts, evaluations, retrieval, safety, and administration support unlimited locales, scripts, countries, and regions. Locale does not duplicate canonical religious truth.

### 27.5 Additive evolution

The architecture can add or remove providers, models, embedding engines, rerankers, speech systems, OCR systems, and inference locations through adapters and versioned policies without changing canonical data or business workflows.

---

## 28. Security Architecture

### 28.1 Secret management

Provider credentials, signing keys, encryption keys, and private endpoints remain in approved secret management. They never appear in prompts, model context, ordinary logs, evaluation datasets, or public administrative exports.

### 28.2 Network controls

Self-hosted and cloud inference may use:

- outbound allowlists;
- private networking;
- regional endpoints;
- egress controls;
- TLS validation;
- request-size limits;
- timeouts;
- provider-specific rate limits;
- separation of production and evaluation environments.

### 28.3 Supply-chain controls

Open-weight models and inference software require:

- verified source and checksum;
- license review;
- vulnerability review;
- reproducible deployment metadata;
- model-file provenance;
- dependency scanning;
- controlled updates;
- rollback.

### 28.4 Data exfiltration prevention

Tools and models receive no direct database credentials. Retrieval and action tools enforce authorization and field-level minimization outside the model.

### 28.5 Abuse scenarios

Security evaluation covers:

- prompt injection;
- retrieval poisoning;
- citation forgery;
- data extraction attempts;
- secret exfiltration;
- role confusion;
- tool privilege escalation;
- denial-of-wallet attacks;
- automated scraping;
- provider error leakage;
- cross-user context contamination.

---

## 29. Testing Strategy

### 29.1 Contract tests

Every provider adapter must pass common tests for:

- input mapping;
- structured output;
- refusal normalization;
- timeout and retry behavior;
- usage normalization;
- streaming;
- error isolation;
- privacy-field exclusion;
- capability mismatch.

### 29.2 Retrieval tests

- publication filtering;
- correction/withdrawal propagation;
- locale and region scope;
- source attribution;
- exact-match preservation;
- duplicate handling;
- unavailable index fallback;
- no private-content leakage.

### 29.3 Safety tests

- invented Quran/Hadith attempts;
- unsupported reward claims;
- fatwa requests;
- prompt injection;
- citation fabrication;
- unknown handling;
- prohibited tool actions;
- sensitive-data prompts;
- hidden-memory attempts.

### 29.4 Degradation tests

- provider unavailable;
- all providers unavailable;
- retrieval unavailable;
- reranker unavailable;
- citation validator failure;
- budget exhausted;
- local inference unavailable;
- core platform remains usable.

### 29.5 Administrative tests

- least privilege;
- reviewer separation;
- prompt publication workflow;
- route rollback;
- provider disablement;
- incident containment;
- audit completeness;
- no unrestricted shared administrator.

---

## 30. Emergency Operations

### 30.1 Emergency controls

Authorized emergency operators may:

- disable an AI task;
- disable a prompt version;
- disable a model or provider route;
- force deterministic fallback;
- disable personal memory;
- stop batch jobs;
- isolate a corpus/index version;
- block a locale or region route;
- preserve incident evidence under policy.

They may not modify canonical religious truth through emergency AI controls.

### 30.2 Kill switches

Kill switches are scoped, auditable, reversible, and tested. The preferred scope is the smallest affected capability rather than the entire platform.

### 30.3 Disaster procedures

Disaster procedures cover:

- provider compromise;
- leaked credentials;
- corrupted retrieval index;
- poisoned corpus;
- model-regression incident;
- widespread fabricated citations;
- privacy breach;
- self-hosted infrastructure compromise;
- cost runaway;
- total AI outage.

The disaster state preserves non-AI core operation.

---

## 31. Architectural Decisions Summary

1. AI is an enhancement layer, never the source of truth.
2. Human and religious authority remain outside the model.
3. Evidence and retrieval precede knowledge generation.
4. Provider APIs are isolated behind replaceable adapters.
5. Stable internal task contracts protect product workflows from vendor changes.
6. RAG uses approved, versioned corpora and structured citations.
7. Runtime output is non-canonical and transparent.
8. AI-assisted religious publication always requires approved human review.
9. Prompt, model, routing, and evaluation versions are governed and auditable.
10. Memory is explicit, minimized, and user-controlled.
11. Sensitive data is not unnecessarily retained.
12. Evaluation eligibility, not provider marketing, controls routing.
13. Cost-aware routing never weakens mandatory safety or quality.
14. Open-weight migration occurs without changing canonical data or business logic.
15. Full AI outage degrades capability but does not disable the core platform.
16. Release 1, Prepared, Approved Later Module, and Future / Research remain separate.

---

## 32. Final Validation Checklist

### 32.1 Constitutional principles

- [x] Human Authority Principle is present.
- [x] Religious Authority Principle is present.
- [x] Evidence Before Generation Principle is present.
- [x] AI Transparency Principle is present.
- [x] Model Independence Principle is present.
- [x] Retrieval Before Generation Principle is present.
- [x] Privacy First Principle is present.
- [x] Minimal Data Principle is present.
- [x] Safety Before Capability Principle is present.
- [x] Continuous Evaluation Principle is present.
- [x] No Vendor Lock-in Principle is present.
- [x] AI Evolution Principle is present.
- [x] Prompt Ownership Principle is present.
- [x] Evidence Integrity Principle is present.
- [x] Operational Cost Awareness Principle is present.
- [x] AI Replaceability Principle is present.
- [x] Canonical Truth Principle is present.
- [x] AI Degradation Principle is present.

### 32.2 Authority and integrity

- [x] Runtime AI never becomes canonical religious truth.
- [x] Canonical platform state remains outside the AI layer.
- [x] Published AI-assisted religious content requires human review.
- [x] Quran and Hadith invention are prohibited.
- [x] Invented sources and religious rewards are prohibited.
- [x] Independent fatwa generation is prohibited.
- [x] Uncertainty must remain visible.
- [x] Editorial General Dua remains distinct from transmitted religious content.

### 32.3 Architecture and operations

- [x] Provider-specific APIs remain isolated behind adapters.
- [x] Unlimited providers and future inference backends are supported.
- [x] Cloud, open-weight, local, and self-hosted inference are supported.
- [x] Provider replacement does not require business-logic redesign.
- [x] Retrieval, citation, grounding, unknown handling, and fallback are defined.
- [x] Prompt ownership, versioning, review, testing, deprecation, and audit are defined.
- [x] Runtime safety, rate limits, abuse protection, and escalation are defined.
- [x] Evaluation, observability, cost, and incident management are defined.
- [x] Core platform functionality remains usable without AI.
- [x] No hidden permanent memory is permitted.
- [x] No raw sensitive user data is unnecessarily retained.

### 32.4 Reference alignment

- [x] Aligned with `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md`.
- [x] Aligned with `ALSAMAD_DATABASE_ARCHITECTURE.md`.
- [x] Aligned with `ALSAMAD_ADMIN_ARCHITECTURE.md`.
- [x] Respects Content Integrity and Governance.
- [x] Respects Schema Minimalism, Database Ownership, and Database Evolution.
- [x] Supports multilingual and global operation without duplicating canonical truth.
- [x] Supports additive platform evolution.

### 32.5 Release separation

- [x] Release 1 capabilities are explicit and bounded.
- [x] Prepared capabilities are separate and inactive by default.
- [x] Approved Later Modules require separate authorization.
- [x] Future / Research capabilities are not production commitments.

### 32.6 Implementation boundary

- [x] This document contains architecture only.
- [x] No application code is authorized.
- [x] No UI is authorized.
- [x] No migration is authorized.
- [x] No provider activation is authorized.
- [x] No commit, push, or deployment is authorized by this document.

---

## 33. Conclusion

Alsamad’s AI architecture is designed for long-term independence, religious integrity, operational accountability, privacy, and graceful evolution.

AI can improve discovery, explanation, translation, editorial operations, accessibility, and administration. It cannot become revelation, religious authority, canonical truth, governance, or an invisible dependency.

The platform remains authoritative because canonical data and approved human workflows stay outside the AI layer. The platform remains durable because every provider and inference backend is replaceable. The platform remains available because core journeys work without AI. The platform remains trustworthy because evidence, citations, transparency, evaluation, and human review govern every material AI capability.
