import type { Language } from './types.ts'

export const java: Language = {
  id: 'java',
  name: 'Java',
  icon: '☕',
  color: 'bg-red-500',
  textColor: 'text-red-50',
  runtime: 'static',
  description: 'A strongly-typed, object-oriented language used in enterprise software, Android apps, and backend systems.',
  lessons: [
    {
      id: 'intro',
      title: '1. Introduction & Hello World',
      content: `
<h2>What is Java?</h2>
<p>Java is a class-based, object-oriented, statically typed language designed to be platform-independent. Java programs compile to <strong>bytecode</strong> that runs on the Java Virtual Machine (JVM), which means the same code runs on any OS that has the JVM installed ("Write Once, Run Anywhere").</p>
<h2>Your First Java Program</h2>
<pre><code>public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}</code></pre>
<p>Key elements:</p>
<ul>
  <li><code>public class Main</code> — every Java file has one public class matching the filename</li>
  <li><code>public static void main(String[] args)</code> — the entry point of every Java app</li>
  <li><code>System.out.println()</code> — prints a line to the console</li>
  <li><code>;</code> — every statement ends with a semicolon</li>
</ul>
<div class="tip">💡 Java can't run in the browser. Use <a href="https://www.jdoodle.com/online-java-compiler" target="_blank" rel="noopener">JDoodle</a> or <a href="https://replit.com" target="_blank" rel="noopener">Replit</a> to run Java online. Locally, install the JDK from <a href="https://adoptium.net" target="_blank" rel="noopener">adoptium.net</a> and compile with <code>javac Main.java</code> then run with <code>java Main</code>.</div>
<div class="warning">⚠️ This lesson is read-only — Java requires a local compiler. See Expected Output to verify what the code should produce.</div>
`,
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Print to console
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java!");

        // Print without newline
        System.out.print("One ");
        System.out.print("Two ");
        System.out.println("Three");

        // Formatted output
        System.out.printf("Pi is approximately %.2f%n", Math.PI);
        System.out.printf("Name: %s, Age: %d%n", "Alice", 25);
    }
}`,
      expectedOutput: 'Hello, World!\nWelcome to Java!\nOne Two Three\nPi is approximately 3.14\nName: Alice, Age: 25',
    },
    {
      id: 'variables',
      title: '2. Variables & Data Types',
      content: `
<h2>Primitive Data Types</h2>
<p>Java is <strong>statically typed</strong> — you must declare the type of every variable:</p>
<table>
  <tr><th>Type</th><th>Size</th><th>Range / Notes</th><th>Example</th></tr>
  <tr><td><code>byte</code></td><td>1 byte</td><td>-128 to 127</td><td><code>byte b = 100;</code></td></tr>
  <tr><td><code>short</code></td><td>2 bytes</td><td>-32,768 to 32,767</td><td><code>short s = 1000;</code></td></tr>
  <tr><td><code>int</code></td><td>4 bytes</td><td>~±2 billion</td><td><code>int n = 42;</code></td></tr>
  <tr><td><code>long</code></td><td>8 bytes</td><td>very large integers</td><td><code>long l = 123L;</code></td></tr>
  <tr><td><code>float</code></td><td>4 bytes</td><td>~6-7 decimal digits</td><td><code>float f = 3.14f;</code></td></tr>
  <tr><td><code>double</code></td><td>8 bytes</td><td>~15 decimal digits</td><td><code>double d = 3.14;</code></td></tr>
  <tr><td><code>char</code></td><td>2 bytes</td><td>Single Unicode char</td><td><code>char c = 'A';</code></td></tr>
  <tr><td><code>boolean</code></td><td>1 bit</td><td>true or false</td><td><code>boolean ok = true;</code></td></tr>
</table>
<h2>Reference Types</h2>
<pre><code>String name = "Alice";   // String is a class, not a primitive
int[] scores = {90, 85, 92};   // array</code></pre>
<h2>var (Java 10+)</h2>
<pre><code>var message = "Hello!";    // type inferred as String
var count = 42;            // type inferred as int</code></pre>
<div class="tip">💡 Use <code>double</code> for floating-point numbers (not <code>float</code>) — it's more precise and is the default. Use <code>long</code> and append <code>L</code> when values exceed int range.</div>
`,
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Primitive types
        int age = 17;
        double gpa = 3.85;
        char grade = 'A';
        boolean isEnrolled = true;
        long population = 8_000_000_000L;

        System.out.println("Age: " + age);
        System.out.println("GPA: " + gpa);
        System.out.println("Grade: " + grade);
        System.out.println("Enrolled: " + isEnrolled);
        System.out.println("Population: " + population);

        // String type
        String name = "Brooklyn Prep";
        String city = "Brooklyn";
        System.out.println("School: " + name + ", " + city);

        // Type casting
        double pi = 3.14159;
        int piInt = (int) pi;   // truncates decimal
        System.out.println("pi as int: " + piInt);

        // Integer arithmetic
        int x = 10, y = 3;
        System.out.println("10 / 3 = " + (x / y));       // integer division: 3
        System.out.println("10 % 3 = " + (x % y));       // remainder: 1
        System.out.println("10.0 / 3 = " + (10.0 / 3));  // double division: 3.333...
    }
}`,
      expectedOutput: 'Age: 17\nGPA: 3.85\nGrade: A\nEnrolled: true\nPopulation: 8000000000\nSchool: Brooklyn Prep, Brooklyn\npi as int: 3\n10 / 3 = 3\n10 % 3 = 1\n10.0 / 3 = 3.3333333333333335',
    },
    {
      id: 'operators',
      title: '3. Operators & Type Casting',
      content: `
<h2>Arithmetic Operators</h2>
<pre><code>int a = 10, b = 3;
a + b   // 13
a - b   // 7
a * b   // 30
a / b   // 3   (integer division — truncates!)
a % b   // 1   (remainder/modulo)

// To get decimal division:
(double) a / b   // 3.333...</code></pre>
<h2>Compound Assignment</h2>
<pre><code>int x = 10;
x += 5;  // x = 15
x -= 3;  // x = 12
x *= 2;  // x = 24
x /= 4;  // x = 6
x++;     // x = 7 (post-increment)
++x;     // x = 8 (pre-increment)</code></pre>
<h2>Comparison & Logical</h2>
<pre><code>==  !=  >  <  >=  <=
&&  ||  !

// String equality — use .equals(), NOT ==
"hello".equals("hello")   // true
"hello" == "hello"         // sometimes works, but unreliable!</code></pre>
<h2>Widening & Narrowing Casting</h2>
<pre><code>// Widening: automatic (safe)
int i = 100;
double d = i;      // 100.0 — no cast needed

// Narrowing: explicit (may lose data)
double pi = 3.14;
int n = (int) pi;  // 3 — truncated</code></pre>
<div class="tip">💡 Always use <code>.equals()</code> to compare Strings in Java, never <code>==</code>. The <code>==</code> operator checks if two references point to the same object in memory, not if their contents are equal.</div>
`,
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Arithmetic
        int a = 17, b = 5;
        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b));    // integer division!
        System.out.println("a % b = " + (a % b));
        System.out.println("a / (double)b = " + (a / (double)b));

        // Compound assignment
        int x = 100;
        x += 25;
        System.out.println("After += 25: " + x);
        x /= 5;
        System.out.println("After /= 5: " + x);

        // String comparison
        String s1 = "Java";
        String s2 = new String("Java");
        System.out.println("== check: " + (s1 == s2));          // might be false!
        System.out.println(".equals(): " + s1.equals(s2));      // always true

        // Type casting
        double pi = 3.14159;
        int intPi = (int) pi;
        System.out.println("(int) 3.14159 = " + intPi);

        int big = 300;
        byte small = (byte) big;   // overflow!
        System.out.println("(byte) 300 = " + small);  // wraps around
    }
}`,
      expectedOutput: 'a + b = 22\na - b = 12\na * b = 85\na / b = 3\na % b = 2\na / (double)b = 3.4\nAfter += 25: 125\nAfter /= 5: 25\n== check: false\n.equals(): true\n(int) 3.14159 = 3\n(byte) 300 = 44',
    },
    {
      id: 'control-flow',
      title: '4. Control Flow (if/else/switch)',
      content: `
