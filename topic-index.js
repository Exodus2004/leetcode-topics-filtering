// Create an inverted index for efficient topic-based filtering
const knownProblemTopics = require('./known-topics');

// Build topic to questions mapping
function buildTopicIndex() {
    const topicIndex = {};
    
    // Iterate through all problems and build the index
    for (const [problemId, topics] of Object.entries(knownProblemTopics)) {
        // Add each topic to the index
        for (const topic of topics) {
            const normalizedTopic = topic.toLowerCase().trim();
            
            // Initialize array if topic doesn't exist
            if (!topicIndex[normalizedTopic]) {
                topicIndex[normalizedTopic] = [];
            }
            
            // Add problem ID to this topic's list
            topicIndex[normalizedTopic].push(problemId);
        }
    }
    
    return topicIndex;
}

// Build question to topics mapping (reverse of knownProblemTopics)
function buildQuestionTopicsMap() {
    const questionTopicsMap = {};
    
    for (const [problemId, topics] of Object.entries(knownProblemTopics)) {
        questionTopicsMap[problemId] = topics.map(topic => topic.toLowerCase().trim());
    }
    
    return questionTopicsMap;
}

// Get questions that have EXACTLY the same topics as specified (no more, no less)
function getQuestionsWithExactTopics(inputTopics, topicIndex, questionTopicsMap) {
    if (!inputTopics || inputTopics.length === 0) {
        return [];
    }
    
    // Normalize input topics and sort them for comparison
    const normalizedInputTopics = inputTopics.map(topic => topic.toLowerCase().trim()).sort();
    
    // Get all questions that contain ALL of the specified topics
    const questionSets = normalizedInputTopics.map(topic => {
        return topicIndex[topic] || [];
    });
    
    // Find intersection of all question sets (questions that have ALL topics)
    if (questionSets.length === 0) {
        return [];
    }
    
    // Start with the first set
    let questionsWithAllTopics = [...questionSets[0]];
    
    // Intersect with each subsequent set
    for (let i = 1; i < questionSets.length; i++) {
        questionsWithAllTopics = questionsWithAllTopics.filter(questionId => questionSets[i].includes(questionId));
    }
    
    // Now filter to only include questions that have EXACTLY these topics (no more, no less)
    const exactMatchQuestions = questionsWithAllTopics.filter(questionId => {
        const questionTopics = questionTopicsMap[questionId] || [];
        const sortedQuestionTopics = [...questionTopics].sort();
        
        // Check if the topics arrays are exactly the same
        if (sortedQuestionTopics.length !== normalizedInputTopics.length) {
            return false;
        }
        
        // Compare each topic
        for (let i = 0; i < sortedQuestionTopics.length; i++) {
            if (sortedQuestionTopics[i] !== normalizedInputTopics[i]) {
                return false;
            }
        }
        
        return true;
    });
    
    // Add topic information to each question
    return exactMatchQuestions.map(questionId => ({
        id: questionId,
        topics: questionTopicsMap[questionId] || []
    }));
}

// Build the indexes when module is loaded
const topicIndex = buildTopicIndex();
const questionTopicsMap = buildQuestionTopicsMap();

console.log('Topic indexes rebuilt. Sample data:');
console.log('first-missing-positive topics:', questionTopicsMap['first-missing-positive']);

module.exports = {
    topicIndex,
    questionTopicsMap,
    getQuestionsWithExactTopics
};