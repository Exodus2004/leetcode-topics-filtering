const { commands, window, env, Uri } = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess = null;

async function startServer() {
    // If server is already running, open browser
    if (serverProcess) {
        env.openExternal(Uri.parse('http://localhost:3000'));
        return;
    }
    
    // Start the server
    const serverPath = path.join(__dirname, 'index.js');
    serverProcess = spawn('node', [serverPath], {
        cwd: __dirname
    });
    
    serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        serverProcess = null;
    });
    
    // Wait a moment for server to start
    setTimeout(() => {
        env.openExternal(Uri.parse('http://localhost:3000'));
    }, 2000);
}

function activate(context) {
    console.log('LeetCode Topic Filter extension is now active');
    
    let disposable = commands.registerCommand('leetcodeTopicFilter.start', startServer);
    
    context.subscriptions.push(disposable);
}

function deactivate() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
}

module.exports = {
    activate,
    deactivate
};