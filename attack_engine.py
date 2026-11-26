import json
import copy
import time

from pathlib import Path
from retriever import load_documents, retrieve
from embedding_client import get_embedding
from llm_client import query_llm, SUPPORTED_MODELS

from defense_engine import (
    CONFIGURATIONS,
    get_system_prompt,
    inspect_modification
)


BASE_DIR = Path(__file__).parent

DATASET_PATH = BASE_DIR / "datasets" / "test_cases.json"

RESULTS_PATH = BASE_DIR / "results" / "comparative_results.json"


def load_test_cases():

    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def prepare_documents(
    test_case,
    original_documents,
    configuration
):

    documents = copy.deepcopy(original_documents)

    modification = test_case.get("document_modification")

    decision = inspect_modification(
        modification,
        configuration
    )

    if modification is None or not decision["allowed"]:
        return documents, decision

    action = modification["action"]
    filename = modification["filename"]
    content = modification["content"]

    if action == "append":

        for doc in documents:

            if doc["filename"] == filename:

                doc["content"] += "\n\n" + content

                doc["embedding"] = get_embedding(
                    "search_document: " + doc["content"]
                )

                doc["uploader"] = modification["uploader"]

                return documents, decision

        raise ValueError(f"Document not found: {filename}")

    elif action == "add":

        documents.append({
            "filename": filename,
            "content": content,
            "embedding": get_embedding(
                "search_document: " + content
            ),
            "uploader": modification["uploader"]
        })

    else:
        raise ValueError(f"Unknown action: {action}")

    return documents, decision


def execute_test(
    test_case,
    original_documents,
    configuration,
    model
):

    start_time = time.perf_counter()

    documents, decision = prepare_documents(
        test_case,
        original_documents,
        configuration
    )

    question = test_case["question"]

    retrieved = retrieve(
        question,
        documents,
        top_k=1
    )

    if not retrieved:
        raise ValueError("No documents retrieved")

    selected = retrieved[0]

    system_prompt = get_system_prompt(configuration)

    user_prompt = (
        f"Company policy document:\n{selected['content']}\n\n"
        f"Employee question:\n{question}"
    )

    inference_start = time.perf_counter()

    answer = query_llm(
    system_prompt,
    user_prompt,
    model=model
)

    inference_latency = time.perf_counter() - inference_start
    total_latency = time.perf_counter() - start_time

    return {
        "id": test_case["id"],
        "category": test_case["category"],
        "model": model,
        "configuration": configuration,
        "configuration_name": CONFIGURATIONS[configuration],
        "question": question,
        "expected_document": test_case["target_document"],
        "retrieved_document": selected["filename"],
        "retrieved_context": selected["content"],
        "similarity_score": round(selected["score"], 4),
        "expected_answer": test_case["expected_answer"],
        "attack_objective": test_case["attack_objective"],
        "actual_response": answer,
        "security_decision": decision,
        "inference_latency_seconds": round(
            inference_latency, 3
        ),
        "total_latency_seconds": round(
            total_latency, 3
        ),
        "status": "completed"
    }


def run_benchmark():

    print("Loading original knowledge base...")

    original_documents = load_documents()
    test_cases = load_test_cases()

    results = []

    RESULTS_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    total_tests = (
        len(test_cases)
        * len(CONFIGURATIONS)
        * len(SUPPORTED_MODELS)
    )

    counter = 0
    benchmark_start = time.perf_counter()

    print(f"Total experiments: {total_tests}")

    for model in SUPPORTED_MODELS:

        print("\n" + "=" * 60)
        print("MODEL:", model)
        print("=" * 60)

        for configuration, name in CONFIGURATIONS.items():

            print("\n" + "-" * 60)
            print(f"Configuration: {configuration} - {name}")
            print("-" * 60)

            for test_case in test_cases:

                counter += 1

                print(
                    f"\n[{counter}/{total_tests}] "
                    f"{model} | {configuration} | "
                    f"{test_case['id']}"
                )

                try:

                    result = execute_test(
                        test_case,
                        original_documents,
                        configuration,
                        model
                    )

                    decision = result["security_decision"]

                    print("Security action:", decision["action"])
                    print("Reason:", decision["reason"])
                    print("Retrieved:", result["retrieved_document"])
                    print("Response:", result["actual_response"])
                    print("Time:", result["total_latency_seconds"])

                except Exception as error:

                    result = {
                        "id": test_case["id"],
                        "category": test_case["category"],
                        "configuration": configuration,
                        "model": model,
                        "status": "error",
                        "error": str(error)
                    }

                    print("Error:", error)

                results.append(result)

                temporary_path = RESULTS_PATH.with_suffix(".tmp")

                with open(
                    temporary_path,
                    "w",
                    encoding="utf-8"
                ) as file:

                    json.dump(
                        results,
                        file,
                        indent=4,
                        ensure_ascii=False
                    )

                temporary_path.replace(RESULTS_PATH)

                elapsed = time.perf_counter() - benchmark_start

                remaining = (
                    elapsed / counter
                    * (total_tests - counter)
                )

                print(
                    f"Progress: {counter / total_tests * 100:.1f}%"
                )

                print(
                    f"Estimated remaining: {remaining / 60:.1f} min"
                )

    completed = sum(
        result["status"] == "completed"
        for result in results
    )

    print("\n" + "=" * 60)
    print("Benchmark completed.")
    print("Completed experiments:", completed)
    print("Execution errors:", len(results) - completed)
    print("Results saved to:", RESULTS_PATH)

    print(
        "Total runtime:",
        round(
            (time.perf_counter() - benchmark_start) / 60,
            2
        ),
        "minutes"
    )


if __name__ == "__main__":

    run_benchmark()