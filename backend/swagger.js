const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IndoLearn Flashcards API',
      version: '1.0.0',
      description: 'Express API for Indonesian flashcards, quizzes, and spaced repetition.',
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile' },
      { name: 'Flashcards', description: 'Flashcards CRUD and search' },
      { name: 'Categories', description: 'Categories management' },
      { name: 'Quizzes', description: 'Quiz generation and results' },
      { name: 'Stats', description: 'Statistics and progress' },
    ],
  },
  apis: [
    './src/routes/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
