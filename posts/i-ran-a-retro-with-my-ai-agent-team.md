---
title: I Ran a Retro With My AI Agent Team
date: 2026-03-05
---

Since 2023, I’ve been hacking on a small side project in the billing space. It’s gone nowhere because the cognitive load to write code in the evening (especially with 2 kids) was just too much. The project, which I named Venn, has been collecting dust for about a year. 

Something changed the course of Venn in 2026: my embrace of agentic coding. 

## Finding joy

Venn is being built as sort of a “Stripe enhancer”. Its goal is to ingest Stripe webhooks and let you find trends. This is something that’s been frustrating to do as a billing engineer and I feel it will provide value (assuming I finish it).

As a long time billing engineer, I’ve firmly believed leaning into Stripe pays dividends over time. Sometimes Stripe has gaps in the product but Stripe will eventually fill them. The biggest example is their real-time usage billing. It was an ok feature but I know it will become first-class with the acquisition of Metronome.

A few weeks ago, I was talking to David Crawshaw at exe.dev about billing. We got onto a topic about agentic coding and it was a lightbulb moment: why am I still writing code, after almost 20 years in this industry, by hand? As someone who enjoys working on cars, why would I want to _forge_ an engine block myself? 

After our chat, I dusted off Venn and started down the route of agentic coding. And for the first time in a few years, I was able to translate my vision for Venn into something tangible. The joy: it only took about an hour one evening. 

## From Chaos to Calm
The first agentic exercise was comical. Yes I was productive but watching Claude use 400k tokens in maybe 30 seconds was like watching a train wreck in slow motion _that I personally designed_. Turns out having a 2k CLAUDE.md file is a bad idea. 

After heavy research and reading about effective agentic coding, things have calmed down a lot.  I am in a good groove and it’s incredible to watch the agent team crush tasks for Venn. It took a lot of agent refining, tweaking prompts, and improving documents. It was full on prompt engineering; but the dividends are being paid now. 

I have currently have 12 AI agents defined for Venn. They have names, roles, ownership boundaries, and collaboration protocols. There's a Backend Agent, an API Architect, an SRE, a QA engineer, a UX Engineer, a Bug Bounty Hunter, and more. They're defined as markdown files that describe what they own, what they don't own, who they talk to, and what they're allowed to do.

## The Staff Meeting

Last night, I did something dumb. I called a staff meeting. After a few weeks of this setup, I wanted to see how things were going from a different perspective. 

I had Shelley on exe.dev spin up all 12 agents in parallel and it asked each one the same question:

> As the [role] agent, what do you feel is missing — in terms of documentation, tooling, context, conventions, or anything else — that would help you do your role more effectively?

No leading. No hints. Just: "what's broken from where you sit?"

## What Happened

They came back with real answers. Not hallucinated fluff but specific, grounded observations about the actual codebase. Here's what surprised me:

**Every single agent independently discovered there are zero tests.** The API Architect, Backend Agent, Frontend Agent, OLAP Engineer, QA Agent, and GoRun Agent all flagged it unprompted. When six out of twelve team members independently raise the same issue, that's not a coincidence. That's a signal.

**The API Architect found a real security gap.** Several endpoints have no authz scoping — any authenticated user can query the entire database. Venn uses JWTs and they contain an `OrganizationID` claim, but most endpoints never check it against the resource being accessed. I knew this, vaguely but it was wild to see it called out by the agents.

**The OLAP Engineer called my architecture diagram aspirational.** The docs describe "materialized fact tables" flowing from DuckDB, a key part of Venn’s architecture. In Venn, every analytics query directly scans raw SQLite through DuckDB's extension. No materializations. No rollups. The agent politely noted the gap between documentation and implementation. Whoops. 

**The bug hunting pipeline can't function.** I have a Bug Bounty Hunter that finds issues and a Bug Verifier that confirms them. Neither agent has enough context to do their job. There's no "expected behavior" spec, no known-limitations doc, no severity framework. The pipeline exists on paper but is operationally dead.

**GoRun found an operational footgun.** The dev server restart workflow is something I built because I got tired of typing go run. Other agents can invoke this agent too. Gorun also  kills the running server *before* building the new binary. If the build fails, you have nothing running. Classic

**The Stripe Docs agent was the most self-aware.** Its summary: "I'm a Stripe encyclopedia when I should be a Venn-Stripe integration expert." It knows everything about Stripe's APIs but has no idea what *my project's* Stripe strategy is. It can't give contextually relevant advice because nobody wrote down which event types matter and why.

## The Meta-Observations

A few things struck me about this experiment:

**The agents surfaced the same class of problems that humans surface in retros.** Unclear ownership boundaries. Missing documentation. Broken tooling. No tests. Aspirational architecture docs that don't match reality. These aren't novel AI insights. They're the same things a new engineer discovers in their first two weeks.

**Role constraints shaped the feedback.** The read-only agents (Bug Bounty, Bug Verifier, Stripe Docs) all complained about lacking *context*. The agents that write code (Backend, API, Frontend) complained about lacking *infrastructure*. The operational agents (SRE, GoRun, QA) complained about lacking *tooling*. The feedback was structurally determined by what each agent is allowed to do. This is exactly how real teams work.

**Agents identified cross-cutting concerns that no single agent owns.** Who owns the decision about structured logging? The API Architect wants it for handlers, the SRE wants it for production debugging, the Backend Agent wants a pattern to follow. Nobody owns the horizontal. Sound familiar?

**The ownership model created natural blind spots.** The Backend Agent and OLAP Engineer both write code in `models/` but have different views of what's in there. The OLAP agent writes DuckDB queries in files the Backend agent owns. Neither has a protocol for coordinating changes. Conway's Law, but for markdown-defined agents.

## Is This Useful?

Honestly? Yes. More useful than I expected.

I've been heads-down building features and knew, in the back of my mind, that tests were missing and auth scoping was incomplete and the docs were drifting. But I hadn't synthesized the full picture. Running 12 parallel "perspectives" against the same codebase and collecting the results gave me a prioritized gap analysis in about 3 minutes that would have taken me an afternoon to compile manually.

The agents aren't discovering anything I *couldn't* discover. But they're discovering things I *hadn't bothered to* because I was busy shipping. That's the same value a real retro provides. You stop building and ask: "what's broken?"

## I am the EM of Agents

I defined 12 AI agents with roles, ownership boundaries, and collaboration protocols. I asked them what's missing. They told me:

- No tests anywhere
- Security holes in multi-tenant access
- Architecture docs that describe a system that doesn't exist yet
- A bug-finding pipeline with no way to distinguish bugs from features
- A dev server restart that can leave you with nothing running
- A documentation agent that can't tell when documentation is wrong

Every one of these is a real problem. None of them required an AI to find. But having twelve focused perspectives report simultaneously to me? Now I know where to improve. 

See you at performance review time. In the year of our Lord, I just ran a retro with AI agents. And the action items are real.
