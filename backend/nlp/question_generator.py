from transformers import pipeline

# Initialize the Hugging Face question generation model
question_generator = pipeline('text-generation', model='gpt-2')

def generate_interview_question(profile_info):
    """
    Generates interview questions based on user profile and job role.
    
    :param profile_info: Information about the user (skills, job role, etc.)
    :return: Generated interview question as a string
    """
    prompt = f"Generate an interview question for someone applying as a {profile_info['job_role']} with skills in {profile_info['skills']}."
    
    question = question_generator(prompt, max_length=100, num_return_sequences=1)[0]['generated_text']
    
    return question
