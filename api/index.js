const express = require('express');
const path = require('path');
const knownProblemTopics = require('../known-topics');
const { topicIndex, questionTopicsMap, getQuestionsWithExactTopics } = require('../topic-index');

// Create an Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Serve the UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../ui.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// POST endpoint to filter problems
app.post('/filter', async (req, res) => {
    try {
        const { topics } = req.body;
        
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({ error: 'Please provide at least one topic' });
        }
        
        console.log(`Filtering problems for topics: ${topics.join(', ')}`);
        
        // Use our efficient topic index for exact matching
        const matchedQuestions = getQuestionsWithExactTopics(topics, topicIndex, questionTopicsMap);
        
        // Convert to the format expected by the frontend
        const filteredProblems = matchedQuestions.map(question => ({
            id: question.id,
            title: question.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            href: `https://leetcode.com/problems/${question.id}/`,
            tags: question.topics
        }));
        
        console.log(`Found ${filteredProblems.length} problems matching exactly these topics`);
        
        res.json({ problems: filteredProblems });
    } catch (error) {
        console.error('Error filtering problems:', error);
        res.status(500).json({ 
            error: 'Failed to filter problems. Please try again later.',
            problems: []
        });
    }
});

// Export the app for Vercel
module.exports = app;