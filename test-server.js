const app = require('./api/index.js');
const port = 3000;

app.listen(port, () => {
    console.log(`LeetCode Topic Filter server running at http://localhost:${port}`);
});