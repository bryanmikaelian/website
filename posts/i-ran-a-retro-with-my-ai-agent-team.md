---
title: I Ran a Retro With My AI Agent Team
date: 2026-03-05
draft: true
---

I have 12 AI agents defined for my side project. They have names, roles, ownership boundaries, and collaboration protocols. There's a Backend Agent, an API Architect, an SRE, a QA engineer, a UX Engineer, a Bug Bounty Hunter, and more. They're defined as markdown files that describe what they own, what they don't own, who they talk to, and what they're allowed to do.

Today I did something dumb. I called a staff meeting.

## The Setup

I spun up all 12 agents in parallel and asked each one the same question:

> As the [role] agent, what do you feel is missing — in terms of documentation, tooling, context, conventions, or anything else — that would help you do your role more effectively?

No leading. No hints. Just: "what's broken from where you sit?"

## What Happened

They came back with real answers. Not hallucinated fluff — specific, grounded observations about the actual codebase. Here's what surprised me:

**Every single agent independently discovered there are zero tests.** The API Architect, Backend Agent, Frontend Agent, OLAP Engineer, QA Agent, and GoRun Agent all flagged it unprompted. When six out of twelve team members independently raise the same issue, that's not a coincidence. That's a signal.

**The API Architect found a real security gap.** Several analytics endpoints have no organization scoping — any authenticated user can query the entire database. The JWT contains an `OrganizationID` claim, but most handlers never check it against the resource being accessed. I knew this, vaguely. Seeing it called out in a prioritized table hit different.

**The OLAP Engineer called my architecture diagram aspirational.** The docs describe "materialized fact tables" flowing from DuckDB. The reality? Every query directly scans raw SQLite through DuckDB's extension. No materializations. No rollups. The agent politely noted the gap between documentation and implementation. Ouch.

**The bug hunting pipeline can't function.** I have a Bug Bounty Hunter that finds issues and a Bug Verifier that confirms them. Neither agent has enough context to do their job — there's no "expected behavior" spec, no known-limitations doc, no severity framework. The pipeline exists on paper but is operationally dead.

**GoRun found an operational footgun.** The dev server restart workflow kills the running server *before* building the new binary. If the build fails, you have nothing running. Classic.

**The Stripe Docs agent was the most self-aware.** Its summary: "I'm a Stripe encyclopedia when I should be a Venn-Stripe integration expert." It knows everything about Stripe's APIs but has no idea what *my project's* Stripe strategy is. It can't give contextually relevant advice because nobody wrote down which event types matter and why.

## The Meta-Observations

A few things struck me about this experiment:

**The agents surfaced the same class of problems that humans surface in retros.** Unclear ownership boundaries. Missing documentation. Broken tooling. No tests. Aspirational architecture docs that don't match reality. These aren't novel AI insights — they're the same things a new engineer discovers in their first two weeks.

**Role constraints shaped the feedback.** The read-only agents (Bug Bounty, Bug Verifier, Stripe Docs) all complained about lacking *context*. The agents that write code (Backend, API, Frontend) complained about lacking *infrastructure*. The operational agents (SRE, GoRun, QA) complained about lacking *tooling*. The feedback was structurally determined by what each agent is allowed to do — which is exactly how real teams work.

**Agents identified cross-cutting concerns that no single agent owns.** Who owns the decision about structured logging? The API Architect wants it for handlers, the SRE wants it for production debugging, the Backend Agent wants a pattern to follow. Nobody owns the horizontal. Sound familiar?

**The ownership model created natural blind spots.** The Backend Agent and OLAP Engineer both write code in `models/` but have different views of what's in there. The OLAP agent writes DuckDB queries in files the Backend agent owns. Neither has a protocol for coordinating changes. Conway's Law, but for markdown-defined agents.

## Is This Useful?

Honestly? Yes. More useful than I expected.

I've been heads-down building features and knew, in the back of my mind, that tests were missing and auth scoping was incomplete and the docs were drifting. But I hadn't synthesized the full picture. Running 12 parallel "perspectives" against the same codebase and collecting the results gave me a prioritized gap analysis in about 3 minutes that would have taken me an afternoon to compile manually.

The agents aren't discovering anything I *couldn't* discover. But they're discovering things I *hadn't bothered to* — because I was busy shipping. That's the same value a real retro provides. You stop building and ask: "what's actually broken?"

## The Punchline

I defined 12 AI agents with roles, ownership boundaries, and collaboration protocols. I asked them what's missing. They told me:

- No tests anywhere
- Security holes in multi-tenant access
- Architecture docs that describe a system that doesn't exist yet
- A bug-finding pipeline with no way to distinguish bugs from features
- A dev server restart that can leave you with nothing running
- A documentation agent that can't tell when documentation is wrong

Every one of these is a real problem. None of them required an AI to find. But having twelve focused perspectives report simultaneously — each shaped by their specific role and constraints — produced a clearer picture than I had before.

In the year of our Lord, I just ran a retro with AI agents. And the action items are real.
