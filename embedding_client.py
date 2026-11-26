import requests

EMBEDDING_URL = "http://localhost:11434/api/embed"
EMBEDDING_MODEL = "nomic-embed-text"


def get_embedding(text):

    payload = {
        "model": EMBEDDING_MODEL,
        "input": text
    }

    response = requests.post(
        EMBEDDING_URL,
        json=payload,
        timeout=120
    )

    response.raise_for_status()

    return response.json()["embeddings"][0]


if __name__ == "__main__":

    vector = get_embedding(
        "search_query: How many annual leaves do I get?"
    )

    print("Vector dimensions:", len(vector))
    print("First 10 values:", vector[:10])