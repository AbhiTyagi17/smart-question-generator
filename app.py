from flask import Flask, render_template, request, jsonify
from google import genai  # New unified SDK
from dotenv import load_dotenv
import os

# Load API key from .env
load_dotenv()

# Create the client exactly like your working test_gemini.py
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate_questions():
    data = request.json
    text = data.get("text", "").strip()
    q_type = data.get("type", "MCQ")
    num_questions = data.get("num_questions", 5)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        num_questions = int(num_questions)
        num_questions = max(1, min(20, num_questions))  # Limit 1-20
    except:
        num_questions = 5

    type_name = "multiple-choice (MCQ)" if q_type == "MCQ" else "short answer"


    prompt = f"""
You are an expert educator. Generate exactly {num_questions} high-quality {type_name} questions based ONLY on the provided text.

STRICT FORMATTING RULES - FOLLOW EXACTLY:

1. Start each question with its number: 1. , 2. , etc.
2. Write the full question text.
3. For MCQs:
   - List options as:
     A. Option one
     B. Option two
     C. Option three
     D. Option four
   - On a NEW LINE after the options, write: **Correct Answer: A** (or B, C, D)
4. For Short Answer:
   - After the question, on a NEW LINE, write: Answer: [brief correct answer here]

DO NOT mention the correct answer anywhere else in the question.
DO NOT add explanations, introductions, or extra text.

Example MCQ:
1. What is the capital of France?
   A. London
   B. Berlin
   C. Paris
   D. Madrid
**Correct Answer: C**

Example Short Answer:
2. Define photosynthesis in one sentence.
Answer: Photosynthesis is the process by which green plants use sunlight to convert carbon dioxide and water into glucose and oxygen.

Text to base questions on:
{text}

Now generate exactly {num_questions} questions following the rules above.
"""

    try:
        response = client.models.generate_content(
            model="models/gemini-2.5-flash-lite",  # Updated: more reliable & current as of late 2025
            contents=prompt
        )
        return jsonify({"questions": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)