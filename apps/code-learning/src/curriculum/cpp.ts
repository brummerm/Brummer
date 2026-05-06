import type { Language } from './types.ts'

export const cpp: Language = {
  id: 'cpp',
  name: 'C++',
  icon: '⚙️',
  color: 'bg-blue-600',
  textColor: 'text-blue-50',
  runtime: 'static',
  description: 'A powerful, high-performance language used in game engines, operating systems, and embedded systems.',
  lessons: [
    {
      id: 'intro',
      title: '1. Introduction & Hello World',
      content: `
<h2>What is C++?</h2>
<p>C++ was developed by Bjarne Stroustrup in the early 1980s as an extension of C. It's a compiled, statically typed language that gives programmers fine-grained control over memory and performance. C++ powers game engines (Unreal Engine), browsers (Chrome), operating systems, and high-frequency trading systems.</p>
<h2>Your First C++ Program</h2>
<pre><code>#include &lt;iostream&gt;
using namespace std;

int main() {
    cout &lt;&lt; "Hello, World!" &lt;&lt; endl;
    return 0;
}</code></pre>
<ul>
  <li><code>#include &lt;iostream&gt;</code> — include the input/output library</li>
  <li><code>using namespace std;</code> — use standard namespace (avoids <code>std::</code> prefix)</li>
  <li><code>int main()</code> — the program entry point; must return an int</li>
  <li><code>cout &lt;&lt;</code> — output stream (character out)</li>
  <li><code>endl</code> — end of line (flushes buffer)</li>
  <li><code>return 0;</code> — signals success to the OS</li>
</ul>
<div class="tip">💡 C++ can't run in the browser. Use <a href="https://www.onlinegdb.com/online_c++_compiler" target="_blank" rel="noopener">OnlineGDB</a> or <a href="https://godbolt.org" target="_blank" rel="noopener">Compiler Explorer</a> to run C++ online. Locally, use <code>g++ -o main main.cpp && ./main</code>.</div>
<div class="warning">⚠️ This lesson is read-only — C++ requires a local compiler. See Expected Output below the editor.</div>
`,
      starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to C++!" << endl;

    // Variables
    string name = "Brooklyn Prep";
    int year = 2025;
    cout << "School: " << name << ", Year: " << year << endl;

    // Basic math
    cout << "10 + 3 = " << (10 + 3) << endl;
    cout << "10 / 3 = " << (10 / 3) << endl;      // integer division
    cout << "10.0 / 3 = " << (10.0 / 3) << endl;  // floating point

    return 0;
}`,
      expectedOutput: 'Hello, World!\nWelcome to C++!\nSchool: Brooklyn Prep, Year: 2025\n10 + 3 = 13\n10 / 3 = 3\n10.0 / 3 = 3.33333',
    },
    {
      id: 'variables',
      title: '2. Variables & Data Types',
      content: `
<h2>Fundamental Types</h2>
<table>
  <tr><th>Type</th><th>Size</th><th>Notes</th></tr>
  <tr><td><code>int</code></td><td>4 bytes</td><td>Whole numbers</td></tr>
  <tr><td><code>long</code> / <code>long long</code></td><td>4/8 bytes</td><td>Larger integers</td></tr>
  <tr><td><code>float</code></td><td>4 bytes</td><td>~7 decimal digits</td></tr>
  <tr><td><code>double</code></td><td>8 bytes</td><td>~15 decimal digits (prefer this)</td></tr>
  <tr><td><code>char</code></td><td>1 byte</td><td>Single ASCII character</td></tr>
  <tr><td><code>bool</code></td><td>1 byte</td><td>true / false</td></tr>
  <tr><td><code>string</code></td><td>varies</td><td>Text (needs <code>#include &lt;string&gt;</code>)</td></tr>
</table>
<h2>Variable Declaration & Initialization</h2>
<pre><code>int age = 17;
double pi = 3.14159;
char grade = 'A';
bool enrolled = true;
string name = "Alice";

// Constants
const double TAX_RATE = 0.08;
const int MAX_STUDENTS = 30;</code></pre>
<h2>auto (type deduction, C++11)</h2>
<pre><code>auto x = 42;         // int
auto y = 3.14;       // double
auto z = "hello";    // const char*</code></pre>
<div class="tip">💡 Use <code>const</code> for values that shouldn't change — it helps the compiler optimize code and prevents accidental modification. Use <code>double</code> rather than <code>float</code> for better precision.</div>
`,
      starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Fundamental types
    int age = 17;
    double gpa = 3.85;
    char grade = 'A';
    bool enrolled = true;
    string name = "Alex";

    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "GPA: " << gpa << endl;
    cout << "Grade: " << grade << endl;
    cout << "Enrolled: " << boolalpha << enrolled << endl;

    // Constants
    const double PI = 3.14159265358979;
    const int MAX = 100;
    cout << "PI = " << PI << endl;
    cout << "MAX = " << MAX << endl;

    // auto type deduction
    auto count = 42;        // int
    auto ratio = 0.75;      // double
    auto greeting = string("Hello!");

    cout << "count=" << count << " ratio=" << ratio << endl;
    cout << greeting << endl;

    // Integer overflow example
    short small = 32767;
    small++;  // overflow!
    cout << "Overflowed short: " << small << endl;

    return 0;
}`,
      expectedOutput: 'Name: Alex\nAge: 17\nGPA: 3.85\nGrade: A\nEnrolled: true\nPI = 3.14159\nMAX = 100\ncount=42 ratio=0.75\nHello!\nOverflowed short: -32768',
    },
    {
      id: 'operators',
      title: '3. Operators',
      content: `
<h2>Arithmetic Operators</h2>
<pre><code>int a = 17, b = 5;
a + b   // 22
a - b   // 12
a * b   // 85
a / b   // 3   (integer division)
a % b   // 2   (modulo)
-a      // -17 (unary negation)</code></pre>
<h2>Increment & Decrement</h2>
<pre><code>int x = 5;
x++;   // post-increment: use x, then increment → x becomes 6
++x;   // pre-increment: increment first, then use
x--;   // post-decrement</code></pre>
<h2>Comparison & Logical Operators</h2>
<pre><code>==  !=  >  <  >=  <=
&&  ||  !  (logical AND, OR, NOT)</code></pre>
<h2>Bitwise Operators</h2>
<pre><code>&   // bitwise AND
|   // bitwise OR
^   // bitwise XOR
~   // bitwise NOT
<<  // left shift (multiply by 2)
>>  // right shift (divide by 2)</code></pre>
<h2>sizeof Operator</h2>
<pre><code>sizeof(int)     // 4 (bytes)
sizeof(double)  // 8 (bytes)
sizeof(char)    // 1 (byte)</code></pre>
<div class="tip">💡 In C++, <code>5 / 2</code> gives <code>2</code> (integer division). To get <code>2.5</code>, cast one operand: <code>5.0 / 2</code> or <code>(double)5 / 2</code>.</div>
`,
      starterCode: `#include <iostream>
using namespace std;

int main() {
    int a = 17, b = 5;
    cout << "a=" << a << " b=" << b << endl;
    cout << "a+b=" << a+b << " a-b=" << a-b << endl;
    cout << "a*b=" << a*b << " a/b=" << a/b << " a%b=" << a%b << endl;
    cout << "a/(double)b=" << a/(double)b << endl;

    // Increment/decrement
    int x = 10;
    cout << "x++: " << x++ << endl;  // prints 10, then x=11
    cout << "x: " << x << endl;      // 11
    cout << "++x: " << ++x << endl;  // x=12, prints 12

    // Comparison
    cout << boolalpha;
    cout << "5 == 5: " << (5 == 5) << endl;
    cout << "5 != 3: " << (5 != 3) << endl;
    cout << "5 > 3 && 2 < 4: " << (5 > 3 && 2 < 4) << endl;
    cout << "false || true: " << (false || true) << endl;

    // sizeof
    cout << "sizeof(int)=" << sizeof(int) << endl;
    cout << "sizeof(double)=" << sizeof(double) << endl;
    cout << "sizeof(char)=" << sizeof(char) << endl;

    // Bitwise
    cout << "5 << 1 = " << (5 << 1) << endl;  // multiply by 2
    cout << "8 >> 2 = " << (8 >> 2) << endl;  // divide by 4

    return 0;
}`,
      expectedOutput: 'a=17 b=5\na+b=22 a-b=12\na*b=85 a/b=3 a%b=2\na/(double)b=3.4\nx++: 10\nx: 11\n++x: 12\n5 == 5: true\n5 != 3: true\n5 > 3 && 2 < 4: true\nfalse || true: true\nsizeof(int)=4\nsizeof(double)=8\nsizeof(char)=1\n5 << 1 = 10\n8 >> 2 = 2',
    },
    {
      id: 'control-flow',
      title: '4. Control Flow',
      content: `
<h2>if / else if / else</h2>
<pre><code>int score = 85;
if (score >= 90) {
    cout << "A";
} else if (score >= 80) {
    cout << "B";
} else {
    cout << "C or below";
}</code></pre>
<h2>switch</h2>
<pre><code>switch (day) {
    case 1: cout << "Monday"; break;
    case 5: cout << "Friday"; break;
    default: cout << "Other day";
}</code></pre>
<h2>Ternary Operator</h2>
<pre><code>string status = (age >= 18) ? "adult" : "minor";</code></pre>
<h2>Short-Circuit Evaluation</h2>
<pre><code>// && stops at first false
// || stops at first true
if (ptr != nullptr && ptr->value > 0) {
    // safe: ptr is only dereferenced if not null
}</code></pre>
<div class="tip">💡 Always add <code>break</code> after each <code>case</code> in a switch statement, unless you intentionally want fall-through (which should be documented with a comment). Missing <code>break</code> is a common C++ bug.</div>
`,
      starterCode: `#include <iostream>
#include <string>
using namespace std;

string getGrade(int score) {
    if (score >= 90) return "A";
    else if (score >= 80) return "B";
    else if (score >= 70) return "C";
    else if (score >= 60) return "D";
    else return "F";
}

string getSeason(int month) {
    switch (month) {
        case 12: case 1: case 2: return "Winter";
        case 3:  case 4: case 5: return "Spring";
        case 6:  case 7: case 8: return "Summer";
        case 9: case 10: case 11: return "Fall";
        default: return "Invalid";
    }
}

int main() {
    // Grade calculator
    int scores[] = {95, 82, 71, 59, 100};
    for (int score : scores) {
        cout << "Score " << score << " -> " << getGrade(score) << endl;
    }
    cout << endl;

    // Seasons
    for (int m : {1, 4, 7, 10}) {
        cout << "Month " << m << ": " << getSeason(m) << endl;
    }
    cout << endl;

    // Ternary
    int age = 17;
    string status = (age >= 18) ? "can vote" : "cannot vote";
    cout << "Age " << age << ": " << status << endl;

    return 0;
}`,
      expectedOutput: 'Score 95 -> A\nScore 82 -> B\nScore 71 -> C\nScore 59 -> F\nScore 100 -> A\n\nMonth 1: Winter\nMonth 4: Spring\nMonth 7: Summer\nMonth 10: Fall\n\nAge 17: cannot vote',
    },
    {
      id: 'loops',
      title: '5. Loops',
      content: `
<h2>for Loop</h2>
<pre><code>for (int i = 0; i < 5; i++) {
    cout << i << " ";
}</code></pre>
<h2>Range-Based for (C++11)</h2>
<pre><code>vector&lt;int&gt; nums = {1, 2, 3, 4, 5};
for (int n : nums) {
    cout << n << " ";
}
// Use const auto& for large objects:
for (const auto& s : strings) { ... }</code></pre>
<h2>while Loop</h2>
<pre><code>int i = 0;
while (i < 5) {
    cout << i++ << " ";
}</code></pre>
<h2>do...while Loop</h2>
<pre><code>int i = 0;
do {
    cout << i << " ";
    i++;
} while (i < 5);</code></pre>
<h2>Loop Control</h2>
<pre><code>for (int i = 0; i < 10; i++) {
    if (i == 3) continue;  // skip 3
    if (i == 7) break;     // stop at 7
    cout << i << " ";
}</code></pre>
<div class="tip">💡 Be careful with infinite loops in C++ — there's no garbage collector or interpreter to save you! Always ensure your loop condition eventually becomes false. Use <code>break</code> with care as a last resort.</div>
`,
      starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // for loop
    cout << "Squares: ";
    for (int i = 1; i <= 6; i++) {
        cout << i*i << " ";
    }
    cout << endl;

    // Range-based for
    vector<string> langs = {"C++", "Java", "Python", "JS"};
    cout << "Languages: ";
    for (const auto& lang : langs) {
        cout << lang << " ";
    }
    cout << endl;

    // while: Fibonacci
    cout << "Fibonacci: ";
    int a = 0, b = 1;
    while (a < 100) {
        cout << a << " ";
        int tmp = a + b;
        a = b;
        b = tmp;
    }
    cout << endl;

    // break and continue
    cout << "Skip 3, stop at 7: ";
    for (int i = 0; i < 10; i++) {
        if (i == 3) continue;
        if (i == 7) break;
        cout << i << " ";
    }
    cout << endl;

    // Nested loops: multiplication table
    cout << "3x3 table:" << endl;
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 3; j++) {
            cout << i*j << "\t";
        }
        cout << endl;
    }

    return 0;
}`,
      expectedOutput: 'Squares: 1 4 9 16 25 36 \nLanguages: C++ Java Python JS \nFibonacci: 0 1 1 2 3 5 8 13 21 34 55 89 \nSkip 3, stop at 7: 0 1 2 4 5 6 \n3x3 table:\n1\t2\t3\n2\t4\t6\n3\t6\t9',
    },
    {
      id: 'functions',
      title: '6. Functions',
      content: `
