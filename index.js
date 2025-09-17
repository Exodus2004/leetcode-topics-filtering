const express = require('express');
const puppeteer = require('puppeteer');
const knownProblemTopics = require('./known-topics');
const { topicIndex, questionTopicsMap, getQuestionsWithExactTopics } = require('./topic-index');
const app = express();
const port = 3000;

app.use(express.json());

// Simple in-memory cache for problems
let problemsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Function to update our topic indexes with new problems
function updateTopicIndexes(newProblems) {
    // This would be implemented if we want to update our indexes with newly scraped data
    // For now, we're relying on the known topics mapping which is more reliable
    console.log('Topic indexes updated with new problems');
}

// Function to fetch problems with tags using Puppeteer
async function fetchProblemsWithTags() {
    // Check if cache is still valid
    if (problemsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        console.log('Returning cached problems');
        return problemsCache;
    }
    
    console.log('Fetching problems from LeetCode...');
    
    // Try to launch browser with different options for better compatibility
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
    } catch (launchError) {
        console.error('Failed to launch browser:', launchError.message);
        // Return cached data if available
        if (problemsCache) {
            console.log('Returning stale cached data due to browser launch failure');
            return problemsCache;
        }
        throw new Error('Failed to launch browser. Please check your Puppeteer installation.');
    }
    
    try {
        const page = await browser.newPage();
        // Set a longer timeout for all operations
        page.setDefaultTimeout(60000);
        
        // Set user agent to mimic a real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to LeetCode problems page
        console.log('Navigating to LeetCode problems page...');
        await page.goto('https://leetcode.com/problemset/all/', { 
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        
        // Wait for problems to load
        console.log('Waiting for problem list to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Extract problem data with improved error handling for new UI
        console.log('Extracting problem data...');
        const problems = await page.evaluate(() => {
            // New approach for modern LeetCode UI
            const problemElements = Array.from(document.querySelectorAll('a[href*="/problems/"]'));
            console.log(`Found ${problemElements.length} problem links`);
            
            return problemElements.slice(0, 15).map((element, index) => {
                try {
                    const href = element.href;
                    const fullText = element.textContent.trim();
                    
                    // Extract title by removing difficulty and acceptance rate
                    // Format is usually like: "3. Longest Substring Without Repeating Characters37.6%Med."
                    let title = fullText;
                    const difficultyRegex = /(\d+\.?\d*)%?(Easy|Medium|Hard|Med\.?)$/;
                    const match = fullText.match(difficultyRegex);
                    if (match) {
                        title = fullText.replace(match[0], '').trim();
                    }
                    
                    // Extract ID from href or generate one
                    let id = `prob-${index + 1}`;
                    const idMatch = href.match(/\/problems\/([^\/\?]+)/);
                    if (idMatch) {
                        id = idMatch[1];
                    }
                    
                    return { id, title, href, tags: [] };
                } catch (error) {
                    console.error(`Error processing problem ${index}:`, error.message);
                    return null;
                }
            }).filter(problem => problem !== null && problem.title && problem.href);
        });
        
        console.log(`Found ${problems.length} problems`);
        
        // Log the first few problems to verify extraction
        console.log('First 3 problems:');
        problems.slice(0, 3).forEach((problem, index) => {
            console.log(`${index + 1}. ${problem.title} (${problem.id})`);
        });
        
        // Get tags for each problem with better error handling for new UI
        for (let i = 0; i < problems.length; i++) {
            const problem = problems[i];
            try {
                console.log(`Fetching tags for problem ${i+1}/${problems.length}: ${problem.title} (${problem.id})`);
                
                await page.goto(problem.href, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                });
                
                // Wait for page to load
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // First, try to get tags from our known topics mapping
                const problemId = problem.id.toLowerCase().replace(/\s+/g, '-');
                console.log(`Checking known topics mapping for: ${problemId}`);
                if (knownProblemTopics[problemId]) {
                    problem.tags = knownProblemTopics[problemId];
                    console.log(`Found tags from known topics mapping:`, problem.tags);
                } else {
                    // Fallback to content-based detection
                    console.log('Using content-based tag detection');
                    problem.tags = await page.evaluate(() => {
                        // Get all text content from the page
                        const allText = document.body.textContent.toLowerCase();
                        
                        // Get problem description specifically
                        let description = '';
                        const descriptionElement = document.querySelector('[data-track-load="description_content"]');
                        if (descriptionElement) {
                            description = descriptionElement.textContent.toLowerCase();
                        } else {
                            // Fallback to question content
                            const questionElement = document.querySelector('.question-content');
                            if (questionElement) {
                                description = questionElement.textContent.toLowerCase();
                            } else {
                                // Last resort - use all text
                                description = allText;
                            }
                        }
                        
                        const commonTopics = [
                            'array', 'string', 'hash table', 'dynamic programming', 'math', 
                            'sorting', 'greedy', 'depth-first search', 'breadth-first search',
                            'binary search', 'tree', 'matrix', 'linked list', 'heap',
                            'graph', 'bit manipulation', 'sliding window', 'two pointers',
                            'stack', 'queue', 'backtracking', 'divide and conquer'
                        ];
                        
                        // Find all topics that are mentioned in the description
                        const foundTopics = commonTopics.filter(topic => {
                            // Special handling for sliding window
                            if (topic === 'sliding window') {
                                return description.includes('sliding window') || 
                                       (description.includes('sliding') && description.includes('window'));
                            }
                            // Special handling for hash table
                            if (topic === 'hash table') {
                                return description.includes('hash table') || 
                                       (description.includes('hash') && description.includes('table'));
                            }
                            return description.includes(topic);
                        });
                        
                        return foundTopics;
                    });
                    
                    console.log(`Content-based detection found ${problem.tags.length} tags:`, problem.tags);
                }
                
                // Add a small delay to avoid being rate-limited
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.error(`Error fetching tags for ${problem.title}:`, error.message);
                problem.tags = []; // Set empty tags array instead of failing
            }
        }
        
        await browser.close();
        
        // Update cache
        problemsCache = problems;
        cacheTimestamp = Date.now();
        
        console.log(`Successfully fetched ${problems.length} problems with tags`);
        return problems;
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        console.error('Error in fetchProblemsWithTags:', error.message);
        // Return cached data if available, even if stale
        if (problemsCache) {
            console.log('Returning stale cached data due to error');
            return problemsCache;
        }
        throw error;
    }
}

// Function to filter problems by exact topics
function filterProblemsByTopics(problems, topics) {
    // Convert topics to lowercase for case-insensitive comparison
    const normalizedTopics = topics.map(topic => topic.toLowerCase().trim());
    
    console.log('Filtering problems for topics:', normalizedTopics);
    
    // Filter problems that contain ALL specified topics
    const filteredProblems = problems.filter(problem => {
        // Convert problem tags to lowercase for comparison
        const problemTags = problem.tags.map(tag => tag.toLowerCase());
        
        console.log(`Checking problem: ${problem.title}`);
        console.log(`Problem tags:`, problemTags);
        
        // Check if all topics are present in the problem's tags
        const allTopicsFound = normalizedTopics.every(topic => 
            problemTags.some(problemTag => 
                problemTag.includes(topic) || 
                topic.includes(problemTag) ||
                // Handle cases where topics might be slightly different
                (problemTag.replace(/\s+/g, '') === topic.replace(/\s+/g, '')) ||
                (problemTag.replace(/-/g, ' ') === topic.replace(/-/g, ' ')) ||
                // Special handling for sliding window
                (topic === 'sliding window' && 
                 (problemTag.includes('sliding') && problemTag.includes('window')))
            )
        );
        
        console.log(`All topics found: ${allTopicsFound}`);
        return allTopicsFound;
    });
    
    console.log(`Filtered to ${filteredProblems.length} problems`);
    return filteredProblems;
}

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

// Serve the UI
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/ui.html');
});

// Serve static files (if needed)
app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`LeetCode Topic Filter server running at http://localhost:${port}`);
});