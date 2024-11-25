const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Hugging Face API key from your environment variables
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

router.post('/generate-question', async (req, res) => {
  const { jobTitle, jobDescription, experience } = req.body;

  // Ensure that all required fields are provided
  if (!jobTitle || !jobDescription || !experience) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Prepare the prompt to generate the interview question
  const prompt = `Act as an interviewer. Start by asking for an introduction.
    Then ask relevant questions for a ${jobTitle} role with ${experience} years of experience.
    The job description is: ${jobDescription}.`;

  try {
    // Send request to Hugging Face API for text generation
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct',
      //'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct',
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the generated text
    const generatedText = response.data[0]?.generated_text?.trim() || '';
    if (!generatedText) {
      return res.status(500).json({ error: 'Error generating interview question.' });
    }

    // Optionally clean up the generated text if necessary (e.g., remove unnecessary prefixes)
    const question = generatedText.replace(/Interview Question:/, '').trim(); 

    // Send back the generated question as the response
    res.json({ question });
  } catch (error) {
    console.error('Error generating interview question:', error);
    res.status(500).json({ error: 'Error generating interview question.' });
  }
});

module.exports = router;
