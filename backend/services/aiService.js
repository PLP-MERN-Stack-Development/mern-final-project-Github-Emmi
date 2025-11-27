const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = 'gpt-4-turbo-preview';
    this.embeddingModel = 'text-embedding-3-small';
  }

  // Generate study recommendations based on user progress
  async getStudyRecommendations(userId, courseId, userProgress) {
    try {
      const prompt = `
You are an expert learning advisor. Based on the following student information, provide 5 personalized study recommendations.

Student Progress: ${userProgress.completedLessons || 0}% complete
Recent Grades: ${userProgress.recentGrades?.join(', ') || 'No grades yet'}
Struggling Areas: ${userProgress.strugglingAreas?.join(', ') || 'None identified'}
Learning Pace: ${userProgress.pace || 'Normal'}

Provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Brief description",
      "priority": "high|medium|low",
      "category": "study_habit|resource|practice|concept_review",
      "estimatedTime": "time in minutes"
    }
  ]
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful learning advisor specializing in personalized education.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI study recommendations error:', error);
      throw new Error('Failed to generate study recommendations');
    }
  }

  // Generate textbook/resource recommendations
  async getResourceRecommendations(courseTitle, courseDescription, currentTopic) {
    try {
      const prompt = `
You are an expert educator. Recommend 5 high-quality learning resources for a student studying:

Course: ${courseTitle}
Description: ${courseDescription}
Current Topic: ${currentTopic || 'General course content'}

Provide a mix of:
- Textbooks
- Online courses/tutorials
- YouTube channels
- Documentation
- Practice platforms

Return in JSON format:
{
  "resources": [
    {
      "title": "Resource title",
      "type": "textbook|video|course|documentation|practice",
      "author": "Author/Creator name",
      "url": "URL if available or 'Search online'",
      "description": "Why this resource is helpful",
      "difficulty": "beginner|intermediate|advanced",
      "isFree": true|false
    }
  ]
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable education resource curator.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI resource recommendations error:', error);
      throw new Error('Failed to generate resource recommendations');
    }
  }

  // Generate embeddings for content
  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Generate embedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Analyze student performance and provide insights
  async analyzePerformance(submissions, assignments) {
    try {
      const performanceData = submissions.map((sub, idx) => ({
        assignment: assignments[idx]?.title,
        score: sub.score,
        maxScore: assignments[idx]?.maxScore,
        isLate: sub.isLate,
        feedback: sub.feedback
      }));

      const prompt = `
Analyze the following student performance data and provide insights:

${JSON.stringify(performanceData, null, 2)}

Provide analysis in JSON format:
{
  "overallPerformance": "excellent|good|average|needs_improvement",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvementAreas": ["area1", "area2"],
  "motivationalMessage": "Encouraging message for the student",
  "nextSteps": ["step1", "step2", "step3"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an educational analyst providing constructive feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI performance analysis error:', error);
      throw new Error('Failed to analyze performance');
    }
  }

  // Auto-grade submission (assistant for tutors)
  async preGradeSubmission(assignmentDescription, rubric, submissionText) {
    try {
      const prompt = `
You are a teaching assistant. Pre-grade the following student submission based on the assignment criteria.

Assignment: ${assignmentDescription}

Rubric:
${JSON.stringify(rubric, null, 2)}

Student Submission:
${submissionText}

Provide grading in JSON format:
{
  "suggestedScore": number,
  "maxScore": number,
  "feedback": "Detailed constructive feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "confidence": number (0-100)
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a fair and constructive grading assistant. Provide honest, helpful feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5 // Lower temperature for more consistent grading
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI pre-grading error:', error);
      throw new Error('Failed to pre-grade submission');
    }
  }

  // Summarize video transcript
  async summarizeTranscript(transcript) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at summarizing educational content into clear, concise notes.'
          },
          {
            role: 'user',
            content: `Summarize this class transcript into key points and actionable notes:\n\n${transcript}`
          }
        ],
        temperature: 0.5
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI transcript summary error:', error);
      throw new Error('Failed to summarize transcript');
    }
  }

  // Generate study plan
  async generateStudyPlan(courseData, availableHoursPerWeek, studentLevel) {
    try {
      const prompt = `
Create a personalized study plan for:

Course: ${courseData.title}
Description: ${courseData.description}
Duration: ${courseData.duration || 'Flexible'}
Student Level: ${studentLevel}
Available Hours/Week: ${availableHoursPerWeek}

Provide a week-by-week study plan in JSON format:
{
  "totalWeeks": number,
  "weeklyPlan": [
    {
      "week": number,
      "topics": ["topic1", "topic2"],
      "goals": ["goal1", "goal2"],
      "studyHours": number,
      "activities": ["activity1", "activity2"]
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning strategist creating effective study plans.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI study plan error:', error);
      throw new Error('Failed to generate study plan');
    }
  }

  // Answer student questions
  async answerQuestion(question, courseContext) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful tutor for the course: ${courseContext}. Provide clear, educational answers.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI answer question error:', error);
      throw new Error('Failed to answer question');
    }
  }
}

module.exports = new AIService();