<h2>if / else if / else</h2>
<pre><code>int score = 85;
String grade;
if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else if (score >= 70) {
    grade = "C";
} else {
    grade = "F";
}
System.out.println(grade);  // B</code></pre>
<h2>Ternary Operator</h2>
<pre><code>String status = (age >= 18) ? "adult" : "minor";</code></pre>
<h2>switch Statement</h2>
<pre><code>switch (day) {
    case "Monday":
    case "Tuesday":
        System.out.println("Early week");
        break;
    case "Friday":
        System.out.println("Almost weekend!");
        break;
    default:
        System.out.println("Midweek");
}</code></pre>
<h2>switch Expressions (Java 14+)</h2>
<pre><code>String result = switch (day) {
    case "Saturday", "Sunday" -> "Weekend";
    case "Monday"              -> "Start of week";
    default                    -> "Weekday";
};</code></pre>
<div class="tip">💡 Always include a <code>break</code> in switch cases (unless you intentionally want fall-through). Missing <code>break</code> is a common bug — the new arrow-syntax switch expressions avoid this issue entirely.</div>
`,
      starterCode: `public class Main {
    static String getGrade(int score) {
        if (score >= 90) return "A";
        else if (score >= 80) return "B";
        else if (score >= 70) return "C";
        else if (score >= 60) return "D";
        else return "F";
    }

    static String getDayType(String day) {
        return switch (day) {
            case "Saturday", "Sunday" -> "Weekend";
            case "Monday", "Friday"   -> "Near the weekend";
            default                   -> "Midweek";
        };
    }

    public static void main(String[] args) {
        // Grade calculator
        int[] scores = {95, 82, 71, 59, 88, 100};
        for (int score : scores) {
            System.out.println("Score " + score + " -> Grade " + getGrade(score));
        }

        System.out.println();

        // Day type switch
        String[] days = {"Monday", "Wednesday", "Friday", "Saturday"};
        for (String day : days) {
            System.out.println(day + ": " + getDayType(day));
        }

        // Ternary
        int age = 17;
        String status = (age >= 18) ? "can vote" : "too young to vote";
        System.out.println("Age " + age + ": " + status);
    }
}`,
      expectedOutput: 'Score 95 -> Grade A\nScore 82 -> Grade B\nScore 71 -> Grade C\nScore 59 -> Grade F\nScore 88 -> Grade B\nScore 100 -> Grade A\n\nMonday: Near the weekend\nWednesday: Midweek\nFriday: Near the weekend\nSaturday: Weekend\nAge 17: too young to vote',
    },
    {
      id: 'loops',
      title: '5. Loops',
      content: `
