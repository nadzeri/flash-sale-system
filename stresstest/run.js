const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const [key, val] = argv[i].split('=');
    if (key.startsWith('--')) {
      const k = key.slice(2);
      if (typeof val === 'undefined') {
        args[k] = true;
      } else {
        args[k] = val;
      }
    }
  }
  return args;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', shell: false, ...options });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

(async () => {
  const cwd = process.cwd();
  const args = parseArgs(process.argv);
  const userCount = parseInt(args.count || args.users || '1', 10);
  const name = String(args.name || `run-${Date.now()}`);

  const resultDir = path.join(cwd, 'stresstest', 'results');
  await fs.promises.mkdir(resultDir, { recursive: true });

  const nodeBin = process.execPath;
  const artilleryBin = path.join(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'artillery.cmd' : 'artillery');

  // Generate users and flash-sale data
  await run(nodeBin, [path.join(cwd, 'stresstest', 'artillery', 'scripts', 'generate-users.js'), `--count=${userCount}`]);
  await run(nodeBin, [path.join(cwd, 'stresstest', 'artillery', 'scripts', 'generate-flash-sale.js')]);

  const purchaseYml = path.join(cwd, 'stresstest', 'artillery', 'purchase.yml');
  const jsonOut = path.join(resultDir, `${name}.json`);
  const htmlOut = path.join(resultDir, `${name}.html`);

  // Run artillery and produce report
  await run(artilleryBin, ['run', purchaseYml, '--output', jsonOut]);
  await run(artilleryBin, ['report', jsonOut, '-o', htmlOut]);

  console.log(`\nDone. Reports saved to:\n- ${jsonOut}\n- ${htmlOut}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});


