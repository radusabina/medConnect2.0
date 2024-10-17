import openai
import fitz


def translate_text(text, start_language="Romanian",target_language="English"):
    prompt = (f"Translate the following sentence to {target_language} in a natural and fluent way: {text}. The sentence"
              f" is written in { start_language}")

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=200
    )

    translation = response['choices'][0]['message']['content']
    return translation.strip()


def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()
    return text
