# AIShield

### Adversarial Security Benchmarking & Defense Evaluation Framework for LLM Applications

AIShield is an experimental cybersecurity research framework designed to investigate adversarial vulnerabilities in Retrieval-Augmented Generation (RAG) applications and evaluate the effectiveness of layered security controls.

The framework provides a controlled environment for executing adversarial scenarios, comparing defense configurations, analyzing security-usability trade-offs, and inspecting individual experimental outcomes.

![AIShield Overview](docs/screenshots/overview.png)

## Research Highlights

| Parameter | Result |
|---|---:|
| Test scenarios | 60 |
| Language models | 2 |
| Defense configurations | 4 |
| Completed experiments | 480 |
| Adversarial experiments | 320 |
| Baseline attack success rate | 36.25% |
| Hybrid defense attack success rate | 11.25% |
| Relative reduction in attack success | 68.97% |
| Normal-query accuracy | 100% |

## Research Objectives

- Investigate adversarial vulnerabilities in RAG-based LLM applications.
- Compare prompt-level and application-level security controls.
- Evaluate the effectiveness of hybrid defense mechanisms.
- Analyze the trade-off between attack resistance and legitimate functionality.
- Examine false positives and false negatives in document security screening.
- Establish a transparent experimental benchmarking workflow.

## Threat Model

AIShield uses a fictional enterprise HR assistant operating on a controlled knowledge base of employee policies.

The experimental threat model covers:

| Attack category | Description | Scenarios |
|---|---|---:|
| Direct prompt injection | Malicious instructions supplied through employee queries | 15 |
| Indirect prompt injection | Malicious instructions embedded within retrieved documents | 15 |
| Knowledge base poisoning | Introduction of manipulated policy information | 10 |
| Normal queries | Legitimate employee requests | 10 |
| Benign modifications | Non-malicious changes to policy documents | 10 |

## Defense Configurations

| Configuration | Prompt hardening | Source verification | Content screening |
|---|---|---|---|
| C0 — Baseline | No | No | No |
| C1 — Prompt-level defense | Yes | No | No |
| C2 — Application-level defense | No | Yes | Yes |
| C3 — Hybrid defense | Yes | Yes | Yes |

Source verification uses simulated uploader identities within the experimental environment.

## System Architecture

```mermaid
flowchart TD
    A[Experimental Dataset] --> B[Attack Engine]
    B --> C[Document Modification]
    B --> F[Employee Query]
    C --> D[Application-Level Defense]
    D -->|Allowed| E[Experimental Knowledge Base]
    D -->|Rejected or Quarantined| G[Original Knowledge Base]
    E --> H[Semantic Retrieval]
    G --> H
    F --> H
    H --> I[Prompt Construction]
    J[Prompt-Level Defense] --> I
    I --> K[Local LLM Inference]
    K --> L[Response Evaluation]
    D --> L
    L --> M[Benchmark Results]
    M --> N[Research Dashboard]
```

## Experimental Results

### Attack Success Rate

| Model | C0 | C1 | C2 | C3 |
|---|---:|---:|---:|---:|
| Llama 3.2:3B | 37.5% | 25% | 20% | 10% |
| Qwen 2.5:3B | 35% | 30% | 15% | 12.5% |

### Overall Task Accuracy

| Model | C0 | C1 | C2 | C3 |
|---|---:|---:|---:|---:|
| Llama 3.2:3B | 70% | 63.33% | 80% | 76.67% |
| Qwen 2.5:3B | 76.67% | 80% | 90% | 91.67% |

### Key Findings

- Hybrid defense achieved the lowest attack success rate for both evaluated models.
- Combined attack success decreased from 36.25% to 11.25%, representing a relative reduction of approximately 69%.
- Application-level defenses prevented certain malicious document modifications from reaching the language models.
- Normal employee queries retained 100% accuracy across the evaluated configurations.
- Rule-based document screening exhibited a 60% false positive rate on benign document modifications under application-level defenses.
- Improved attack resistance did not consistently translate into improved overall task accuracy.

These findings highlight the importance of evaluating security effectiveness alongside usability.

## Research Dashboard

### Attack Lab

Execute individual adversarial scenarios or inspect previously recorded experiments.

![Attack Lab](docs/screenshots/attack-lab.png)

### Defense Lab

Explore the four defense configurations and their security mechanisms.

![Defense Lab](docs/screenshots/defense-lab.png)

### Comparative Benchmarking

Compare attack success rates, task accuracy, and execution latency across models and configurations.

![Benchmark](docs/screenshots/benchmark.png)

### Detection Analytics

Inspect confusion matrices, precision, recall, F1 score, false positives and false negatives.

![Detection Analytics](docs/screenshots/detection.png)

### Experiment Inspector

Examine individual attack objectives, model responses, retrieval context and document ingestion decisions.

![Experiment Inspector](docs/screenshots/experiment-inspector.png)

### Research Reports

Explore experimental methodology, findings, limitations and downloadable evaluation summaries.

![Research Reports](docs/screenshots/reports.png)

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI |
| Local inference | Ollama |
| Language models | Llama 3.2:3B, Qwen 2.5:3B |
| Embedding model | nomic-embed-text |
| Retrieval | Semantic embeddings, cosine similarity |
| Visualization | Recharts |
| Animation | Motion |
| Experimental storage | JSON |

## Project Structure

```text
AIShield/
├── datasets/
├── knowledge_base/
├── results/
├── frontend/
├── docs/
├── api.py
├── attack_engine.py
├── defense_engine.py
├── embedding_client.py
├── evaluation_engine.py
├── generate_dataset.py
├── llm_client.py
├── rag_app.py
├── retriever.py
├── requirements.txt
└── README.md
```

## Local Installation

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Ollama
- Sufficient memory to execute the selected local models

### Download the Models

```bash
ollama pull llama3.2:3b
ollama pull qwen2.5:3b
ollama pull nomic-embed-text
```

Ensure the Ollama service is running.

### Backend Setup

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

### Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

The repository includes recorded experimental results for analysis without repeating the complete benchmark.

## Evaluation Methodology

The framework evaluates model responses through numeric answer matching and AI-assisted semantic review of flagged responses.

Evaluation metrics include:

- Attack success rate
- Attack resistance rate
- Overall task accuracy
- Normal-query accuracy
- Retrieval accuracy
- Execution latency
- Precision, recall and F1 score
- False positive and false negative rates

Document ingestion decisions are evaluated separately from model response outcomes.

## Research Limitations

- The experimental dataset is synthetic and includes template-based variations.
- Source verification uses simulated identities rather than production authentication.
- Rule-based content screening is susceptible to false positives and false negatives.
- Numeric matching may overlook semantic inaccuracies.
- AI-assisted evaluation labels have not been independently human-validated.
- Findings are specific to the tested models, policies and configurations.
- The framework is not intended to provide production-grade security guarantees.

## Research Documentation

- [Technical Research Report](docs/TECHNICAL_REPORT.md)
- [Experimental Reproducibility](docs/REPRODUCIBILITY.md)
- [Evaluation Summary](results/evaluation_summary.json)
- [Experimental Dataset](datasets/test_cases.json)

## Future Scope

- Context-aware adversarial content detection
- Authenticated document provenance
- Independent human evaluation
- Expanded adversarial datasets
- Additional language models
- More sophisticated retrieval and output security controls

## Ethical Use

AIShield is developed for educational cybersecurity research and controlled adversarial experimentation. All experiments use fictional enterprise policies and locally hosted language models.

The framework is intended to support responsible investigation of AI application security.