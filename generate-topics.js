// Generate a JavaScript file with all available topics
const { topicIndex } = require('./topic-index');

// Get all unique topics and sort them alphabetically
const allTopics = Object.keys(topicIndex).sort();

// Write to a file that can be used in the UI
console.log('// All available topics for the LeetCode Topic Filter');
console.log('const ALL_TOPICS = [');
allTopics.forEach(topic => {
    console.log(`  "${topic}",`);
});
console.log('];');
console.log('');
console.log('module.exports = { ALL_TOPICS };');