<h2>Function Syntax</h2>
<pre><code>returnType functionName(parameters) {
    // body
    return value;
}

int add(int a, int b) {
    return a + b;
}

void greet(string name) {
    cout << "Hello, " << name << endl;
    // no return needed for void
}</code></pre>
<h2>Default Parameters</h2>
<pre><code>void greet(string name, string msg = "Hello") {
    cout << msg << ", " << name << endl;
}
greet("Alice");           // Hello, Alice
greet("Bob", "Howdy");    // Howdy, Bob</code></pre>
<h2>Function Overloading</h2>
<pre><code>double area(double radius) {
    return 3.14159 * radius * radius;
}
double area(double w, double h) {
    return w * h;
}</code></pre>
<h2>Pass by Value vs Reference</h2>
<pre><code>void double_val(int x)  { x *= 2; }  // copy — original unchanged
void double_ref(int& x) { x *= 2; }  // reference — original changed!

int n = 5;
double_val(n);  // n still 5
double_ref(n);  // n is now 10</code></pre>
<div class="tip">💡 Pass large objects by const reference to avoid copying: <code>void process(const string& s)</code>. Pass by value for primitives. Pass by non-const reference only when you need to modify the argument.</div>
`,
      starterCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

// Basic function
string getGrade(int score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    return "F";
}

// Default parameters
void greet(const string& name, const string& greeting = "Hello") {
    cout << greeting << ", " << name << "!" << endl;
}

// Overloaded functions
double area(double radius) { return M_PI * radius * radius; }
double area(double w, double h) { return w * h; }

// Pass by reference
void swap(int& a, int& b) {
    int tmp = a; a = b; b = tmp;
}

// Recursion
int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

int main() {
    greet("Alice");
    greet("Bob", "Good morning");

    cout << "Score 88 -> " << getGrade(88) << endl;

    cout << "Circle area(r=5): " << area(5) << endl;
    cout << "Rect area(4,6): " << area(4, 6) << endl;

    int x = 10, y = 20;
    cout << "Before swap: x=" << x << " y=" << y << endl;
    swap(x, y);
    cout << "After swap: x=" << x << " y=" << y << endl;

    for (int i = 1; i <= 6; i++)
        cout << i << "! = " << factorial(i) << endl;

    return 0;
}`,
      expectedOutput: 'Hello, Alice!\nGood morning, Bob!\nScore 88 -> B\nCircle area(r=5): 78.5398\nRect area(4,6): 24\nBefore swap: x=10 y=20\nAfter swap: x=20 y=10\n1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n6! = 720',
    },
    {
      id: 'arrays-vectors',
      title: '7. Arrays & Vectors',
      content: `
<h2>C-Style Arrays</h2>
<pre><code>int scores[5] = {85, 92, 78, 95, 88};
cout << scores[0];      // 85
cout << scores[4];      // 88 (last element)
// No bounds checking! scores[10] is undefined behavior!</code></pre>
<h2>std::vector (Preferred!)</h2>
<pre><code>#include &lt;vector&gt;

vector&lt;int&gt; v = {1, 2, 3};
v.push_back(4);          // add to end
v.pop_back();            // remove from end
v.size();                // number of elements
v[0];                    // access (no bounds check)
v.at(0);                 // access (throws if out of bounds)
v.front();               // first element
v.back();                // last element</code></pre>
<h2>2D Vectors</h2>
<pre><code>vector&lt;vector&lt;int&gt;&gt; matrix = {
    {1, 2, 3},
    {4, 5, 6}
};</code></pre>
<h2>Algorithms with Vectors</h2>
<pre><code>#include &lt;algorithm&gt;
sort(v.begin(), v.end());
auto it = find(v.begin(), v.end(), 3);
auto minIt = min_element(v.begin(), v.end());</code></pre>
<div class="tip">💡 Always prefer <code>std::vector</code> over C-style arrays in modern C++. Vectors are dynamic (resize automatically), provide bounds checking with <code>.at()</code>, and work with all STL algorithms.</div>
`,
      starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    // C-style array
    int cArr[5] = {5, 2, 8, 1, 9};
    cout << "C array first: " << cArr[0] << endl;

    // Vector
    vector<int> scores = {85, 92, 78, 95, 88, 71, 90};
    cout << "Scores: ";
    for (int s : scores) cout << s << " ";
    cout << endl;
    cout << "Size: " << scores.size() << endl;

    // push_back
    scores.push_back(83);
    cout << "After push_back(83): size=" << scores.size() << endl;

    // Algorithms
    sort(scores.begin(), scores.end());
    cout << "Sorted: ";
    for (int s : scores) cout << s << " ";
    cout << endl;

    int total = accumulate(scores.begin(), scores.end(), 0);
    double avg = (double)total / scores.size();
    cout << "Min=" << scores.front() << " Max=" << scores.back() << endl;
    cout << "Average=" << avg << endl;

    // 2D vector
    vector<vector<int>> matrix = {{1,2,3},{4,5,6},{7,8,9}};
    cout << "Matrix:" << endl;
    for (const auto& row : matrix) {
        for (int val : row) cout << val << " ";
        cout << endl;
    }

    return 0;
}`,
      expectedOutput: 'C array first: 5\nScores: 85 92 78 95 88 71 90 \nSize: 7\nAfter push_back(83): size=8\nSorted: 71 78 83 85 88 90 92 95 \nMin=71 Max=95\nAverage=85.25\nMatrix:\n1 2 3 \n4 5 6 \n7 8 9',
    },
    {
      id: 'pointers',
      title: '8. Pointers & References',
      content: `
