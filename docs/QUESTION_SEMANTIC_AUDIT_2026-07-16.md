# Question semantic audit — 2026-07-16

## Outcome

All 136 English questions across all 15 banks were read as questions, not merely parsed as JSON. The review checked whether each prompt asks a coherent concept, whether exactly one option is defensibly best, whether the explanation supports that option, whether claims are scoped correctly, and whether cited sources actually support the wording.

Thirty-seven questions received high-confidence corrections. Changes in the 11 bilingual banks were mirrored in French. The remaining 99 questions were reviewed and retained because this pass found no material semantic defect that justified a high-confidence rewrite.

This is an AI-assisted editorial and source audit, not a human subject-matter certification. It does not change the expert-verification checkboxes in `data/data-provenance.md`.

## Review rubric

Each item was evaluated for:

1. **Factual correctness** — the answer and explanation agree with authoritative documentation or original research where the claim is specialized, legal, historical, or product-specific.
2. **Single best answer** — distractors do not also satisfy the prompt under a reasonable interpretation.
3. **Scope and modality** — words such as *always*, *requires*, *prevents*, and *guarantees* are used only when the evidence supports them.
4. **Definition fidelity** — the item tests the named concept rather than one narrow subtype or one implementation.
5. **Explanation fidelity** — the explanation supports the answer without adding a new unsupported claim.
6. **Source integrity** — a citation points to the right paper, law, license, standard, or first-party statement.
7. **Translation parity** — substantive English changes are represented in the corresponding French item.
8. **Assessment quality** — duplicate questions, answer-length cues, implausible distractors, and categorical wording were examined as potential test-taking cues.

## High-confidence corrections

### Definition, scope, and overclaim corrections

| IDs | Correction |
| --- | --- |
| `mech-06` | Changed knowledge cutoff from a hard date boundary to an approximate summary of pre-training recency, with post-training, prompt, retrieval, and tool caveats. |
| `tfm-05` | Clarified that content-based self-attention lacks positional information; a causal mask supplies direction but is not a complete positional mechanism. |
| `pmt-09`, `saf-05` | Restored the direct/indirect prompt-injection taxonomy and made the overlap with jailbreaking explicit, following OWASP. |
| `pmt-10` | Reframed a reasoning budget as provider-dependent inference-time effort rather than necessarily visible “output tokens.” |
| `rag-02` | Replaced the categorical “reduces hallucination” claim with the supported claim that relevant retrieval can ground answers and reduce unsupported output. |
| `ctx-04` | Identified “attention budget” as an engineering metaphor rather than a literal capacity counter. |
| `mm-02` | Removed an architecture-specific image-encoder/decoder layout from the definition of a vision-language model. |
| `ft-02` | Removed the false guarantee that PEFT avoids catastrophic forgetting. |
| `mval-03`, `mval-06` | Removed universal TCO and OpEx/fixed-cost claims; made system scope and utilization dependence explicit. |

### Ambiguity and safety-language corrections

| IDs | Correction |
| --- | --- |
| `agt-07` | Removed a semantic duplicate of `evl-04` and replaced it with the distinct question of why LLM-judge scores need task-relevant human calibration. |
| `hns-03` | Changed an unsupported “popularized/credited” claim to the directly evidenced fact that Mitchell Hashimoto used the label in the dated essay. |
| `mapp-01`, `mapp-06` | Replaced “ensuring/prevents” language with defensible risk-reduction claims and named the conditions and layered controls that make oversight meaningful. |

### Source-level and technical corrections

| IDs | Correction |
| --- | --- |
| `ctx-03` | Added the original July 2025 Chroma source and tightened the definition of context rot. |
| `mm-07` | Replaced “dominant” visual backbone with the supported “widely used” claim. |
| `mm-10` | Removed unpublished claims about GPT-4o sharing weights and cross-modal attention at every layer; retained only OpenAI's documented end-to-end, single-model distinction. |
| `eth-03` | Corrected disparate impact to a facially neutral practice that disproportionately harms a protected group. |
| `eth-04` | Removed chain-of-thought as inherently faithful explainability and documented the known unfaithfulness caveat. |
| `eth-06` | Corrected the EU AI Act claim: Article 50 requires machine-readable marking and detectability in scope, not one universally mandated watermarking technique. |
| `eth-07` | Replaced the wrong paper/authors and wrong trio of criteria with the actual Kleinberg–Mullainathan–Raghavan risk-score result. |
| `eth-10` | Defined alignment tax as a possible task-performance cost, not an inevitable empirical degradation, and added the InstructGPT source. |
| `ft-03`, `ft-06`, `ft-08`, `ft-10` | Corrected LoRA overhead wording, DPO's objective, QLoRA's demonstrated hardware claim, and model-merging guarantees. |
| `evl-04`, `evl-06`, `evl-08`, `evl-09` | Removed “human-quality” and “inevitable” claims, corrected pass@k estimation, and made Arena's Elo description historical and preference-dependent. |
| `mval-04`, `mval-05`, `mval-07`, `mval-08` | Removed a nonexistent single “most common” scaling barrier, added the NIST source, restored the full SPACE dimensions, and distinguished ISO/IEC 42001 requirements from optional certification. |
| `mapp-04`, `mapp-08` | Replaced universal privacy-law instructions with data minimization and context-dependent safeguards; corrected the precise Llama 3 license condition. |

