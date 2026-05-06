import type { Language } from './types.ts'

export const javascript: Language = {
  id: 'javascript',
  name: 'JavaScript',
  icon: '⚡',
  color: 'bg-yellow-300',
  textColor: 'text-yellow-900',
  runtime: 'javascript',
  description: 'The language of the web. JavaScript adds interactivity to pages and powers Node.js on the server.',
  lessons: [
    {
      id: 'intro',
      title: '1. Introduction & console.log',
      content: `
<h2>What is JavaScript?</h2>
<p>JavaScript (JS) is the programming language of the web. While HTML provides structure and CSS provides style, JavaScript makes pages <strong>interactive</strong>. It runs in every web browser and also on servers via Node.js.</p>
<h2>console.log()</h2>
<p>The <code>console.log()</code> function prints output to the developer console. It's the primary tool for debugging and seeing what your code is doing:</p>
<pre><code>console.log("Hello, World!");
console.log(42);
console.log(true);
console.log([1, 2, 3]);
console.log({ name: "Alice" });</code></pre>
<h2>Comments</h2>
<pre><code>// Single-line comment

/* Multi-line
   comment */</code></pre>
<h2>Semicolons</h2>
<p>JavaScript has Automatic Semicolon Insertion (ASI) — semicolons are optional in most cases. However, most style guides recommend including them for clarity.</p>
<div class="tip">💡 Open your browser's DevTools (F12 or Cmd+Option+J) to see the Console. This is where <code>console.log()</code> output appears when running JavaScript in a real webpage.</div>
`,
      starterCode: `// JavaScript Introduction
console.log("Hello, World!");
console.log("Welcome to JavaScript!");

// Different data types
console.log(42);
console.log(3.14);
console.log(true);
console.log(null);
console.log(undefined);

// Expressions are evaluated
console.log(10 + 5);
console.log("Hello" + " " + "World");
console.log(2 ** 10);  // 2 to the power of 10

// Multiple values
console.log("Name:", "Alice", "Age:", 25);
`,
      expectedOutput: 'Hello, World!\nWelcome to JavaScript!\n42\n3.14\ntrue\nnull\nundefined\n15\nHello World\n1024\nName: Alice Age: 25',
    },
    {
      id: 'variables',
      title: '2. Variables & Data Types',
      content: `
<h2>Variable Declarations</h2>
<p>JavaScript has three ways to declare variables:</p>
<table>
  <tr><th>Keyword</th><th>Scope</th><th>Reassignable</th><th>Use When</th></tr>
  <tr><td><code>const</code></td><td>Block</td><td>No</td><td>Value won't change (default choice)</td></tr>
  <tr><td><code>let</code></td><td>Block</td><td>Yes</td><td>Value will be reassigned</td></tr>
  <tr><td><code>var</code></td><td>Function</td><td>Yes</td><td>Avoid — legacy, use let/const</td></tr>
</table>
<h2>Data Types</h2>
<p>JavaScript has 7 primitive types:</p>
<ul>
  <li><code>number</code> — integers and floats: <code>42</code>, <code>3.14</code></li>
  <li><code>string</code> — text: <code>"hello"</code>, <code>'world'</code></li>
  <li><code>boolean</code> — <code>true</code> or <code>false</code></li>
  <li><code>null</code> — intentional absence of value</li>
  <li><code>undefined</code> — variable declared but not assigned</li>
  <li><code>bigint</code> — very large integers: <code>9007199254740991n</code></li>
  <li><code>symbol</code> — unique identifiers (advanced)</li>
</ul>
<h2>typeof Operator</h2>
<pre><code>typeof 42          // "number"
typeof "hello"     // "string"
typeof true        // "boolean"
typeof null        // "object" (legacy bug in JS!)
typeof undefined   // "undefined"
typeof []          // "object"
typeof {}          // "object"</code></pre>
<div class="tip">💡 Default to <code>const</code>. Only use <code>let</code> when you know you'll reassign. Avoid <code>var</code> entirely in modern JavaScript.</div>
`,
      starterCode: `// Variables & Data Types
const name = "Alice";
let age = 25;
const pi = 3.14159;
let isStudent = true;

console.log("Name:", name);
console.log("Age:", age);
console.log("Pi:", pi);
console.log("Is student:", isStudent);

// typeof
console.log(typeof name);
console.log(typeof age);
console.log(typeof isStudent);
console.log(typeof null);       // "object" — famous JS quirk!
console.log(typeof undefined);

// Reassignment
age = 26;
console.log("Next year:", age);

// Const prevents reassignment
const MAX = 100;
console.log("Max value:", MAX);
// MAX = 200;  // would throw TypeError!
`,
    },
    {
      id: 'operators',
      title: '3. Operators & Type Coercion',
      content: `
<h2>Arithmetic Operators</h2>
<pre><code>5 + 3   // 8
5 - 3   // 2
5 * 3   // 15
5 / 2   // 2.5
5 % 2   // 1  (remainder)
2 ** 8  // 256 (exponentiation)
</code></pre>
<h2>Comparison Operators</h2>
<pre><code>==   // equal (loose — coerces type)
===  // strictly equal (no coercion — always prefer!)
!=   // not equal (loose)
!==  // strictly not equal (prefer!)
>  <  >= <=</code></pre>
<h2>Type Coercion — JavaScript's Quirks</h2>
<p>JavaScript is weakly typed — it automatically converts types in certain operations:</p>
<pre><code>"5" + 3     // "53"  (number converted to string)
"5" - 3     // 2     (string converted to number)
"5" * "2"   // 10    (both converted to numbers)
true + 1    // 2     (true = 1)
false + 1   // 1     (false = 0)
null + 1    // 1     (null = 0)

// Always use === to avoid coercion surprises:
5 == "5"    // true  (loose — surprise!)
5 === "5"   // false (strict — expected)</code></pre>
<h2>Logical Operators</h2>
<pre><code>&&   // AND
||   // OR
!    // NOT
??   // Nullish coalescing (null/undefined fallback)</code></pre>
<div class="tip">💡 Always use <code>===</code> instead of <code>==</code>. Type coercion with <code>==</code> produces notoriously confusing results that are a common source of bugs.</div>
`,
      starterCode: `// Operators & Type Coercion
console.log("=== Arithmetic ===");
console.log(10 + 3);
console.log(10 - 3);
console.log(10 * 3);
console.log(10 / 3);
console.log(10 % 3);  // remainder
console.log(2 ** 8);  // 256

console.log("\\n=== Type Coercion Surprises ===");
console.log("5" + 3);    // "53" (string concat!)
console.log("5" - 3);    // 2    (numeric!)
console.log(true + 1);   // 2
console.log(false + 1);  // 1
console.log(null + 1);   // 1

console.log("\\n=== Strict vs Loose Equality ===");
console.log(5 == "5");    // true  (loose)
console.log(5 === "5");   // false (strict)
console.log(0 == false);  // true  (loose)
console.log(0 === false); // false (strict)

console.log("\\n=== Logical & Nullish ===");
const username = null;
console.log(username ?? "Guest");  // "Guest" (nullish fallback)
console.log(0 || "default");       // "default" (OR fallback)
console.log(0 ?? "default");       // 0 (only null/undefined triggers ??)
`,
    },
    {
      id: 'strings',
      title: '4. Strings & Template Literals',
      content: `
<h2>String Creation</h2>
<pre><code>const single = 'Hello';
const double = "World";
const backtick = \`Template literal\`;</code></pre>
<h2>Template Literals (ES6+)</h2>
<p>Use backticks for string interpolation and multi-line strings:</p>
<pre><code>const name = "Alice";
const age = 25;
const greeting = \`Hello, \${name}! You are \${age} years old.\`;
console.log(\`2 + 2 = \${2 + 2}\`);  // 2 + 2 = 4

const multiLine = \`Line 1
Line 2
Line 3\`;</code></pre>
<h2>Common String Methods</h2>
<pre><code>const str = "  Hello, JavaScript!  ";
str.trim()                     // "Hello, JavaScript!"
str.toUpperCase()              // "  HELLO, JAVASCRIPT!  "
str.includes("Java")           // true
str.startsWith("  Hello")      // true
str.replace("JavaScript", "JS") // "  Hello, JS!  "
str.split(", ")                 // ["  Hello", "JavaScript!  "]
"abc".repeat(3)                // "abcabcabc"
"abc"[0]                       // "a" (indexing)</code></pre>
<h2>String Immutability</h2>
<p>Like Python, JS strings are immutable. Methods return new strings — they don't modify the original.</p>
<div class="tip">💡 Always use template literals over string concatenation. They're more readable, support multi-line, and allow any JavaScript expression inside <code>\${...}</code>.</div>
`,
      starterCode: `// Strings & Template Literals
const firstName = "Brooklyn";
const lastName = "Prep";
const year = 2025;

// Template literals
console.log(\`Welcome to \${firstName} \${lastName}!\`);
console.log(\`The year is \${year}. Next year: \${year + 1}.\`);

// String methods
const sentence = "  JavaScript is awesome!  ";
console.log(sentence.trim());
console.log(sentence.trim().toUpperCase());
console.log(sentence.trim().toLowerCase());
console.log(sentence.trim().split(" "));

// Useful checks
const email = "user@example.com";
console.log(email.includes("@"));
console.log(email.endsWith(".com"));
console.log(email.indexOf("@"));

// Multi-line template literal
const poem = \`
  Roses are red,
  JavaScript is great,
  \${firstName} Prep students
  Can't wait to graduate!
\`;
console.log(poem);

// Padding and repetition
console.log("5".padStart(3, "0"));   // "005"
console.log("ab".repeat(4));          // "abababab"
`,
    },
    {
      id: 'arrays',
      title: '5. Arrays & Array Methods',
      content: `
<h2>Arrays</h2>
<p>Arrays are ordered, mutable lists that can hold any type:</p>
<pre><code>const fruits = ["apple", "banana", "cherry"];
const mixed = [1, "two", true, null, { x: 5 }];
fruits[0]           // "apple"
fruits[fruits.length - 1]  // "cherry" (last item)</code></pre>
<h2>Mutating Methods</h2>
<ul>
  <li><code>.push(item)</code> — add to end</li>
  <li><code>.pop()</code> — remove from end</li>
  <li><code>.unshift(item)</code> — add to front</li>
  <li><code>.shift()</code> — remove from front</li>
  <li><code>.splice(start, deleteCount, ...items)</code> — insert/remove at position</li>
  <li><code>.sort()</code> / <code>.reverse()</code> — sort/reverse in place</li>
</ul>
<h2>Non-Mutating (Functional) Methods</h2>
<pre><code>const nums = [1, 2, 3, 4, 5];

nums.map(x => x * 2)          // [2, 4, 6, 8, 10]
nums.filter(x => x % 2 === 0) // [2, 4]
nums.reduce((acc, x) => acc + x, 0) // 15
nums.find(x => x > 3)         // 4
nums.findIndex(x => x > 3)    // 3
nums.includes(3)               // true
nums.every(x => x > 0)        // true
nums.some(x => x > 4)         // true
nums.slice(1, 3)               // [2, 3]
[...nums, 6, 7]                // [1, 2, 3, 4, 5, 6, 7] (spread)</code></pre>
<div class="tip">💡 Prefer non-mutating methods (map, filter, reduce) for functional-style code. They don't change the original array and return a new one, making code easier to reason about.</div>
`,
      starterCode: `// Arrays & Array Methods
const scores = [85, 92, 78, 95, 88, 71, 90];

console.log("Scores:", scores);
console.log("Length:", scores.length);
console.log("First:", scores[0]);
console.log("Last:", scores[scores.length - 1]);

// map, filter, reduce
const doubled = scores.map(s => s * 2);
console.log("Doubled:", doubled);

const passing = scores.filter(s => s >= 80);
console.log("Passing (≥80):", passing);

const total = scores.reduce((sum, s) => sum + s, 0);
console.log("Total:", total);
console.log("Average:", (total / scores.length).toFixed(1));

// find & findIndex
const firstHigh = scores.find(s => s >= 90);
console.log("First 90+:", firstHigh);

// Spread, concat
const moreScores = [...scores, 83, 97];
console.log("Extended:", moreScores);

// Sort (note: default sort is lexicographic!)
const sorted = [...scores].sort((a, b) => a - b);
console.log("Sorted:", sorted);
`,
    },
    {
      id: 'objects',
      title: '6. Objects & Destructuring',
      content: `
<h2>Objects</h2>
<p>Objects store key-value pairs. Keys are strings (or Symbols). Values can be anything including functions:</p>
<pre><code>const person = {
  name: "Alice",
  age: 25,
  address: { city: "Brooklyn" },  // nested object
  greet() {                        // method
    return \`Hi, I'm \${this.name}\`;
  }
};
person.name          // "Alice" (dot notation)
person["age"]        // 25 (bracket notation)
person.greet()       // "Hi, I'm Alice"</code></pre>
<h2>Destructuring</h2>
<pre><code>// Object destructuring
const { name, age } = person;
const { address: { city } } = person;  // nested
const { name: firstName } = person;     // rename

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first=1, second=2, rest=[3,4,5]</code></pre>
<h2>Spread & Rest</h2>
<pre><code>// Spread to copy/merge
const updated = { ...person, age: 26 };
const merged = { ...obj1, ...obj2 };

// Object.keys(), values(), entries()
Object.keys(person)     // ["name", "age", ...]
Object.values(person)   // ["Alice", 25, ...]
Object.entries(person)  // [["name","Alice"], ...]</code></pre>
<div class="tip">💡 Destructuring is extremely common in modern JavaScript. You'll see it heavily in React (destructuring props) and when working with API responses. Master it early!</div>
`,
      starterCode: `// Objects & Destructuring
const student = {
  name: "Jordan",
  age: 17,
  grades: { math: 92, english: 88, science: 95 },
  hobbies: ["coding", "chess"],
  introduce() {
    return \`Hi! I'm \${this.name}, age \${this.age}.\`;
  }
};

console.log(student.name);
console.log(student["age"]);
console.log(student.grades.math);
console.log(student.introduce());

// Destructuring
const { name, age, grades } = student;
console.log(\`\${name} is \${age} years old\`);

const { math, english, science } = grades;
console.log(\`Math: \${math}, English: \${english}, Science: \${science}\`);
const avg = (math + english + science) / 3;
console.log("Average:", avg.toFixed(1));

// Array destructuring
const [first, second] = student.hobbies;
console.log(\`Hobbies: \${first}, \${second}\`);

// Spread to update
const updated = { ...student, age: 18, grade: "12th" };
console.log("Updated age:", updated.age);
console.log("Grade:", updated.grade);

// Object.entries
console.log("Grades breakdown:");
Object.entries(grades).forEach(([subject, score]) => {
  console.log(\`  \${subject}: \${score}\`);
});
`,
    },
    {
      id: 'functions',
      title: '7. Functions & Arrow Functions',
      content: `
<h2>Function Declarations</h2>
<pre><code>function add(a, b) {
  return a + b;
}
add(3, 4);  // 7</code></pre>
<h2>Function Expressions</h2>
<pre><code>const multiply = function(a, b) {
  return a * b;
};</code></pre>
<h2>Arrow Functions (ES6+)</h2>
<p>Arrow functions are a shorter syntax and don't have their own <code>this</code>:</p>
<pre><code>// Regular
const square = (x) => { return x * x; };

// Implicit return (single expression)
const square = x => x * x;

// Multiple params
const add = (a, b) => a + b;

// No params
const greet = () => "Hello!";</code></pre>
<h2>Default Parameters</h2>
<pre><code>const greet = (name = "World") => \`Hello, \${name}!\`;
greet()         // "Hello, World!"
greet("Alice")  // "Hello, Alice!"</code></pre>
<h2>Higher-Order Functions</h2>
<p>Functions can take other functions as arguments or return them:</p>
<pre><code>const double = x => x * 2;
[1, 2, 3].map(double);  // [2, 4, 6]

function makeAdder(x) {
  return y => x + y;
}
const add5 = makeAdder(5);
add5(3);  // 8</code></pre>
<div class="tip">💡 Use arrow functions for callbacks and when you don't need <code>this</code>. Use regular function declarations for top-level functions that need to be hoisted or use <code>this</code>.</div>
`,
      starterCode: `// Functions & Arrow Functions

// Regular function
function greet(name, greeting = "Hello") {
  return \`\${greeting}, \${name}!\`;
}
console.log(greet("Alice"));
console.log(greet("Bob", "Good morning"));

// Arrow function variations
const square = x => x * x;
const add = (a, b) => a + b;
const isEven = n => n % 2 === 0;

console.log("Square of 7:", square(7));
console.log("3 + 4:", add(3, 4));
console.log("[1,2,3,4,5].filter(isEven):", [1,2,3,4,5].filter(isEven));

// Higher-order functions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2);
const evens = numbers.filter(x => x % 2 === 0);
const sum = numbers.reduce((acc, x) => acc + x, 0);

console.log("Doubled:", doubled);
console.log("Evens:", evens);
console.log("Sum:", sum);

// Closures
function makeCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count
  };
}
const counter = makeCounter(10);
counter.increment();
counter.increment();
counter.decrement();
console.log("Counter:", counter.value()); // 11
`,
    },
    {
      id: 'control-flow',
      title: '8. Control Flow',
      content: `
<h2>if / else if / else</h2>
<pre><code>const score = 85;
if (score >= 90) {
  grade = "A";
} else if (score >= 80) {
  grade = "B";
} else {
  grade = "C or below";
}</code></pre>
<h2>Ternary Operator</h2>
<pre><code>const status = age >= 18 ? "adult" : "minor";</code></pre>
<h2>switch Statement</h2>
<pre><code>switch (day) {
  case "Monday":
  case "Tuesday":
    console.log("Early week");
    break;
  case "Friday":
    console.log("Almost weekend!");
    break;
  default:
    console.log("Midweek");
}</code></pre>
<h2>Truthy & Falsy</h2>
<p>In JavaScript, these values are <strong>falsy</strong>: <code>false</code>, <code>0</code>, <code>""</code>, <code>null</code>, <code>undefined</code>, <code>NaN</code>. Everything else is truthy.</p>
<h2>Short-Circuit Evaluation</h2>
<pre><code>// || returns first truthy value
const name = userInput || "Guest";

// && returns first falsy or last value
user && user.email && sendEmail(user.email);

// ?? returns right side only for null/undefined
const count = data.count ?? 0;</code></pre>
<div class="tip">💡 The ternary operator is great for simple one-liners, but don't nest them — deeply nested ternaries are hard to read. Use if/else for complex branching.</div>
`,
      starterCode: `// Control Flow

// Grade calculator with if/else if
function getGrade(score) {
  if (score >= 90) return "A";
  else if (score >= 80) return "B";
  else if (score >= 70) return "C";
  else if (score >= 60) return "D";
  else return "F";
}

const scores = [95, 82, 71, 59, 88];
scores.forEach(score => {
  console.log(\`Score: \${score} → Grade: \${getGrade(score)}\`);
});

// Ternary
const age = 17;
const status = age >= 18 ? "can vote" : "cannot vote yet";
console.log(\`Age \${age}: \${status}\`);

// switch
function getDayType(day) {
  switch (day) {
    case "Saturday":
    case "Sunday":
      return "Weekend";
    case "Monday":
    case "Friday":
      return "Monday/Friday";
    default:
      return "Midweek";
  }
}

["Monday", "Wednesday", "Friday", "Saturday"].forEach(d => {
  console.log(\`\${d}: \${getDayType(d)}\`);
});

// Short-circuit
const user = { name: "Alice", email: "alice@test.com" };
const displayName = user?.name ?? "Anonymous";
console.log("Display name:", displayName);
`,
    },
    {
      id: 'loops',
      title: '9. Loops',
      content: `
<h2>for Loop</h2>
<pre><code>for (let i = 0; i < 5; i++) {
  console.log(i);
}</code></pre>
<h2>while / do...while</h2>
<pre><code>let i = 0;
while (i < 5) {
  console.log(i++);
}

// do...while runs at least once
do {
  console.log("runs once even if false");
} while (false);</code></pre>
<h2>for...of (iterables)</h2>
<pre><code>const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
  console.log(fruit);
}

for (const char of "hello") {
  console.log(char);
}</code></pre>
<h2>for...in (object keys)</h2>
<pre><code>const obj = { a: 1, b: 2, c: 3 };
for (const key in obj) {
  console.log(key, obj[key]);
}</code></pre>
<h2>Array Iteration Methods</h2>
<pre><code>fruits.forEach((fruit, index) => {
  console.log(\`\${index}: \${fruit}\`);
});</code></pre>
<h2>Loop Control</h2>
<pre><code>for (let i = 0; i < 10; i++) {
  if (i === 3) continue;  // skip 3
  if (i === 7) break;     // stop at 7
  console.log(i);
}</code></pre>
<div class="tip">💡 Use <code>for...of</code> when you need the values from an array. Use <code>.forEach()</code> when you also need the index. Use <code>for...in</code> only for objects (never for arrays — it can include prototype keys).</div>
`,
      starterCode: `// Loops

// Classic for loop
console.log("for loop:");
for (let i = 1; i <= 5; i++) {
  console.log(\`  \${i} squared = \${i * i}\`);
}

// for...of (arrays)
const languages = ["Python", "JavaScript", "HTML", "CSS"];
console.log("\\nfor...of:");
for (const lang of languages) {
  console.log(\`  - \${lang}\`);
}

// forEach with index
console.log("\\nforEach with index:");
languages.forEach((lang, i) => {
  console.log(\`  \${i + 1}. \${lang}\`);
});

// while loop
console.log("\\nwhile (Fibonacci):");
let a = 0, b = 1;
while (a < 100) {
  console.log(\`  \${a}\`);
  [a, b] = [b, a + b];
}

// for...in (objects)
const scores = { math: 92, english: 88, science: 95 };
console.log("\\nfor...in:");
for (const subject in scores) {
  console.log(\`  \${subject}: \${scores[subject]}\`);
}

// break & continue
console.log("\\nskip 3, stop at 7:");
for (let i = 0; i <= 9; i++) {
  if (i === 3) continue;
  if (i === 7) break;
  process?.stdout?.write(i + " ");
  console.log(i);
}
`,
    },
    {
      id: 'dom',
      title: '10. DOM Manipulation',
      content: `
<h2>What is the DOM?</h2>
<p>The DOM (Document Object Model) is a tree of objects representing the HTML page. JavaScript can read and modify it to make pages dynamic.</p>
<h2>Selecting Elements</h2>
<pre><code>document.getElementById("myId")
document.querySelector(".my-class")      // first match
document.querySelectorAll("p")           // all matches (NodeList)
document.querySelector("h1, h2")        // any h1 or h2</code></pre>
<h2>Modifying Elements</h2>
<pre><code>const el = document.querySelector("h1");
el.textContent = "New Title";           // set text
el.innerHTML = "&lt;em&gt;Rich HTML&lt;/em&gt;";  // set HTML
el.style.color = "red";                 // inline style
el.classList.add("active");             // add class
el.classList.remove("hidden");          // remove class
el.classList.toggle("dark");            // toggle class
el.setAttribute("data-id", "42");      // set attribute</code></pre>
<h2>Creating & Inserting Elements</h2>
<pre><code>const p = document.createElement("p");
p.textContent = "New paragraph";
document.body.appendChild(p);

// Modern: insertAdjacentHTML
el.insertAdjacentHTML("afterend", "&lt;p&gt;After me&lt;/p&gt;");</code></pre>
<h2>Removing Elements</h2>
<pre><code>el.remove();   // remove from DOM</code></pre>
<div class="tip">💡 In this lesson's runner, code runs in an iframe without a real DOM. For DOM practice, open your browser's DevTools console on any webpage and experiment there, or build a full HTML+JS file.</div>
`,
      starterCode: `// DOM Manipulation
// Note: This runs in a sandboxed iframe with a minimal DOM.
// For real DOM work, use a full HTML file in your browser.

// Simulate DOM operations with plain objects (for demo)
const elements = {
  title: { textContent: "Hello World", className: "" },
  para: { textContent: "Initial text", style: {} }
};

// Reading
console.log("Title:", elements.title.textContent);
console.log("Paragraph:", elements.para.textContent);

// Modifying
elements.title.textContent = "Updated Title!";
elements.para.textContent = "Text was changed via JavaScript.";
elements.para.style.color = "blue";

console.log("After changes:");
console.log("Title:", elements.title.textContent);
console.log("Para:", elements.para.textContent);

// Class manipulation simulation
const classList = new Set();
classList.add("active");
classList.add("highlighted");
console.log("Classes:", [...classList]);
classList.toggle("active");
console.log("After toggle:", [...classList]);

// Array of created elements
const items = ["Apple", "Banana", "Cherry"];
const listItems = items.map((item, i) => ({
  id: i + 1,
  textContent: item,
  tagName: "li"
}));
console.log("Created elements:", listItems);
`,
    },
    {
      id: 'events',
      title: '11. Events',
      content: `
<h2>Event Listeners</h2>
<p>Events are things that happen in the browser — clicks, keyboard presses, form submissions. Use <code>addEventListener</code> to respond to them:</p>
<pre><code>const btn = document.querySelector("button");
btn.addEventListener("click", function(event) {
  console.log("Button clicked!", event);
});

// Arrow function shorthand
btn.addEventListener("click", e => {
  e.preventDefault();  // stop default behavior
  console.log("Clicked at:", e.clientX, e.clientY);
});</code></pre>
<h2>Common Events</h2>
<table>
  <tr><th>Event</th><th>Fires When...</th></tr>
  <tr><td><code>click</code></td><td>Element is clicked</td></tr>
  <tr><td><code>dblclick</code></td><td>Element is double-clicked</td></tr>
  <tr><td><code>keydown</code></td><td>Key is pressed</td></tr>
  <tr><td><code>keyup</code></td><td>Key is released</td></tr>
  <tr><td><code>submit</code></td><td>Form is submitted</td></tr>
  <tr><td><code>input</code></td><td>Input value changes</td></tr>
  <tr><td><code>change</code></td><td>Input loses focus after change</td></tr>
  <tr><td><code>mouseover</code></td><td>Mouse enters element</td></tr>
  <tr><td><code>load</code></td><td>Page/resource finishes loading</td></tr>
  <tr><td><code>DOMContentLoaded</code></td><td>HTML parsed (before images)</td></tr>
</table>
<h2>Event Delegation</h2>
<p>Instead of adding listeners to many elements, add one to the parent and check <code>event.target</code>:</p>
<pre><code>document.querySelector("ul").addEventListener("click", e => {
  if (e.target.tagName === "LI") {
    console.log("Clicked:", e.target.textContent);
  }
});</code></pre>
<div class="tip">💡 Use event delegation for dynamic content (elements added after page load). It's also more memory-efficient — one listener instead of dozens.</div>
`,
      starterCode: `// Events (simulated — open browser DevTools for real events)

// Simulate an event system
function EventEmitter() {
  const listeners = {};
  return {
    on(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    emit(event, data) {
      (listeners[event] || []).forEach(fn => fn(data));
    }
  };
}

const emitter = new EventEmitter();

// Register listeners
emitter.on("click", (e) => console.log("Click handler 1:", e.target));
emitter.on("click", (e) => console.log("Click handler 2: x=" + e.x));
emitter.on("keydown", (e) => console.log("Key pressed:", e.key));
emitter.on("submit", (e) => console.log("Form submitted with:", e.data));

// Emit events
emitter.emit("click", { target: "button#submit", x: 245, y: 130 });
emitter.emit("keydown", { key: "Enter", code: "Enter" });
emitter.emit("keydown", { key: "Escape", code: "Escape" });
emitter.emit("submit", { data: { username: "alice", age: 25 } });

// Demonstrate event delegation concept
const items = ["Apple", "Banana", "Cherry", "Date"];
console.log("\\nEvent delegation on list:");
items.forEach((item, i) => {
  const event = { target: { tagName: "LI", textContent: item }, index: i };
  if (event.target.tagName === "LI") {
    console.log("  Delegated click on:", event.target.textContent);
  }
});
`,
    },
    {
      id: 'async',
      title: '12. Promises & async/await',
      content: `
<h2>Why Async?</h2>
<p>JavaScript is single-threaded. To avoid blocking the UI while waiting for network requests, file reads, or timers, JavaScript uses <strong>asynchronous</strong> patterns.</p>
<h2>Promises</h2>
<p>A Promise represents a value that will be available in the future. It's in one of three states: pending, fulfilled, or rejected.</p>
<pre><code>const promise = fetch("https://api.example.com/data");

promise
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error))
  .finally(() => console.log("Done"));</code></pre>
<h2>async / await</h2>
<p><code>async/await</code> makes asynchronous code look synchronous — much cleaner than chained <code>.then()</code>:</p>
<pre><code>async function getData() {
  try {
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
}
getData();</code></pre>
<h2>Promise.all()</h2>
<pre><code>// Run multiple async operations in parallel
const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
]);</code></pre>
<div class="tip">💡 Always use <code>try/catch</code> with <code>async/await</code>. An unhandled rejected promise will crash silently in some environments. You can also add <code>.catch()</code> to any promise as a fallback.</div>
`,
      starterCode: `// Promises & async/await

// Create a Promise manually
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchUser(id) {
  return new Promise((resolve, reject) => {
    if (id > 0) {
      resolve({ id, name: "User " + id, email: \`user\${id}@example.com\` });
    } else {
      reject(new Error("Invalid user ID"));
    }
  });
}

// Using .then()/.catch()
fetchUser(1)
  .then(user => console.log("Fetched:", user.name, "-", user.email))
  .catch(err => console.error("Error:", err.message));

// Using async/await
async function main() {
  try {
    const user = await fetchUser(2);
    console.log("Async user:", user.name);

    // Parallel requests
    const [u3, u4] = await Promise.all([fetchUser(3), fetchUser(4)]);
    console.log("Parallel fetch:", u3.name, "&", u4.name);

    // Error handling
    const bad = await fetchUser(-1);
    console.log(bad);  // won't reach here
  } catch (err) {
    console.log("Caught error:", err.message);
  }
}

main();
`,
    },
    {
      id: 'classes',
      title: '13. Classes & Error Handling',
      content: `
<h2>ES6 Classes</h2>
<p>JavaScript classes are syntactic sugar over prototype-based inheritance:</p>
<pre><code>class Animal {
  #name;  // private field

  constructor(name, sound) {
    this.#name = name;
    this.sound = sound;
  }

  speak() {
    return \`\${this.#name} says \${this.sound}!\`;
  }

  get name() { return this.#name; }
}

class Dog extends Animal {
  constructor(name) {
    super(name, "Woof");
  }

  fetch(item) {
    return \`\${this.name} fetched the \${item}!\`;
  }
}</code></pre>
<h2>Error Handling</h2>
<pre><code>try {
  const data = JSON.parse("invalid json");
} catch (error) {
  console.error(error.message);  // SyntaxError
}

// Custom errors
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}</code></pre>
<div class="tip">💡 Private class fields (prefixed with <code>#</code>) are a relatively new JS feature — they're truly private and can't be accessed outside the class. This replaces the old convention of prefixing "private" properties with <code>_</code>.</div>
`,
      starterCode: `// Classes & Error Handling

class Shape {
  constructor(color = "black") {
    this.color = color;
  }
  area() { return 0; }
  toString() { return \`\${this.constructor.name}[color=\${this.color}, area=\${this.area().toFixed(2)}]\`; }
}

class Circle extends Shape {
  constructor(radius, color) {
    super(color);
    this.radius = radius;
  }
  area() { return Math.PI * this.radius ** 2; }
  perimeter() { return 2 * Math.PI * this.radius; }
}

class Rectangle extends Shape {
  constructor(width, height, color) {
    super(color);
    this.width = width;
    this.height = height;
  }
  area() { return this.width * this.height; }
}

const shapes = [
  new Circle(5, "red"),
  new Rectangle(4, 6, "blue"),
  new Circle(3, "green"),
  new Rectangle(10, 2, "purple"),
];

shapes.forEach(s => console.log(s.toString()));

const largest = shapes.reduce((max, s) => s.area() > max.area() ? s : max);
console.log("Largest:", largest.toString());

// Error handling
class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

function divide(a, b) {
  if (b === 0) throw new AppError("Division by zero", "DIV_ZERO");
  return a / b;
}

try {
  console.log(divide(10, 2));
  console.log(divide(5, 0));
} catch (e) {
  if (e instanceof AppError) {
    console.log(\`[AppError \${e.code}]: \${e.message}\`);
  }
}
`,
    },
  ],
}
