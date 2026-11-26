import json
import threading
from pathlib import Path
from collections import Counter

import requests

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm_client import SUPPORTED_MODELS
from defense_engine import CONFIGURATIONS
from retriever import load_documents
from attack_engine import execute_test
from evaluation_engine import evaluate_response


BASE_DIR = Path(__file__).parent

DATASET_DIR = BASE_DIR / "datasets"
RESULTS_DIR = BASE_DIR / "results"
KNOWLEDGE_DIR = BASE_DIR / "knowledge_base"

experiment_lock = threading.Lock()


app = FastAPI(
    title="AIShield Research API",
    description=(
        "Adversarial security benchmarking "
        "and defense evaluation for LLM applications."
    ),
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)


def read_json(path, default=None):

    if not path.exists():
        return default

    try:

        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)

    except (json.JSONDecodeError, OSError):

        raise HTTPException(
            status_code=503,
            detail="Research records temporarily unavailable."
        )


def get_cases():

    return read_json(
        DATASET_DIR / "test_cases.json",
        []
    )


def get_results():

    return read_json(
        RESULTS_DIR / "comparative_results.json",
        []
    )


# -----------------------------------
# SYSTEM HEALTH
# -----------------------------------

@app.get("/api/health")
def health():

    ollama_online = False
    installed_models = []

    try:

        response = requests.get(
            "http://localhost:11434/api/tags",
            timeout=3
        )

        response.raise_for_status()

        installed_models = [
            model["name"]
            for model in response.json().get("models", [])
        ]

        ollama_online = True

    except requests.RequestException:
        pass

    return {
        "api_status": "online",
        "ollama_online": ollama_online,
        "installed_models": installed_models,
        "supported_models": SUPPORTED_MODELS,
        "version": "1.0.0"
    }


# -----------------------------------
# RESEARCH OVERVIEW
# -----------------------------------

@app.get("/api/overview")
def overview():

    cases = get_cases()
    results = get_results()

    total_planned = (
        len(cases)
        * len(SUPPORTED_MODELS)
        * len(CONFIGURATIONS)
    )

    completed = sum(
        r.get("status") == "completed"
        for r in results
    )

    errors = sum(
        r.get("status") == "error"
        for r in results
    )

    attempted = len(results)

    last_experiment = results[-1] if results else None

    return {
        "project": "AIShield",
        "total_cases": len(cases),
        "total_models": len(SUPPORTED_MODELS),
        "total_configurations": len(CONFIGURATIONS),
        "total_planned_experiments": total_planned,
        "attempted_experiments": attempted,
        "completed_experiments": completed,
        "execution_errors": errors,
        "remaining_experiments": max(
            total_planned - attempted, 0
        ),
        "progress_percentage": round(
            attempted / total_planned * 100, 2
        ) if total_planned else 0,
        "category_distribution": dict(
            Counter(c["category"] for c in cases)
        ),
        "last_experiment": last_experiment,
        "pilot_metrics": read_json(
            RESULTS_DIR / "pilot_evaluation_summary.json",
            []
        )
    }


# -----------------------------------
# MODELS AND DEFENSE CONFIGURATIONS
# -----------------------------------

@app.get("/api/models")
def models():

    return [
        {
            "id": "llama3.2:3b",
            "name": "Llama 3.2",
            "developer": "Meta",
            "parameters": "3B"
        },
        {
            "id": "qwen2.5:3b",
            "name": "Qwen 2.5",
            "developer": "Alibaba",
            "parameters": "3B"
        }
    ]


@app.get("/api/configurations")
def configurations():

    return [
        {
            "id": config_id,
            "name": name,
            "prompt_defense": config_id in {"C1", "C3"},
            "application_defense": config_id in {"C2", "C3"}
        }

        for config_id, name in CONFIGURATIONS.items()
    ]


# -----------------------------------
# ADVERSARIAL DATASET
# -----------------------------------

@app.get("/api/test-cases")
def test_cases(category: str | None = None):

    cases = get_cases()

    if category:

        cases = [
            case for case in cases
            if case["category"] == category
        ]

    return cases


