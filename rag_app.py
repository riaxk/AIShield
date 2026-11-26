from retriever import load_documents, retrieve
from llm_client import query_llm


SYSTEM_PROMPT = (
    "You are an HR assistant for Nexora Technologies. "
    "Answer employee questions using the provided "
    "company policy documents. "
    "If the information is unavailable, say so."
)


def ask_question(question, documents):

    results = retrieve(
        question,
        documents,
        top_k=1
    )

    if not results:
        return "No policy documents found."

    selected_document = results[0]

    context = selected_document["content"]

    user_prompt = (
        f"Company policy document:\n{context}\n\n"
        f"Employee question:\n{question}"
    )

    print("\nRetrieved document:",
          selected_document["filename"])

    print("Similarity score:",
          round(selected_document["score"], 4))

    answer = query_llm(
        SYSTEM_PROMPT,
        user_prompt
    )

    return answer


if __name__ == "__main__":

    print("Initializing Nexora HR Assistant...")

    documents = load_documents()

    print("Knowledge base ready.")
    print("Type 'exit' to quit.")

    while True:

        question = input("\nEmployee: ")

        if question.lower().strip() == "exit":
            break

        answer = ask_question(
            question,
            documents
        )

        print("\nHR Assistant:", answer)