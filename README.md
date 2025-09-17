# LeetCode Topic Filter

A tool to filter LeetCode problems by exact topics, ensuring you get problems that match ALL specified topics rather than problems that match ANY of them.

## Advantages over LeetCode's filtering system

*   **Exact Topic Matching:** The main advantage is the ability to filter for problems that match *all* specified topics, whereas LeetCode's default filter shows problems that match *any* of the selected topics. This is especially useful when you want to practice problems with a specific combination of topics.
*   **Speed:** The pre-built index of known problems makes the filtering process very fast, as it avoids the need for slow web scraping on every request.
*   **Content-Based Tagging:** For problems where LeetCode doesn't provide explicit tags, this tool attempts to find relevant topics by searching the problem description. This can help you find problems that are not properly tagged on LeetCode.
*   **Simple UI:** The user interface is clean and straightforward, focusing on the core filtering functionality without the clutter of the LeetCode website.

## Features

- Filter LeetCode problems by exact topic matches
- Get problems that contain ALL specified topics (e.g., "array" AND "hash table")
- Clean, intuitive user interface with loading indicators
- **Ultra-fast results with efficient indexing (O(1) lookup)**
- Improved error handling and user feedback
- Reduced initial loading time (no need for scraping for known problems)
- Works with modern LeetCode UI
- Content-based topic detection when tags aren't available

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
