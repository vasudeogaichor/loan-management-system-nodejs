const { spawn } = require('child_process');

async function executeChildProcess(scriptPath, args = []) {
    console.log('scriptPath - ', scriptPath)
    console.log('args - ', args)
  return new Promise((resolve, reject) => {
    // Detach the child process from the main Node.js process
    const child = spawn('node', [scriptPath, ...args], {
      detached: true,
      stdio: 'ignore', // Ignore stdio streams to allow the parent to exit independently
    //   shell: true
    });

    // Unreference the child process to allow the parent to exit independently
    child.unref();

    // Don't attach event listeners for stdout and stderr, as stdio is ignored

    // Resolve immediately, as there won't be a close event
    resolve('Child process started successfully.');
  });
}

module.exports = { executeChildProcess };