<h2>What is a Pointer?</h2>
<p>A pointer is a variable that stores the memory address of another variable. This is one of C++'s most powerful (and dangerous) features.</p>
<pre><code>int x = 42;
int* ptr = &x;     // ptr holds the address of x

cout << x;         // 42 (the value)
cout << &x;        // 0x7ffd... (the address)
cout << ptr;       // 0x7ffd... (same address)
cout << *ptr;      // 42 (dereferencing: value at address)</code></pre>
<h2>References</h2>
<p>A reference is an alias — another name for the same variable:</p>
<pre><code>int x = 42;
int& ref = x;   // ref is another name for x
ref = 100;      // changes x too!
cout << x;      // 100</code></pre>
<h2>Pointers vs References</h2>
<table>
  <tr><th></th><th>Pointer</th><th>Reference</th></tr>
  <tr><td>Null?</td><td>Can be nullptr</td><td>Must bind to an object</td></tr>
  <tr><td>Rebindable?</td><td>Can point to different objects</td><td>Always refers to same object</td></tr>
  <tr><td>Syntax</td><td><code>*ptr</code></td><td><code>ref</code> (no special syntax)</td></tr>
</table>
<h2>Dynamic Memory</h2>
<pre><code>int* p = new int(42);    // allocate on heap
cout << *p;              // 42
delete p;                // MUST free! Or memory leaks.
p = nullptr;             // good practice after delete</code></pre>
<div class="tip">💡 Modern C++ prefers <strong>smart pointers</strong> (<code>unique_ptr</code>, <code>shared_ptr</code>) over raw pointers for heap allocation — they automatically free memory when no longer needed, preventing memory leaks.</div>
`,
      starterCode: `#include <iostream>
