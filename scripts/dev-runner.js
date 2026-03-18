const { spawn } = require('child_process');

function run(name, command) {
  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (err) => {
    console.error(`[${name}] failed:`, err.message);
    process.exit(1);
  });

  return child;
}

const server = run('server', 'npm run server:plain');
const client = run('client', 'npm run client');

function shutdown() {
  for (const proc of [server, client]) {
    if (proc && !proc.killed) {
      proc.kill('SIGINT');
    }
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`[server] exited with code ${code}`);
  }
  shutdown();
});

client.on('exit', (code) => {
  if (code !== 0) {
    console.error(`[client] exited with code ${code}`);
  }
  shutdown();
});
