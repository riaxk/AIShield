from pathlib import Path
import math

from embedding_client import get_embedding


KNOWLEDGE_BASE = Path(__file__).parent / "knowledge_base"


def cosine_similarity(vector_a, vector_b):

    dot_product = sum(
        a * b for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(
        sum(a * a for a in vector_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in vector_b)
    )

    denominator = magnitude_a * magnitude_b

    if denominator == 0:
        return 0.0

    return dot_product / denominator


def load_documents():

    documents = []

    for file in sorted(KNOWLEDGE_BASE.glob("*.txt")):

        content = file.read_text(encoding="utf-8")

        documents.append({
            "filename": file.name,
            "content": content,
            "embedding": get_embedding(
                "search_document: " + content
            )
        })

    return documents


def retrieve(question, documents, top_k=1):

    question_embedding = get_embedding(
        "search_query: " + question
    )

    results = []

    for doc in documents:

        score = cosine_similarity(
            question_embedding,
            doc["embedding"]
        )

        results.append({
            "filename": doc["filename"],
            "content": doc["content"],
            "score": score
        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results[:top_k]


if __name__ == "__main__":

    print("Indexing knowledge base...")

    documents = load_documents()

    question = input("\nEnter your question: ")

    results = retrieve(
        question,
        documents,
        top_k=4
    )

    print("\nRetrieval results:")

    for result in results:

        print(
            result["filename"],
            round(result["score"], 4)
        )

    if results:
        print("\nBest matching document:")
        print(results[0]["content"])
    else:
        print("No documents found.")