# LeetCode Topic Filter

A tool to filter LeetCode problems by exact topics, ensuring you get problems that match ALL specified topics rather than problems that match ANY of them.

**Live Demo**: [https://leetcode-topics-filtering.vercel.app/](https://leetcode-topics-filtering.vercel.app/)

## Advantages over LeetCode's filtering system

*   **Exact Topic Matching:** The main advantage is the ability to filter for problems that match *all* specified topics, whereas LeetCode's default filter shows problems that match *any* of the selected topics. This is especially useful when you want to practice problems with a specific combination of topics.
*   **Speed:** The pre-built index of known problems makes the filtering process very fast, as it avoids the need for slow web scraping on every request.
*   **Comprehensive Topic Database:** Uses a large database of over 3,500 LeetCode problems with their associated topics, eliminating the need for real-time scraping for known problems.
*   **Simple UI:** The user interface is clean and straightforward, focusing on the core filtering functionality without the clutter of the LeetCode website.

## Features

- Filter LeetCode problems by exact topic matches
- Get problems that contain ALL specified topics (e.g., "array" AND "hash table")
- Clean, intuitive user interface with loading indicators
- **Ultra-fast results with efficient indexing (O(1) lookup)**
- VS Code extension integration
- Pre-built database of problem topics (no scraping needed for known problems)
- Modern, responsive design with glassmorphism effects and animations

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/leetcode-topic-filter.git
   ```

2. Navigate to the project directory:
   ```
   cd leetcode-topic-filter
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. Open your browser and go to `http://localhost:3000`

3. Enter topics separated by commas (e.g., "array, hash table")

4. Click "Filter Problems" to see results

## How It Works

1. The tool uses Puppeteer to scrape LeetCode's problem pages
2. It fetches problems and their associated tags
3. It filters problems to show only those that match ALL specified topics
4. Results are cached for 30 minutes to improve performance
5. Improved error handling for network issues and page structure changes
6. Content-based topic detection for problems without explicit tags

## Development

To run in development mode:
```
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
