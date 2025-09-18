const { topicIndex, questionTopicsMap, getQuestionsWithExactTopics } = require('./topic-index');

// Test the filtering function
const testTopics = ['array', 'hash table'];
const matchedQuestions = getQuestionsWithExactTopics(testTopics, topicIndex, questionTopicsMap);

console.log(`Found ${matchedQuestions.length} problems matching topics: ${testTopics.join(', ')}`);

// Show first 5 results
matchedQuestions.slice(0, 5).forEach((question, index) => {
    console.log(`${index + 1}. ${question.id} - Topics: ${question.topics.join(', ')}`);
});