## Complete coverage record

The following matrix makes the 136/136 review claim auditable. “Changed” means the content was edited in this pass. “Retained” means the question was read under the rubric above and no material defect met the high-confidence edit threshold.

| Bank | Changed | Retained after review |
| --- | --- | --- |
| Foundations | — | `fnd-01`–`fnd-10` |
| LLM Mechanics | `mech-06` | `mech-01`–`mech-05`, `mech-07`–`mech-10` |
| Transformer Architecture | `tfm-05` | `tfm-01`–`tfm-04`, `tfm-06`–`tfm-08` |
| Prompt Engineering | `pmt-09`, `pmt-10` | `pmt-01`–`pmt-08` |
| RAG & Retrieval | `rag-02` | `rag-01`, `rag-03`–`rag-08` |
| Agents & Tooling | `agt-07` | `agt-01`–`agt-06`, `agt-08`–`agt-10` |
| Context Engineering | `ctx-03`, `ctx-04` | `ctx-01`, `ctx-02`, `ctx-05`–`ctx-08` |
| Harness Engineering | `hns-03` | `hns-01`, `hns-02`, `hns-04`–`hns-08` |
| Safety & Alignment | `saf-05` | `saf-01`–`saf-04`, `saf-06`–`saf-08` |
| Multimodal AI | `mm-02`, `mm-07`, `mm-10` | `mm-01`, `mm-03`–`mm-06`, `mm-08`, `mm-09` |
| AI Ethics & Governance | `eth-03`, `eth-04`, `eth-06`, `eth-07`, `eth-10` | `eth-01`, `eth-02`, `eth-05`, `eth-08`, `eth-09` |
| Fine-tuning & Adaptation | `ft-02`, `ft-03`, `ft-06`, `ft-08`, `ft-10` | `ft-01`, `ft-04`, `ft-05`, `ft-07`, `ft-09` |
| Evals & Benchmarking | `evl-04`, `evl-06`, `evl-08`, `evl-09` | `evl-01`–`evl-03`, `evl-05`, `evl-07`, `evl-10` |
| AI Business Value & ROI | `mval-03`–`mval-08` | `mval-01`, `mval-02` |
| AI in the Workspace | `mapp-01`, `mapp-04`, `mapp-06`, `mapp-08` | `mapp-02`, `mapp-03`, `mapp-05`, `mapp-07` |

## Assessment-quality findings that remain

`npm run analyze-question-quality` provides reproducible structural indicators. At this audit point:

- There are no exact normalized duplicate prompts.
- 44 of 136 questions have at least one distractor containing an absolutist cue such as *only*, *never*, or *completely* while the correct option does not.
- 60 of 136 correct options (44.1%) are uniquely the longest answer; 9 have a correct-to-distractor mean length ratio of at least 1.5.
- Source URLs are present on 44 of 136 English questions. A URL count is not equivalent to correctness, and common foundational definitions do not always need an item-level citation, but the remaining provenance gap should not be mislabeled as expert verification.
- The stored correct-answer indexes are uneven, but the runtime shuffles each question's option order before display, so the stored index distribution is not a learner-visible answer-position cue.

These are real risks to discrimination quality, but not proof that each flagged question is invalid. A wholesale rewrite would violate the high-confidence constraint and could introduce new ambiguity. The appropriate next evidence is item-response data (difficulty, discrimination, distractor selection) and an independent human review by domain experts and a French-language reviewer.

## Principal evidence used

- [OWASP LLM01: Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [Chroma: Context Rot](https://www.trychroma.com/research/context-rot)
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Mitchell Hashimoto: My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [OpenAI: Hello GPT-4o](https://openai.com/index/hello-gpt-4o/)
- [NIST AI RMF Govern playbook](https://airc.nist.gov/airmf-resources/playbook/govern/)
- [Turpin et al.: Unfaithful explanations in chain-of-thought prompting](https://arxiv.org/abs/2305.04388)
- [EU AI Act, Article 50](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=en)
- [Kleinberg, Mullainathan, and Raghavan: Inherent Trade-Offs in the Fair Determination of Risk Scores](https://arxiv.org/abs/1609.05807)
- [OpenAI: Aligning language models to follow instructions](https://openai.com/index/instruction-following/)
- [DPO](https://arxiv.org/abs/2305.18290), [QLoRA](https://arxiv.org/abs/2305.14314), and [TIES-Merging](https://arxiv.org/abs/2306.01708)
- [HumanEval](https://arxiv.org/abs/2107.03374) and [Chatbot Arena](https://arxiv.org/abs/2403.04132)
- [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)
- [The SPACE of Developer Productivity](https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity-theres-more-to-it-than-you-think/)
- [ISO/IEC 42001 explained](https://www.iso.org/home/insights-news/resources/iso-42001-explained-what-it-is.html)
- [GDPR, including Article 5](https://eur-lex.europa.eu/eli/reg/2016/679/)
- [Meta Llama 3 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3/LICENSE)

## Verification commands

```text
npm run validate-data
npm run analyze-question-quality
npx tsc --noEmit
npm test
npm run build
```