@app.get("/api/test-cases/{case_id}")
def test_case_details(case_id: str):

    for case in get_cases():

        if case["id"] == case_id:
            return case

    raise HTTPException(
        status_code=404,
        detail="Test case not found."
    )


# -----------------------------------
# KNOWLEDGE BASE
# -----------------------------------

@app.get("/api/knowledge-base")
def knowledge_base():

    documents = []

    for path in sorted(KNOWLEDGE_DIR.glob("*.txt")):

        content = path.read_text(encoding="utf-8")

        documents.append({
            "filename": path.name,
            "content": content,
            "characters": len(content),
            "words": len(content.split()),
            "source": "Original research knowledge base"
        })

    return documents


# -----------------------------------
# BENCHMARK RESULTS
# -----------------------------------

@app.get("/api/benchmark/results")
def benchmark_results(
    model: str | None = None,
    configuration: str | None = None,
    category: str | None = None
):

    results = get_results()

    if model:

        results = [
            r for r in results
            if r.get("model") == model
        ]

    if configuration:

        results = [
            r for r in results
            if r.get("configuration") == configuration
        ]

    if category:

        results = [
            r for r in results
            if r.get("category") == category
        ]

    return results


@app.get("/api/benchmark/summary")
def benchmark_summary():

    results = get_results()

    evaluated = read_json(
        RESULTS_DIR / "evaluated_results.json",
        []
    )

    def experiment_keys(records):

        return {
            (
                r.get("model"),
                r.get("configuration"),
                r.get("id")
            )
            for r in records
        }

    if (
        not results
        or not evaluated
        or len(results) != len(evaluated)
        or experiment_keys(results) != experiment_keys(evaluated)
        or any(
            r.get("evaluation", {}).get("review_required")
            for r in evaluated
        )
    ):

        return {
            "status": "pending_evaluation",
            "summaries": []
        }

    summaries = read_json(
        RESULTS_DIR / "evaluation_summary.json",
        []
    )

    return {
        "status": "available" if summaries else "pending_evaluation",
        "summaries": summaries
    }


# -----------------------------------
# SECURITY AUDIT LOGS
# -----------------------------------

@app.get("/api/audit-logs")
def audit_logs():

    logs = []

    for index, result in enumerate(get_results(), start=1):

        decision = result.get("security_decision", {})

        logs.append({
            "event_id": f"EVT-{index:04}",
            "test_id": result.get("id"),
            "model": result.get("model"),
            "configuration": result.get("configuration"),
            "category": result.get("category"),
            "action": decision.get("action"),
            "reason": decision.get("reason"),
            "uploader_verified": decision.get("uploader_verified"),
            "content_flagged": decision.get("content_flagged"),
            "findings": decision.get("findings", []),
            "retrieved_document": result.get("retrieved_document"),
            "latency": result.get("total_latency_seconds"),
            "status": result.get("status")
        })

    return logs[::-1]


# -----------------------------------
# INTERACTIVE ATTACK LAB
# -----------------------------------

class ExperimentRequest(BaseModel):

    case_id: str
    model: str = "llama3.2:3b"
    configuration: str = "C0"


@app.post("/api/experiments/run")
def run_experiment(request: ExperimentRequest):

    if request.model not in SUPPORTED_MODELS:

        raise HTTPException(
            status_code=400,
            detail="Unsupported model."
        )

    if request.configuration not in CONFIGURATIONS:

        raise HTTPException(
            status_code=400,
            detail="Invalid defense configuration."
        )

    case = test_case_details(request.case_id)

    planned = (
        len(get_cases())
        * len(SUPPORTED_MODELS)
        * len(CONFIGURATIONS)
    )

    if len(get_results()) < planned:

        raise HTTPException(
            status_code=409,
            detail=(
                "Interactive experiments are disabled "
                "until the main benchmark finishes."
            )
        )

    if not experiment_lock.acquire(blocking=False):

        raise HTTPException(
            status_code=409,
            detail="Another interactive experiment is running."
        )

    try:

        documents = load_documents()

        result = execute_test(
            case,
            documents,
            request.configuration,
            request.model
        )

        result = evaluate_response(result)

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:

        experiment_lock.release()


@app.get("/")
def root():

    return {
        "name": "AIShield Research API",
        "documentation": "/docs",
        "status": "online"
    }