// backend/controllers/questionController.js

// Sample controller to handle question generation
exports.generateInterviewQuestions = (req, res) => {
    const { jobTitle, jobDescription } = req.body;
  
    // Here you can integrate your question-generation logic, for example:
    const generatedQuestions = [
      `Tell me about a time when you worked as a ${jobTitle}.`,
      `How would you approach the tasks mentioned in the job description for ${jobTitle}?`
    ];
  
    // Send the generated questions back as a response
    res.status(200).json({ questions: generatedQuestions });
  };
  