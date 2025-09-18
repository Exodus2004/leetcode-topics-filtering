const express = require('express');
const path = require('path');
const fs = require('fs');

// Import the topic index module
let topicModules;
try {
    topicModules = require('../topic-index');
} catch (error) {
    console.error('Error loading topic-index module:', error);
    // Provide fallback empty objects to prevent crashes
    topicModules = {
        topicIndex: {},
        questionTopicsMap: {},
        getQuestionsWithExactTopics: () => []
    };
}

const { topicIndex, questionTopicsMap, getQuestionsWithExactTopics } = topicModules;

// Create an Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Serve the UI for the root route
app.get('/', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../ui.html');
        const data = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    } catch (err) {
        console.error('Error reading UI file:', err);
        res.status(500).send('Error loading UI');
    }
});

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

// For any other route, serve the UI HTML file (client-side routing)
app.use((req, res) => {
    try {
        const filePath = path.join(__dirname, '../ui.html');
        const data = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    } catch (err) {
        console.error('Error reading UI file:', err);
        res.status(500).send('Error loading UI');
    }
});

// Export the app for Vercel
module.exports = app;