<h2>for Loop</h2>
<pre><code>for (int i = 0; i < 5; i++) {
    System.out.println(i);
}</code></pre>
<h2>Enhanced for Loop (for-each)</h2>
<pre><code>int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}</code></pre>
<h2>while Loop</h2>
<pre><code>int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}</code></pre>
<h2>do...while Loop</h2>
<pre><code>int i = 0;
do {
    System.out.println(i);
    i++;
} while (i < 5);</code></pre>
<h2>Loop Control</h2>
<pre><code>for (int i = 0; i < 10; i++) {
    if (i == 3) continue;  // skip 3
    if (i == 7) break;     // stop at 7
    System.out.println(i);
}

// Labeled breaks (for nested loops)
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) break outer;
        System.out.println(i + "," + j);
    }
}</code></pre>
<div class="tip">💡 Use the enhanced for-each loop whenever you just need to iterate over all elements without needing the index. It's cleaner and avoids off-by-one errors.</div>
`,
      starterCode: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // for loop
        System.out.print("Squares: ");
        for (int i = 1; i <= 5; i++) {
            System.out.print(i * i + " ");
        }
        System.out.println();

        // enhanced for
        String[] langs = {"Java", "Python", "JavaScript", "C++"};
        System.out.println("Languages:");
        for (String lang : langs) {
            System.out.println("  - " + lang);
        }

        // while: Fibonacci
        System.out.print("Fibonacci: ");
        int a = 0, b = 1;
        while (a < 100) {
            System.out.print(a + " ");
            int temp = a + b;
            a = b;
            b = temp;
        }
        System.out.println();

        // break & continue
        System.out.print("Skip 3, stop at 7: ");
        for (int i = 0; i < 10; i++) {
            if (i == 3) continue;
            if (i == 7) break;
            System.out.print(i + " ");
        }
        System.out.println();

        // Nested loop
        System.out.println("Multiplication table:");
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                System.out.printf("%3d", i * j);
            }
            System.out.println();
        }
    }
}`,
      expectedOutput: 'Squares: 1 4 9 16 25 \nLanguages:\n  - Java\n  - Python\n  - JavaScript\n  - C++\nFibonacci: 0 1 1 2 3 5 8 13 21 34 55 89 \nSkip 3, stop at 7: 0 1 2 4 5 6 \nMultiplication table:\n  1  2  3\n  2  4  6\n  3  6  9',
    },
    {
      id: 'arrays',
      title: '6. Arrays',
      content: `
<h2>Declaring Arrays</h2>
<pre><code>// Fixed-size arrays
int[] numbers = {1, 2, 3, 4, 5};
String[] names = new String[3];
names[0] = "Alice";
names[1] = "Bob";
names[2] = "Carol";

// Access
System.out.println(numbers[0]);       // 1
System.out.println(numbers.length);   // 5</code></pre>
<h2>2D Arrays</h2>
<pre><code>int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println(matrix[1][2]);  // 6</code></pre>
<h2>Arrays Utility Class</h2>
<pre><code>import java.util.Arrays;

int[] arr = {5, 2, 8, 1, 9};
Arrays.sort(arr);                  // sort in place
System.out.println(Arrays.toString(arr));  // [1, 2, 5, 8, 9]
int[] copy = Arrays.copyOf(arr, 3);       // first 3 elements</code></pre>
<h2>ArrayList (Dynamic Arrays)</h2>
<pre><code>import java.util.ArrayList;

ArrayList&lt;String&gt; list = new ArrayList&lt;&gt;();
list.add("Apple");
list.add("Banana");
list.remove("Apple");
System.out.println(list.size());   // 1</code></pre>
<div class="tip">💡 Java arrays have a fixed size once created. If you need a resizable array, use <code>ArrayList&lt;Type&gt;</code> from <code>java.util</code>. For most real code, prefer ArrayList over plain arrays.</div>
`,
      starterCode: `import java.util.Arrays;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        // Basic array
        int[] scores = {85, 92, 78, 95, 88, 71, 90};
        System.out.println("Scores: " + Arrays.toString(scores));
        System.out.println("Length: " + scores.length);

        // Min, max, sum
        Arrays.sort(scores);
        System.out.println("Sorted: " + Arrays.toString(scores));
        System.out.println("Min: " + scores[0]);
        System.out.println("Max: " + scores[scores.length - 1]);

        int sum = 0;
        for (int s : scores) sum += s;
        System.out.printf("Average: %.1f%n", (double) sum / scores.length);

        // 2D array
        int[][] grid = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        System.out.println("Grid:");
        for (int[] row : grid) {
            System.out.println("  " + Arrays.toString(row));
        }
        System.out.println("Center: " + grid[1][1]);

        // ArrayList
        ArrayList<String> languages = new ArrayList<>();
        languages.add("Java");
        languages.add("Python");
        languages.add("JavaScript");
        languages.add("C++");
        System.out.println("Languages: " + languages);
        languages.remove("C++");
        System.out.println("After remove: " + languages);
        System.out.println("Size: " + languages.size());
    }
}`,
      expectedOutput: 'Scores: [85, 92, 78, 95, 88, 71, 90]\nLength: 7\nSorted: [71, 78, 85, 88, 90, 92, 95]\nMin: 71\nMax: 95\nAverage: 85.6\nGrid:\n  [1, 2, 3]\n  [4, 5, 6]\n  [7, 8, 9]\nCenter: 5\nLanguages: [Java, Python, JavaScript, C++]\nAfter remove: [Java, Python, JavaScript]\nSize: 3',
    },
    {
      id: 'methods',
      title: '7. Methods',
      content: `
<h2>Defining Methods</h2>
<pre><code>public class Main {
    // returnType methodName(params) {
    static int add(int a, int b) {
        return a + b;
    }

    static void greet(String name) {
        System.out.println("Hello, " + name + "!");
        // no return statement needed for void
    }

    public static void main(String[] args) {
        int result = add(3, 4);   // 7
        greet("Alice");           // Hello, Alice!
    }
}</code></pre>
<h2>Method Overloading</h2>
<p>Multiple methods can share the same name if their parameter lists differ:</p>
<pre><code>static double area(double radius) {
    return Math.PI * radius * radius;
}
static double area(double width, double height) {
    return width * height;
}</code></pre>
<h2>Varargs</h2>
<pre><code>static int sum(int... numbers) {
    int total = 0;
    for (int n : numbers) total += n;
    return total;
}
sum(1, 2, 3, 4, 5)  // 15</code></pre>
<h2>Recursion</h2>
<pre><code>static int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}</code></pre>
<div class="tip">💡 In Java, methods must declare their return type (or <code>void</code> if they return nothing). Every path through a non-void method must have a <code>return</code> statement — the compiler enforces this.</div>
`,
      starterCode: `public class Main {
    // Basic method
    static String getGrade(int score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        return "F";
    }

    // Overloaded methods
    static double area(double radius) {
        return Math.PI * radius * radius;
    }
    static double area(double width, double height) {
        return width * height;
    }

    // Varargs
    static double average(double... nums) {
        double sum = 0;
        for (double n : nums) sum += n;
        return sum / nums.length;
    }

    // Recursion
    static long factorial(int n) {
        return n <= 1 ? 1 : n * factorial(n - 1);
    }

    static long fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        // Grade calculator
        int[] scores = {95, 82, 68, 100};
        for (int s : scores)
            System.out.println("Score " + s + " -> " + getGrade(s));

        // Overloaded area
        System.out.printf("Circle area (r=5): %.2f%n", area(5));
        System.out.printf("Rectangle area (4x6): %.2f%n", area(4, 6));

        // Varargs average
        System.out.printf("Average: %.1f%n", average(85, 92, 78, 95));

        // Factorial
        for (int i = 1; i <= 7; i++)
            System.out.println(i + "! = " + factorial(i));
    }
}`,
      expectedOutput: 'Score 95 -> A\nScore 82 -> B\nScore 68 -> C\nScore 100 -> A\nCircle area (r=5): 78.54\nRectangle area (4x6): 24.00\nAverage: 87.5\n1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n6! = 720\n7! = 5040',
    },
    {
      id: 'classes',
      title: '8. Classes & Objects',
      content: `
<h2>Defining a Class</h2>
<pre><code>public class Student {
    // Fields (instance variables)
    private String name;
    private int age;
    private double gpa;

    // Constructor
    public Student(String name, int age, double gpa) {
        this.name = name;
        this.age = age;
        this.gpa = gpa;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setGpa(double gpa) { this.gpa = gpa; }

    // Method
    public String toString() {
        return name + " (age " + age + ", GPA " + gpa + ")";
    }
}</code></pre>
<h2>Creating Objects</h2>
<pre><code>Student alice = new Student("Alice", 17, 3.9);
System.out.println(alice.getName()); // Alice
System.out.println(alice);           // Alice (age 17, GPA 3.9)</code></pre>
<h2>Encapsulation</h2>
<p>Keep fields <code>private</code> and expose them through <code>public</code> getters/setters. This protects data integrity — the setter can validate input before changing the field.</p>
<div class="tip">💡 The <code>this</code> keyword refers to the current object instance. It's required when a parameter name matches a field name (to distinguish <code>this.name = name</code>).</div>
`,
      starterCode: `public class Main {
    static class BankAccount {
        private String owner;
        private double balance;

        public BankAccount(String owner, double initialBalance) {
            this.owner = owner;
            this.balance = initialBalance;
        }

        public void deposit(double amount) {
            if (amount > 0) balance += amount;
        }

        public boolean withdraw(double amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                return true;
            }
            return false;
        }

        public double getBalance() { return balance; }
        public String getOwner() { return owner; }

        public String toString() {
            return String.format("Account[%s, $%.2f]", owner, balance);
        }
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount("Alice", 1000.00);
        System.out.println(account);

        account.deposit(500.00);
        System.out.println("After $500 deposit: " + account);

        boolean success = account.withdraw(200.00);
        System.out.println("Withdraw $200: " + success + " -> " + account);

        boolean fail = account.withdraw(5000.00);
        System.out.println("Withdraw $5000: " + fail + " -> " + account);

        System.out.printf("Final balance for %s: $%.2f%n",
            account.getOwner(), account.getBalance());
    }
}`,
      expectedOutput: 'Account[Alice, $1000.00]\nAfter $500 deposit: Account[Alice, $1500.00]\nWithdraw $200: true -> Account[Alice, $1300.00]\nWithdraw $5000: false -> Account[Alice, $1300.00]\nFinal balance for Alice: $1300.00',
    },
    {
      id: 'oop',
      title: '9. OOP — Inheritance & Polymorphism',
      content: `
<h2>Inheritance</h2>
<p>A child class inherits all non-private fields and methods of its parent class:</p>
<pre><code>public class Animal {
    protected String name;
    public Animal(String name) { this.name = name; }
    public String speak() { return "..."; }
}

public class Dog extends Animal {
    public Dog(String name) { super(name); }

    @Override
    public String speak() { return name + " says Woof!"; }
}</code></pre>
<h2>Polymorphism</h2>
<p>A parent-type reference can hold a child-type object. The method called depends on the actual runtime type:</p>
<pre><code>Animal animal = new Dog("Rex");
animal.speak();  // "Rex says Woof!" — Dog's version is called</code></pre>
<h2>instanceof & Casting</h2>
<pre><code>if (animal instanceof Dog dog) {   // pattern matching (Java 16+)
    dog.fetch("ball");
}</code></pre>
<h2>final Classes and Methods</h2>
<pre><code>final class ImmutablePoint { ... }  // cannot be extended
final double PI = 3.14159;          // constant</code></pre>
<div class="tip">💡 Always use <code>@Override</code> when you intend to override a parent method. The compiler will catch typos in the method signature — without it, you might accidentally create a new method instead of overriding.</div>
`,
      starterCode: `public class Main {
    static abstract class Shape {
        protected String color;
        public Shape(String color) { this.color = color; }
        public abstract double area();
        public String describe() {
            return String.format("%s %s (area=%.2f)", color, getClass().getSimpleName(), area());
        }
    }

    static class Circle extends Shape {
        private double radius;
        public Circle(double radius, String color) {
            super(color);
            this.radius = radius;
        }
        @Override
        public double area() { return Math.PI * radius * radius; }
    }

    static class Rectangle extends Shape {
        private double w, h;
        public Rectangle(double w, double h, String color) {
            super(color);
            this.w = w; this.h = h;
        }
        @Override
        public double area() { return w * h; }
    }

    static class Triangle extends Shape {
        private double base, height;
        public Triangle(double base, double height, String color) {
            super(color);
            this.base = base; this.height = height;
        }
        @Override
        public double area() { return 0.5 * base * height; }
    }

    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(5, "red"),
            new Rectangle(4, 6, "blue"),
            new Triangle(3, 8, "green"),
            new Circle(2, "yellow"),
        };

        double totalArea = 0;
        for (Shape s : shapes) {
            System.out.println(s.describe());
            totalArea += s.area();
        }
        System.out.printf("Total area: %.2f%n", totalArea);
    }
}`,
      expectedOutput: 'red Circle (area=78.54)\nblue Rectangle (area=24.00)\ngreen Triangle (area=12.00)\nyellow Circle (area=12.57)\nTotal area: 127.11',
    },
    {
      id: 'interfaces',
      title: '10. Interfaces & Abstract Classes',
      content: `
<h2>Interfaces</h2>
<p>An interface defines a contract — a set of methods that implementing classes must provide:</p>
<pre><code>public interface Drawable {
    void draw();          // abstract by default
    default void print() { // default method (Java 8+)
        System.out.println("Printing: " + toString());
    }
}

public class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing circle");
    }
}</code></pre>
<h2>Multiple Interfaces</h2>
<p>A class can implement multiple interfaces (but can only extend one class):</p>
<pre><code>class Square implements Drawable, Serializable, Comparable&lt;Square&gt; { ... }</code></pre>
<h2>Abstract Classes</h2>
<p>Abstract classes can't be instantiated but can have both abstract and concrete methods:</p>
<pre><code>public abstract class Vehicle {
    int speed;
    abstract void accelerate();    // must override
    void honk() {                  // can override or use as-is
        System.out.println("Beep!");
    }
}</code></pre>
<h2>Interface vs Abstract Class</h2>
<table>
  <tr><th>Feature</th><th>Interface</th><th>Abstract Class</th></tr>
  <tr><td>Multiple?</td><td>Yes</td><td>No (single inheritance)</td></tr>
  <tr><td>Fields</td><td>Only constants</td><td>Any fields</td></tr>
  <tr><td>Constructors</td><td>No</td><td>Yes</td></tr>
</table>
<div class="tip">💡 Use an <strong>interface</strong> to define a capability (Flyable, Printable, Comparable). Use an <strong>abstract class</strong> to share implementation among closely related classes.</div>
`,
      starterCode: `public class Main {
    interface Describable {
        String describe();
        default void print() {
            System.out.println(describe());
        }
    }

    interface Calculable {
        double calculate();
    }

    static abstract class Shape implements Describable, Calculable {
        protected String name;
        protected String color;
        public Shape(String name, String color) {
            this.name = name; this.color = color;
        }
        @Override
        public String describe() {
            return String.format("%s %s: %.2f", color, name, calculate());
        }
    }

    static class Circle extends Shape {
        double radius;
        Circle(double r, String color) { super("Circle", color); radius = r; }
        @Override public double calculate() { return Math.PI * radius * radius; }
    }

    static class Rectangle extends Shape {
        double w, h;
        Rectangle(double w, double h, String color) { super("Rectangle", color); this.w=w; this.h=h; }
        @Override public double calculate() { return w * h; }
    }

    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(4, "Red"),
            new Rectangle(5, 3, "Blue"),
            new Circle(1.5, "Green"),
        };
        System.out.println("All shapes:");
        for (Shape s : shapes) s.print();

        // Polymorphism through interface
        Calculable[] items = shapes;
        double total = 0;
        for (Calculable c : items) total += c.calculate();
        System.out.printf("Total: %.2f%n", total);
    }
}`,
      expectedOutput: 'All shapes:\nRed Circle: 50.27\nBlue Rectangle: 15.00\nGreen Circle: 7.07\nTotal: 72.34',
    },
    {
      id: 'exceptions',
      title: '11. Exception Handling',
      content: `
<h2>Exceptions in Java</h2>
<p>Exceptions disrupt normal program flow. Java has a robust, explicit exception hierarchy:</p>
<ul>
  <li><strong>Checked exceptions</strong> — must be declared or caught (e.g., <code>IOException</code>)</li>
  <li><strong>Unchecked exceptions</strong> — runtime exceptions, don't need to be declared (e.g., <code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>)</li>
</ul>
<h2>try / catch / finally</h2>
<pre><code>try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
} catch (Exception e) {
    System.out.println("General error: " + e.getMessage());
} finally {
    System.out.println("Always runs");
}</code></pre>
<h2>throws Declaration</h2>
<pre><code>public void readFile(String path) throws IOException {
    // method that might throw checked exception
}</code></pre>
<h2>Custom Exceptions</h2>
<pre><code>public class InsufficientFundsException extends RuntimeException {
    private double amount;
    public InsufficientFundsException(double amount) {
        super("Insufficient funds: needed " + amount);
        this.amount = amount;
    }
    public double getAmount() { return amount; }
}</code></pre>
<div class="tip">💡 Catch specific exception types rather than catching <code>Exception</code> broadly. Handle exceptions at the level where you can meaningfully respond to them — don't just print and ignore.</div>
`,
      starterCode: `public class Main {
    static class InsufficientFundsException extends RuntimeException {
        private final double amount;
        public InsufficientFundsException(double amount) {
            super(String.format("Insufficient funds: tried to withdraw $%.2f", amount));
            this.amount = amount;
        }
        public double getAmount() { return amount; }
    }

    static double safeDivide(int a, int b) {
        if (b == 0) throw new ArithmeticException("Cannot divide by zero");
        return (double) a / b;
    }

    static int parseAge(String input) {
        try {
            int age = Integer.parseInt(input);
            if (age < 0 || age > 150)
                throw new IllegalArgumentException("Age out of range: " + age);
            return age;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Not a valid number: " + input, e);
        }
    }

    public static void main(String[] args) {
        // Basic exception handling
        try {
            System.out.println(safeDivide(10, 2));
            System.out.println(safeDivide(10, 0));
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("finally always runs");
        }

        // Custom exception
        try {
            throw new InsufficientFundsException(500.00);
        } catch (InsufficientFundsException e) {
            System.out.println("Caught: " + e.getMessage());
            System.out.printf("Amount: $%.2f%n", e.getAmount());
        }

        // Multiple exceptions
        String[] inputs = {"25", "abc", "-5", "200"};
        for (String input : inputs) {
            try {
                System.out.println("Age: " + parseAge(input));
            } catch (IllegalArgumentException e) {
                System.out.println("Invalid: " + e.getMessage());
            }
        }
    }
}`,
      expectedOutput: '5.0\nCaught: Cannot divide by zero\nfinally always runs\nCaught: Insufficient funds: tried to withdraw $500.00\nAmount: $500.00\nAge: 25\nInvalid: Not a valid number: abc\nInvalid: Age out of range: -5\nInvalid: Age out of range: 200',
    },
  ],
}
