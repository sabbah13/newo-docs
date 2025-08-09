---
title: Introduction
---

### Welcome to Newo SuperAgent Docs

This guide explains the multi‑agent system and the scripting DSL used across `.guidance` and `.jinja` skills.

> Powerful. Event‑driven. Extensible. Built for real operations.

<div className="doc-cta-buttons">
  <a className="button button--primary button--lg" href="/docs/architecture-overview">Overview</a>
  <a className="button button--secondary button--lg" href="/docs/dsl-syntax">Language</a>
  <a className="button button--secondary button--lg" href="/docs/agents-catalog">Agents</a>
  <a className="button button--secondary button--lg" href="/docs/commands-catalog">Integrations</a>
  <a className="button button--secondary button--lg" href="/docs/how-to-extend">Guides</a>
</div>

Quickstart
```guidance
{{#system}}{{_makeFastPrompt(userId=userId)}}{{/system}}
{{#assistant}}
{{Set(name="agent_answer", value=GenStream(sendTo="actors", actorIds=_utilsGetOrSetLastConvoActorId(userId=userId), temperature=0.2))}}
{{/assistant}}
{{SendSystemEvent(eventIdn="analyze_conversation", convoAgentAnswer=agent_answer)}}
```

What’s inside
- Overview: architecture, flows, agent map
- Language & Runtime: DSL syntax, built‑ins, LLM generation
- Integration: events, commands, connectors
- Data & State: persona state, memory, JSON utilities
- Reference: functions and skill index
- Guides: patterns and how‑to extend
