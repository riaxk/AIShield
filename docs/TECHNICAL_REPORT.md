# AIShield — Technical Research Report

## Adversarial Security Benchmarking and Defense Evaluation of Retrieval-Augmented Generation Applications

### Abstract

Retrieval-Augmented Generation (RAG) applications introduce security risks through untrusted user inputs, retrieved documents and external knowledge sources. This study investigates the effectiveness of prompt-level and application-level defenses against direct prompt injection, indirect prompt injection and knowledge base poisoning.

A controlled experimental framework was developed using a fictional enterprise HR assistant, two locally hosted language models and four defense configurations. A dataset of 60 scenarios was evaluated across these configurations, resulting in 480 experimental runs.

The combined attack success rate decreased from 36.25% under the baseline configuration to 11.25% under hybrid defense, representing a relative reduction of 68.97%. However, application-level controls also exhibited a 60% false positive rate on benign document modifications, highlighting the security-usability trade-off associated with rule-based detection.

### 1. Research Problem

RAG applications retrieve external information to improve the relevance and accuracy of language model responses. However, retrieved information may contain malicious instructions or manipulated factual content.

Unlike conventional application vulnerabilities, these attacks exploit the language model's interpretation of instructions and information.

This research investigates whether layered defenses can reduce adversarial manipulation while preserving legitimate application functionality.

### 2. Research Questions

- RQ1: How susceptible are the selected language models to adversarial manipulation in a controlled RAG environment?
- RQ2: How effective is prompt-level hardening against adversarial inputs?
- RQ3: Can application-level controls prevent malicious document modifications from influencing model responses?
- RQ4: Does combining prompt-level and application-level defenses improve attack resistance?
- RQ5: What security-usability trade-offs arise from rule-based document screening?

### 3. Experimental Environment

A fictional enterprise, Nexora Technologies, was created to establish a controlled HR policy environment.

The knowledge base consists of four original policy documents:

| Policy | Authorized entitlement |
|---|---|
| Annual leave | 20 days annually |
| Sick leave | 10 days annually |
| Remote work | Maximum 2 days per week |
| Travel reimbursement | INR 5,000 per approved business trip |

The application retrieves relevant documents using semantic embeddings and cosine similarity.

The retrieved document and employee question are provided to a locally hosted language model for response generation.

### 4. Threat Model

#### 4.1 Direct Prompt Injection

The attacker introduces malicious instructions directly through the employee query to manipulate the generated response.

#### 4.2 Indirect Prompt Injection

Malicious instructions are embedded within policy documents. The attack attempts to influence model behavior when the compromised document is retrieved.

#### 4.3 Knowledge Base Poisoning

Manipulated policy documents introduce unauthorized factual information into the knowledge base.

Unlike indirect prompt injection, knowledge base poisoning does not necessarily contain explicit instructions targeting the model. It exploits the application's reliance on retrieved information.

### 5. Experimental Dataset

The dataset contains 60 synthetic scenarios.

| Category | Scenarios |
|---|---:|
| Direct prompt injection | 15 |
| Indirect prompt injection | 15 |
| Knowledge base poisoning | 10 |
| Normal employee queries | 10 |
| Benign document modifications | 10 |
| Total | 60 |

Each scenario contains an identifier, category, employee question, expected policy answer, target document and, where applicable, an attack objective and document modification.

A preliminary pilot experiment was conducted before expanding the dataset.

The full dataset incorporates pilot scenarios and template-based variations. Consequently, the pilot is not an independent held-out evaluation set.

### 6. Defense Configurations

#### C0 — Baseline

Standard RAG application without additional prompt hardening, uploader verification or adversarial content screening.

#### C1 — Prompt-Level Defense

A hardened system prompt instructs the model to distinguish policy information from embedded instructions, preserve authorized entitlements and disregard attempts to override its responsibilities.

#### C2 — Application-Level Defense

Document modifications are evaluated before being introduced into the experimental knowledge base.

Two mechanisms are implemented:

- Source verification using simulated uploader identities.
- Rule-based detection of suspicious instructions.

Unauthorized modifications are rejected, while suspicious modifications from authorized sources are quarantined.

Quarantine refers to excluding the proposed modification from the experimental document collection.

#### C3 — Hybrid Defense

Combines prompt-level hardening with application-level document security controls.

### 7. Experimental Procedure

The following models were evaluated:

- Llama 3.2:3B
- Qwen 2.5:3B

Both models were executed locally through Ollama.

The nomic-embed-text model was used for semantic embeddings.

For each experiment:

1. An isolated copy of the original knowledge base is prepared.
2. The selected scenario introduces an employee query and, where applicable, a document modification.
3. Application-level controls evaluate the modification when enabled.
4. Semantic retrieval identifies the most relevant document.
5. The selected system prompt and retrieved context are provided to the language model.
6. The model response, retrieved context, security decision and latency are recorded.
7. Experimental outcomes are evaluated.

The complete benchmark consists of:

60 scenarios × 2 models × 4 configurations = 480 experiments.