#include <memory>
using namespace std;

void doubleByRef(int& val) { val *= 2; }
void doubleByPtr(int* ptr) { *ptr *= 2; }

int main() {
    int x = 42;
    int* ptr = &x;

    cout << "Value: " << x << endl;
    cout << "Address: " << &x << endl;
    cout << "Pointer: " << ptr << endl;
    cout << "Dereferenced: " << *ptr << endl;

    *ptr = 100;
    cout << "After *ptr=100, x=" << x << endl;

    // Reference
    int& ref = x;
    ref = 200;
    cout << "After ref=200, x=" << x << endl;

    // Pass by reference vs pointer
    int a = 5;
    doubleByRef(a);
    cout << "After doubleByRef: " << a << endl;

    doubleByPtr(&a);
    cout << "After doubleByPtr: " << a << endl;

    // Smart pointer (modern C++)
    unique_ptr<int> smartPtr = make_unique<int>(99);
    cout << "Smart pointer value: " << *smartPtr << endl;
    // No delete needed -- automatically freed!

    return 0;
}`,
      expectedOutput: 'Value: 42\nAddress: 0x... (varies)\nPointer: 0x... (varies)\nDereferenced: 42\nAfter *ptr=100, x=100\nAfter ref=200, x=200\nAfter doubleByRef: 10\nAfter doubleByPtr: 20\nSmart pointer value: 99',
    },
    {
      id: 'classes',
      title: '9. Classes & Objects',
      content: `
