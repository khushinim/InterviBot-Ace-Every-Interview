from flask import Flask, request, jsonify
import openai
from transformers import pipeline, BertTokenizer, BertForSequenceClassification

app = Flask(__name__)

# OpenAI setup
openai.api_key = 'sk-2DX4lcvH3q5_UrsNqUg-LuM1XRiOAMfhP35ansXjRnT3BlbkFJA9VZLP5cLh5n0lFnoq_VqkK3EdkpXsICUu_SIzgqIA'

# BERT for response evaluation
model_name = 'bert-base-uncased'
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(model_name)
nlp = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.get_json()
    job_title = data.get('jobTitle')
    job_description = data.get('jobDescription')

    prompt = f"Generate 5 interview questions for a {job_title} based on the following job description:\n{job_description}"

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150,
        n=1,
        stop=None,
        temperature=0.7
    )

    questions = response.choices[0].text.strip().split("\n")
    return jsonify({"questions": questions})

@app.route('/evaluate-response', methods=['POST'])
def evaluate_response():
    data = request.get_json()
    candidate_response = data.get('response')
    generated_question = data.get('question')

    result = nlp(f"Question: {generated_question} Answer: {candidate_response}")
    return jsonify({"evaluation": result})

if __name__ == '__main__':
    app.run(debug=True)