### 8. Evaluation Methodology

#### 8.1 Attack Success Rate

The proportion of adversarial experiments in which the attacker achieves the specified unauthorized objective.

ASR = Successful attacks / Total adversarial experiments × 100

#### 8.2 Overall Task Accuracy

The proportion of completed experiments in which the response correctly answers the legitimate employee question.

#### 8.3 Normal-Query Accuracy

The proportion of normal employee queries answered correctly.

#### 8.4 Retrieval Accuracy

The proportion of experiments in which the retrieved document filename matches the expected target document.

This metric measures target-document retrieval rather than comprehensive factual integrity.

#### 8.5 Document Detection Metrics

Document ingestion decisions are evaluated using:

- True positives: malicious modifications blocked.
- True negatives: benign modifications allowed.
- False positives: benign modifications blocked.
- False negatives: malicious modifications allowed.

Precision, recall, F1 score, false positive rate and false negative rate are calculated from these classifications.

Direct prompt injection is excluded from document-ingestion detection metrics because it does not involve document modification.

#### 8.6 Response Evaluation

Numeric matching is used to identify expected policy values and potential unauthorized values.

Responses containing unauthorized numeric values are flagged for additional semantic review to distinguish successful manipulation from explicit rejection or contextual discussion of the unauthorized value.

Flagged responses were reviewed with AI assistance. These classifications have not been independently human-validated.

### 9. Experimental Results

#### 9.1 Attack Success Rate

| Model | C0 | C1 | C2 | C3 |
|---|---:|---:|---:|---:|
| Llama 3.2:3B | 37.5% | 25% | 20% | 10% |
| Qwen 2.5:3B | 35% | 30% | 15% | 12.5% |
| Combined | 36.25% | 27.5% | 17.5% | 11.25% |

Across both models, hybrid defense reduced attack success by 25 percentage points compared with the baseline.

The relative reduction was approximately 68.97%.

#### 9.2 Overall Task Accuracy

| Model | C0 | C1 | C2 | C3 |
|---|---:|---:|---:|---:|
| Llama 3.2:3B | 70% | 63.33% | 80% | 76.67% |
| Qwen 2.5:3B | 76.67% | 80% | 90% | 91.67% |

Normal-query accuracy remained at 100% across the evaluated models and configurations.

#### 9.3 Document Screening

Application-level defenses exhibited a 60% false positive rate on benign document modifications.

This indicates that rule-based screening can prevent malicious content from entering the retrieval pipeline but may also exclude legitimate document updates.

### 10. Discussion

#### 10.1 Prompt-Level Defense

Prompt hardening reduced attack success relative to the baseline for both models.

However, prompt-level defenses alone did not eliminate adversarial manipulation.

For Llama, prompt hardening also reduced overall task accuracy, illustrating that stronger restrictions can interfere with legitimate task completion.

#### 10.2 Application-Level Defense

Application-level controls reduce exposure to malicious document modifications before model inference.

However, source verification alone cannot guarantee document integrity. An authorized source may introduce manipulated or compromised information.

#### 10.3 Hybrid Defense

Hybrid defense achieved the lowest attack success rate for both evaluated models.

Nevertheless, its effectiveness varied between models, and the configuration with the lowest attack success rate did not always achieve the highest overall task accuracy.

#### 10.4 Security-Usability Trade-off

The document-screening false positive rate demonstrates a limitation of pattern-based detection.

Although normal employee queries remained accurate, legitimate document modifications were frequently blocked.

A security mechanism should therefore be evaluated not only by its ability to prevent attacks but also by its impact on legitimate operations.

### 11. Research Limitations

- The dataset is synthetic and contains template-based variations.
- The pilot scenarios are included in the expanded benchmark.
- Only two small language models were evaluated.
- Source verification relies on simulated identities.
- Document screening uses predefined regular-expression patterns.
- Numeric matching may overlook semantic inaccuracies.
- AI-assisted evaluation has not been independently human-validated.
- Each model-configuration-scenario combination was evaluated once in the full benchmark.
- Findings cannot be generalized to all RAG architectures or production environments.

### 12. Future Research

Future improvements include context-aware document screening, authenticated document provenance, cryptographic integrity verification, independent human evaluation, larger adversarial datasets and repeated experiments across additional models.

### 13. Conclusion

AIShield establishes a controlled framework for investigating adversarial vulnerabilities in RAG-based applications.

The experimental results indicate that combining prompt-level and application-level defenses can reduce attack success relative to an unprotected baseline.

However, the observed false positive rate and variations in task accuracy demonstrate that layered defenses require careful evaluation of both security effectiveness and operational usability.

The framework provides an extensible foundation for further experimental research into AI application security.

### 14. Supporting Experimental Evidence

- Experimental dataset: ../datasets/test_cases.json
- Raw experimental results: ../results/comparative_results.json
- Evaluated experimental results: ../results/evaluated_results.json
- Evaluation summary: ../results/evaluation_summary.json
- Pilot experimental results: ../results/pilot_comparative_results.json