<h2>Defining a Class</h2>
<pre><code>class Student {
private:
    string name;    // private: only accessible inside class
    double gpa;

public:
    // Constructor
    Student(string name, double gpa) : name(name), gpa(gpa) {}

    // Getters
    string getName() const { return name; }
    double getGpa() const { return gpa; }

    // Method
    void printInfo() const {
        cout << name << " (GPA: " << gpa << ")" << endl;
    }
};</code></pre>
<h2>Constructors & Destructors</h2>
<pre><code>class Resource {
public:
    Resource() { cout << "Created\n"; }   // constructor
    ~Resource() { cout << "Destroyed\n"; } // destructor (auto-called)
};</code></pre>
<h2>const Methods</h2>
<p>Methods marked <code>const</code> promise not to modify the object. Prefer const-correctness throughout your code.</p>
<div class="tip">💡 Use the <strong>member initializer list</strong> syntax (<code>: name(name), gpa(gpa)</code>) in constructors instead of assignments in the body — it's more efficient as it initializes members directly rather than default-constructing and then assigning.</div>
`,
      starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Student {
private:
    string name;
    int age;
    vector<double> grades;

public:
    Student(const string& name, int age)
        : name(name), age(age) {}

    void addGrade(double grade) { grades.push_back(grade); }

    double getAverage() const {
        if (grades.empty()) return 0.0;
        double sum = 0;
        for (double g : grades) sum += g;
        return sum / grades.size();
    }

    string getLetterGrade() const {
        double avg = getAverage();
        if (avg >= 90) return "A";
        if (avg >= 80) return "B";
        if (avg >= 70) return "C";
        return "F";
    }

    void printReport() const {
        cout << "Student: " << name << " (age " << age << ")" << endl;
        cout << "  Average: " << getAverage() << endl;
        cout << "  Grade: " << getLetterGrade() << endl;
    }
};

int main() {
    Student s1("Alice", 17);
    s1.addGrade(92); s1.addGrade(88); s1.addGrade(95);
    s1.printReport();

    Student s2("Bob", 16);
    s2.addGrade(75); s2.addGrade(82); s2.addGrade(71);
    s2.printReport();

    return 0;
}`,
      expectedOutput: 'Student: Alice (age 17)\n  Average: 91.6667\n  Grade: A\nStudent: Bob (age 16)\n  Average: 76\n  Grade: C',
    },
    {
      id: 'oop',
      title: '10. OOP & Inheritance',
      content: `
<h2>Inheritance</h2>
<pre><code>class Animal {
protected:
    string name;
public:
    Animal(string name) : name(name) {}
    virtual string speak() const { return "..."; }
    virtual ~Animal() {}  // virtual destructor!
};

class Dog : public Animal {
public:
    Dog(string name) : Animal(name) {}
    string speak() const override {
        return name + " says Woof!";
    }
};</code></pre>
<h2>virtual & override</h2>
<p>Mark base class methods as <code>virtual</code> to allow overriding. Use <code>override</code> keyword in derived class to make intent clear and catch errors.</p>
<h2>Pure Virtual Functions & Abstract Classes</h2>
<pre><code>class Shape {
public:
    virtual double area() const = 0;  // pure virtual
    virtual ~Shape() {}
}; // Shape is abstract -- cannot be instantiated</code></pre>
<h2>Polymorphism via Pointer/Reference</h2>
<pre><code>Animal* animal = new Dog("Rex");
animal->speak();  // calls Dog's speak(), not Animal's!
delete animal;</code></pre>
<div class="tip">💡 Always declare destructors as <code>virtual</code> in base classes. Without this, deleting a derived object through a base pointer will only call the base destructor, potentially leaking resources.</div>
`,
      starterCode: `#include <iostream>
#include <vector>
#include <memory>
#include <cmath>
using namespace std;

class Shape {
public:
    virtual double area() const = 0;
    virtual string name() const = 0;
    virtual ~Shape() {}

    void printInfo() const {
        cout << name() << ": area = " << area() << endl;
    }
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return M_PI * radius * radius; }
    string name() const override { return "Circle(r=" + to_string(radius) + ")"; }
};

class Rectangle : public Shape {
    double w, h;
public:
    Rectangle(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
    string name() const override { return "Rectangle(" + to_string(w) + "x" + to_string(h) + ")"; }
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Circle>(5.0));
    shapes.push_back(make_unique<Rectangle>(4.0, 6.0));
    shapes.push_back(make_unique<Circle>(3.0));
    shapes.push_back(make_unique<Rectangle>(2.0, 8.0));

    double total = 0;
    for (const auto& s : shapes) {
        s->printInfo();
        total += s->area();
    }
    cout << "Total area: " << total << endl;

    return 0;
}`,
      expectedOutput: 'Circle(r=5.000000): area = 78.5398\nRectangle(4.000000x6.000000): area = 24\nCircle(r=3.000000): area = 28.2743\nRectangle(2.000000x8.000000): area = 16\nTotal area: 146.814',
    },
    {
      id: 'stl',
      title: '11. STL & Exception Handling',
      content: `
<h2>The Standard Template Library (STL)</h2>
<p>The STL provides powerful, generic data structures and algorithms:</p>
<h2>Common Containers</h2>
<pre><code>#include &lt;vector&gt;    // dynamic array
#include &lt;map&gt;       // key-value pairs (sorted)
#include &lt;set&gt;       // unique sorted values
#include &lt;stack&gt;     // LIFO stack
#include &lt;queue&gt;     // FIFO queue
#include &lt;unordered_map&gt;  // hash map (faster lookup)</code></pre>
<h2>std::map Example</h2>
<pre><code>map&lt;string, int&gt; scores;
scores["Alice"] = 95;
scores["Bob"]   = 82;

for (const auto& [name, score] : scores) {
    cout << name << ": " << score << endl;
}</code></pre>
<h2>Exception Handling</h2>
<pre><code>try {
    vector&lt;int&gt; v = {1, 2, 3};
    cout &lt;&lt; v.at(10);   // throws std::out_of_range
} catch (const out_of_range& e) {
    cerr &lt;&lt; "Out of range: " &lt;&lt; e.what() &lt;&lt; endl;
} catch (const exception& e) {
    cerr &lt;&lt; "Exception: " &lt;&lt; e.what() &lt;&lt; endl;
}</code></pre>
<h2>Custom Exception</h2>
<pre><code>class MyError : public runtime_error {
public:
    MyError(const string& msg) : runtime_error(msg) {}
};</code></pre>
<div class="tip">💡 Use <code>unordered_map</code> for O(1) average-time lookups. Use <code>map</code> when you need elements sorted by key. The STL algorithms (<code>sort</code>, <code>find</code>, <code>transform</code>) work on any container with iterators.</div>
`,
      starterCode: `#include <iostream>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <stdexcept>
using namespace std;

int main() {
    // map: word frequency counter
    map<string, int> freq;
    vector<string> words = {"apple","banana","apple","cherry","banana","apple"};
    for (const auto& w : words) freq[w]++;

    cout << "Word frequencies:" << endl;
    for (const auto& [word, count] : freq)
        cout << "  " << word << ": " << count << endl;

    // set: unique values
    set<int> seen;
    vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
    for (int n : nums) seen.insert(n);
    cout << "Unique sorted: ";
    for (int n : seen) cout << n << " ";
    cout << endl;

    // Exception handling
    vector<int> v = {10, 20, 30};
    try {
        cout << "v[1] = " << v.at(1) << endl;
        cout << "v[99] = " << v.at(99) << endl;  // throws
    } catch (const out_of_range& e) {
        cout << "Caught: " << e.what() << endl;
    }

    // Custom exception
    try {
        int divisor = 0;
        if (divisor == 0) throw runtime_error("Division by zero");
        cout << 10 / divisor << endl;
    } catch (const runtime_error& e) {
        cout << "Runtime error: " << e.what() << endl;
    }

    return 0;
}`,
      expectedOutput: 'Word frequencies:\n  apple: 3\n  banana: 2\n  cherry: 1\nUnique sorted: 1 2 3 4 5 6 9 \nv[1] = 20\nCaught: vector::_M_range_check: __n (which is 99) >= this->size() (which is 3)\nRuntime error: Division by zero',
    },
  ],
}
