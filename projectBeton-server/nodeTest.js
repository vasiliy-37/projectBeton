const arr = [203, 204, 205, 206, 207, 208, 203, 204, 205, 206];
const brr = [203, 204, 204, 205, 206, 207, 205, 208, 203, 206, 205, 206, 204];

function missingNumbers(arr, brr) {
    const counts = {};
    const result = [];

    for (const num of arr) {
        counts[num] = (counts[num] || 0) + 1;
    }

    for (const num of brr) {
        if (counts[num] && counts[num] > 0) {
            counts[num]--;
        } else {
            result.push(num);
        }
    }

return result.sort((a, b) => a - b);
}

console.log(missingNumbers(arr, brr));
















// function linkedListConcatenation(arr) {
//   class ListNode {
//     constructor(val, next = null) {
//       this.val = val;
//       this.next = next;
//     }
//   }

//   let allNum = arr.flat();

//   allNum.sort((a, b) => a - b);

//   let dummy = ListNode(0);
//   let current = dummy;

//   for (let num of allNum) {
//     current.next = new ListNode(num);
//     current = current.next;
//   }
//   return dummy.next;
// }

// firstList = [[0,2],[5,10],[13,23],[24,25]];
// secondList = [[1,5],[8,12],[15,24],[25,26]];

// function intersections (firstList, secondList) {
//     let result = [];
//     let i = 0;
//     let j = 0;

//     while (i < firstList.length && j < secondList.length) {
//         let start = Math.max(firstList[i][0], secondList [j][0]);
//         let end = Math.min(firstList[i][1], secondList[j][1]);

//         if (start <= end) {
//             result.push([start, end]);
//         }

//         if (firstList[i] [1] < secondList[j][1]) {
//             i++;
//         } else {
//             j++;
//         }
//     }

//     return result;
// }

// console.log(...intersections(firstList, secondList));

// const nums = [2, 7, 11, 15];
// const target = 9;

// function search(arr, target) {
//   const numsMap = new Map();

//   for (let i = 0; i < arr.length; i++) {
//     let remainder = target - arr[i];

//     if (numsMap.has(remainder)) {
//       return [numsMap.get(remainder), i];
//     }
//     numsMap.set(arr[i], i);
//   }
// }

// console.log(search(nums, target));

// const { Readable } = require("stream");
// const readline = require("readline");

// const testData = `
// 4
// 4 1 3 2
// `;

// const rl = readline.createInterface({
//   input: Readable.from([testData]),
//   output: process.stdout,
//   terminal: false,
// });

// let n = -1;
// let wagons = [];

// rl.on("line", (input) => {
//   const row = input.trim();
//   if (!row) return;

//   if (n === -1) {
//     n = parseInt(row);
//   } else if (wagons.length < n) {
//     const numbers = row.split(/\s+/).map(Number);
//     wagons.push(...numbers);
//   }

//   if (wagons.length === n) {
//     let stack = [];
//     let nextWagon = 1;

//     for (let i = 0; i < n; i++) {
//       stack.push(wagons[i]);

//       while (stack.length > 0 && stack[stack.length - 1] === nextWagon) {
//         stack.pop();
//         nextWagon++;
//       }
//     }

//   if (nextWagon === n + 1) {
//     console.log("YES");
//   } else {
//     console.log("NO");
//   }
//   rl.close();
//   }
// });

// let N = -1;
// let M = -1;
// let points = [];
// let upPrefix = [];
// let downPrefix = [];

// rl.on('line', (input) => {
// const row = input.trim();
// if (!row) return;

// if (N === -1) {
//     N = parseInt(row);
// } else if (points.length < N) {
//     points.push(row.split(/\s+/).map(Number));

//     if (points.length === N) {
//         upPrefix = new Float64Array(N + 1).fill(0);
//         downPrefix = new Float64Array(N + 1).fill(0);

//         for (let i = 1; i < N; i++) {
//             const prewY = points[i - 1][1];
//             const currY = points[i][1];

//             const diffUp = currY - prewY;
//             upPrefix[i + 1] = upPrefix[i] + (diffUp > 0 ? diffUp : 0);

//             const diffDown = prewY - currY;
//             downPrefix[i + 1] = downPrefix[i] + (diffDown > 0 ? diffDown : 0);
//         }
//     }
// } else if (M === -1) {
//     M = parseInt(row);
// } else {
//     const [start, end] = row.split(/\s+/).map(Number);

//     if (start < end) {
//         console.log(upPrefix[end] - upPrefix[start]);
//     } else if (start > end) {
//         console.log(downPrefix[start] - downPrefix[end]);
//     } else {
//         console.log(0);
//     }
// }

//     // rl.close();
// });

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
