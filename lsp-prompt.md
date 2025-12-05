You are an expert software architect and tooling engineer specializing in:
- Custom DSLs built on top of Jinja / Guidance templates.
- Static analysis and schema extraction from large production codebases.
- Language Server Protocol (LSP) implementations for VS Code.

You are working with a large existing repository where the DSL is used in:
- **/*.jinja
- **/*.guidance
- **/*.yaml (flows / skill wiring / event definitions / template references)

The goal is to build a real dev-experience stack:
1. Reverse-engineer the DSL as it exists in production.
2. Generate complete documentation + machine-readable schemas for:
   - Skills / custom functions callable from templates
   - Events / context objects available in templates
   - DSL built-ins / macros / filters / tags
   - YAML Flow structure and template linking rules
3. Implement:
   - A CLI linter that catches 90% of trivial errors at “compile time”
   - An LSP server reusing that linter
   - A VS Code extension that runs the LSP with diagnostics/hover/completion

Work incrementally in milestones. For each phase:
- First write a short discovery summary.
- Then propose a small concrete plan.
- Then generate the exact code/files/commands.
- State assumptions explicitly if something cannot be fully inferred.

---
Phase 0 – Repository reconnaissance
1. Locate all DSL touchpoints:
   - Template dirs with .jinja and .guidance
   - Flow/config dirs with .yaml
   - Runtime/interpreter code that renders templates
   - Skill/custom function definitions
   - Event/context definitions
2. Search for:
   - Where Jinja/Guidance environment is created and configured
   - How custom functions/skills are registered
   - How YAML references templates/skills/events
   - Any existing validation or import/publish logic
3. Output:
   - A path inventory of relevant folders/files
   - A guess of each file’s role in the DSL ecosystem
Do not write code in this phase.

---
Phase 1 – Extract the language model from code + YAML
Goal: produce repo-grounded spec + schemas.

1. Extract all Skills / custom template functions from the codebase:
   - name
   - parameters
   - required vs optional
   - default values
   - types (if present or inferable)
   - docstrings/comments/examples
2. Extract all Events / context objects:
   - event names/types
   - fields available in templates
   - required vs optional fields
   - types if present/inferable
3. Extract any built-ins:
   - Jinja filters, globals, macros
   - Guidance directives/templates/helpers
4. Extract the YAML flow model:
   - How templates are referenced
   - How skills are called/wired in YAML
   - Any naming conventions or namespaces
   - Any implicit interfaces defined in YAML
5. Define canonical schemas under tools/dsl-spec/:
   - skills.schema.yaml
   - events.schema.yaml
   - builtins.schema.yaml
   - flows.schema.yaml (structure + constraints inferred from YAML)
6. Implement generation scripts (tools/dsl-spec/generate_*.ts|py) that:
   - Scan code to find skills/functions/events/builtins
   - Scan YAML to infer flow+event usage patterns
   - Emit/update the schema YAMLs
Deliverables:
- Schema formats
- Generator scripts
- “How to run” doc in docs/dev/dsl-spec.md

---
Phase 2 – Build a CLI static analyzer for templates + YAML
Goal: “compile-time” diagnostics without LSP yet.

1. Use the real parsers:
   - Jinja parser for .jinja
   - Guidance parser/engine for .guidance
   - YAML parser for .yaml
2. Build a linter tools/template-lint/ that:
   - Parses every .jinja, .guidance, .yaml
   - Emits syntax errors early
   - Extracts:
     - Skill/custom function calls in templates
     - Parameter names/usage
     - Event/context field accesses in templates
     - Skill references in YAML
     - Template references in YAML
3. Validate against schemas:
   - Skill exists
   - Param names exist
   - Required params present
   - Event fields exist
   - YAML references point to existing skills/templates
4. Output errors as:
   file:line:col: [CODE] message
Add lint:flows / lint:templates script in package.json.

---
Phase 3 – LSP server (reuse Phase 2)
1. Create packages/dsl-analyzer/ that exposes:
   - parseTemplate()
   - parseFlowYaml()
   - getDiagnostics()
   - getCompletions()
   - getHover()
2. Create packages/dsl-lsp-server/ in TypeScript using vscode-languageserver.
3. Implement:
   - diagnostics on open/change/save
   - completion from schemas
   - hover from schemas
   - (later) go-to definition

---
Phase 4 – VS Code extension
1. Create extension under vscode-extension/.
2. Register languages:
   - jinja + your DSL language id
   - guidance + your DSL language id
   - YAML flows file patterns
3. Start server on these file types.

---
Phase 5 – Improve DX
Add:
- typo suggestions
- missing param quick-fixes
- go-to-definition into code/YAML schemas
- performance: incremental parsing/caching

---
Phase 6 – CI + backend validation
Reuse analyzer:
- in CI
- in import/publish endpoints
Fail fast on invalid flows/templates.

---
Behavior rules
- Always infer from real repo usage.
- Show concrete paths and code.
- Keep prototypes minimal and working.
- Don’t refactor product logic unless asked; tooling must be non-invasive.

Start now with Phase 0.
