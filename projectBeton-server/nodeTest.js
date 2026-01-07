// const readline = require('readline');

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// const inputLines = [];

// rl.on('line', (line) => {
//     if (line.trim()) inputLines.push(line.trim());
// });

// rl.on('close', () => {
//     const data = inputLines.join(' ').split(/\s+/).map(Number);
//     firstVertexSearch(data);
// });

// function firstVertexSearch(data) {
//     let cursor = 0;
//     const n = data[cursor++];
//     const m = data[cursor++];

//     if (isNaN(n)) return;

//     const adjRev = Array.from({length: n + 1}, () => []);

//     for (let i = 0; i < m; i++) {
//         const u = data[cursor++];
//         const v = data[cursor++];
        
//         if (!isNaN(n) && !isNaN(m)) {
//             adjRev[v].push(u);
//         }
//     }

//     const visited = new Uint8Array(n + 1);
//     const reachable = [];

//     const stack = [1];

//     visited[1] = 1;

//     while (stack.length > 0) {
//         const v = stack.pop();
//         reachable.push(v);

//         const neighbors = adjRev[v];
//         for (let i = 0; i < neighbors.length; i++) {
//             const neighbor = neighbors[i];
//             if(!visited[neighbor]) {
//                 visited[neighbor] = 1;
//                 stack.push(neighbor);
//             }
//         }
//     }
//     reachable.sort((a, b) => a - b);
//     process.stdout.write(reachable.join(' ') + '\n')
// }