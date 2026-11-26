import requests


OLLAMA_URL = "http://localhost:11434/api/chat"

MODEL = "llama3.2:3b"

SUPPORTED_MODELS = [
    "llama3.2:3b",
    "qwen2.5:3b"
]


def query_llm(
    system_prompt,
    user_prompt,
    model=MODEL
):

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        "stream": False,
        "options": {
            "temperature": 0,
            "seed": 42
        }
    }

    response = requests.post(
        OLLAMA_URL,
        json=payload,
        timeout=120
    )

    response.raise_for_status()

    return response.json()["message"]["content"]


if __name__ == "__main__":

    for model in SUPPORTED_MODELS:

        print("\nTesting model:", model)

        answer = query_llm(
            "Employees receive 20 days of annual leave.",
            "How many annual leaves do I get?",
            model=model
        )

        print("Response:", answer)