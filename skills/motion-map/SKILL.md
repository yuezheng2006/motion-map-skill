---
name: motion-map
description: Create editable animated relationship maps, dependency and collaboration graphs, architecture diagrams and illustrated process explainers from notes, documents, articles or repositories. Use for 动态关系图、人物组织关系、知识联系、依赖网络、因果图、架构图 or $motion-map; export offline HTML, PNG, MP4/GIF and Mermaid.
---

# Motion Map

Map entities, label their relationships, then use motion only where its direction means something. This is yuezheng2006's maintained fork of arch-diagram-skill; the upstream MIT license and authorship are preserved in the repository.

`$SK` below is this skill folder, containing `scripts/`, `assets/`, `references/` and `examples/`. Commands need its actual full path. Node ≥18 builds standalone HTML; checks and images require Chrome/Chromium/Edge (`CHROME=/path` if needed); video/GIF also requires ffmpeg.

## 1. Decide what the map explains

Choose the question before drawing: who belongs to or collaborates with whom, which concepts connect, what depends on what, what causes or produces what, or how a system works. Architecture is one application of the same entity-and-relationship model.

Extract an entity list and a relationship list from supplied sources. Give each relationship a plain-language predicate. Keep fictional teaching scenarios explicitly fictional; link factual nodes/edges to their sources in a short companion note. Do not convert correlation, membership or co-occurrence into causal arrows. Mark uncertain interpretations as inferred.

- For relationship semantics and a complete JSON example, read [relationships.md](references/relationships.md).
- For reading repositories/articles and detailed architecture layout/export procedures, read [architecture-workflow.md](references/architecture-workflow.md).
- Read [spec.md](references/spec.md) before writing JSON. It defines nodes, anchors, paths, groups and format limitations.

## Sequence and dependency precision

- If the question is who sends what when, read [sequence.md](references/sequence.md) and use `kind: "sequence"`. Preserve ordered messages and correlate responses with `replyTo`; do not collapse request/response into one bidirectional line. Self-calls and asynchronous sends are distinct types. Sequence arrows point sender → recipient, independently of the dependency convention.
- For dependencies, read the dependency section of [relationships.md](references/relationships.md). Set `meaning: "dependency"` and `dependencyConvention: "dependent-to-prerequisite"`. A→B means A needs B, not that B calls A. Keep structural dependency edges static.
- An indirect dependency needs a `viaPath` supported by the explicitly drawn direct dependencies. Association and inferred links are not proof. Explain the path and mark the shortcut dashed. Do not infer causality from reachability alone.
- State direction conventions in the diagram. Validate participant IDs, order, response endpoints and evidence paths before polishing layout. The compiler checks graph consistency; source accuracy remains the author's responsibility.

## 2. Model the relationships

Set `kind: "relations"` for a general relationship map; this changes the legend's wording from flows to relationships. Declare reusable types in `flows`, then reference them from edges.

| `relation` | Meaning | Visual behavior |
| --- | --- | --- |
| `directed` | one-way influence, dependency or output, with a specific label | one arrow and forward packets; `packet: false` disables packets |
| `bidirectional` | reciprocal communication, feedback or collaboration | two arrowheads and packets in both directions |
| `association` | membership, ordinary association or co-occurrence | no arrows, no moving packets/dashes, no arrival log |

An edge's `relation` overrides its flow's relation. Relationship semantics take precedence over conflicting legacy `arrow` or `packet` flags; old specifications without `relation` keep their legacy behavior. These rules are shared between the renderer and Mermaid export. Animated arrows are explanatory emphasis, not measured event rates.

## 3. Choose structure and visual style separately

- A hub-and-spoke map suits one central entity and its relationships. Layers suit dependencies; a directional process suits a sequence. Use groups only for actual containment or clearly labeled explanation panels. Minimize crossings; crossing lines are not implicit junctions.
- `layout: "explainer"` provides a whiteboard teaching composition with numbered panels, outline icons, comparisons and small local diagrams. It defaults to `theme: "sketch"`. Use `examples/reading-club.json`, `dsh-explainer.json` or `music-separation.json` for different compositions; do not repeat the same panel count across unrelated subjects.
- `presentation: true` provides a prominent title and left-aligned cards for conventional maps. Choose it or explainer mode, rather than both.
- Styles from upstream 1.3.0: `blueprint` (晒图蓝图), `drafting` (牛皮纸制图), `whiteboard` (白板手绘), `brutalism` (粗野撞色), `crt` (荧光终端), `saas` (柔光卡片), `isometric` (3D 等距沙盘). Existing `paper`, `porcelain`, `graphite`, `sketch` remain available. Restyle by rebuilding the same spec with `--theme`; preserve all relationships and message order. Themes recolor a chosen structure; they do not select the structure. See [style.md](references/style.md) for the visual primitives and typography.

Use the user's language throughout the title, legend and labels. Identifiers, commands and source paths retain their original spelling. Do not invent current health/status, statistics or a real execution log for decoration.

## 4. Build, check, inspect

```bash
node $SK/scripts/build.mjs <slug>.spec.json <slug>.html
node $SK/scripts/check.mjs <slug>.html <slug>.png
```

Fix every reported layout error, then look at the screenshot: painting order, readable type, balanced whitespace, paths and labels. Test a narrow viewport when the deliverable is interactive; actual-size mode must allow reading small text. Reduced motion starts paused and offers an explicit Play button. Open the actual HTML file in a browser; a platform attachment preview may suppress scripts. Never send a `?check` URL as an animated preview. Static associations/dependencies remain still; explain this distinction. Exported videos explicitly enable motion.

Save the spec beside the HTML. Honor a user-specified location; for a current project use its `architecture/` or `diagrams/` directory, otherwise a task-specific output directory. Edit the spec and rebuild rather than hand-editing generated HTML.

## 5. Export and deliver

```bash
node $SK/scripts/export.mjs <slug>.html <slug>.png <slug>.mp4 <slug>.mmd --theme sketch --seconds 12
```

With no requested format, deliver HTML plus the editable spec. Add the requested PNG, MP4, GIF or Mermaid. HTML is offline and self-contained with a theme selector, pause and actual-size controls. A browser URL theme choice does not modify the file; CLI exports use the embedded theme unless `--theme` overrides it. The toolbar is excluded from captures.

Mermaid preserves logical edge direction but lays out the map itself; routes anchored only on raw points may be omitted with an exporter warning. Explain material omissions. Static association maps can remain still; do not add meaningless motion solely to create a video.

Deliver files through the current surface's attachment/artifact mechanism and explain what the map shows and any inferred or omitted parts. Follow the user's existing installation, publishing and communication scope; creating a map does not authorize posting it elsewhere.
