import type { Language } from './types.ts'

export const python: Language = {
  id: 'python',
  name: 'Python',
  icon: '🐍',
  color: 'bg-yellow-400',
  textColor: 'text-yellow-900',
  runtime: 'python',
  description: 'A beginner-friendly language used in data science, web development, automation, and AI.',
  lessons: [
    {
      id: 'intro',
      title: '1. Introduction to Python',
      content: `
<h2>What is Python?</h2>
<p>Python is a high-level, interpreted programming language known for its clean, readable syntax. Created by Guido van Rossum in 1991, it has become one of the most popular languages in the world — used in web development, data science, machine learning, automation, and scripting.</p>
<h2>Your First Python Program</h2>
<p>The <code>print()</code> function displays output to the console. It's the first function most Python programmers learn:</p>
<pre><code>print("Hello, World!")
print("Welcome to Python!")</code></pre>
<h2>Comments</h2>
<p>Comments start with <code>#</code> and are completely ignored by Python. Use them to explain your code to other humans (and your future self):</p>
<pre><code># This is a single-line comment
print("Comments don't affect execution")  # inline comment</code></pre>
<h2>Python is Interpreted</h2>
<p>Python runs your code line by line rather than compiling it all at once. This makes it great for experimenting — you can run small snippets and see results immediately.</p>
<div class="tip">💡 Python uses indentation (spaces or tabs) instead of curly braces to define code blocks. Consistent indentation is required — mixing tabs and spaces will cause errors!</div>
`,
      starterCode: `# Welcome to Python!
# Try editing this code and clicking Run

print("Hello, World!")
print("My name is: Python Learner")

# Python can do math too
print(2 + 3)
print(10 * 5)
print(7 / 2)
`,
      expectedOutput: 'Hello, World!\nMy name is: Python Learner\n5\n50\n3.5',
    },
    {
      id: 'variables',
      title: '2. Variables & Data Types',
      content: `
<h2>Variables</h2>
<p>A variable is a named container that holds a value. In Python you don't need to declare a type — just assign a value with <code>=</code>:</p>
<pre><code>name = "Alice"
age = 30
height = 5.7
is_student = True</code></pre>
<h2>Basic Data Types</h2>
<table>
  <tr><th>Type</th><th>Example</th><th>Description</th></tr>
  <tr><td><code>int</code></td><td><code>42</code></td><td>Whole numbers</td></tr>
  <tr><td><code>float</code></td><td><code>3.14</code></td><td>Decimal numbers</td></tr>
  <tr><td><code>str</code></td><td><code>"hello"</code></td><td>Text (strings)</td></tr>
  <tr><td><code>bool</code></td><td><code>True</code> / <code>False</code></td><td>Boolean values</td></tr>
  <tr><td><code>NoneType</code></td><td><code>None</code></td><td>Absence of value</td></tr>
</table>
<h2>Checking Types</h2>
<p>Use <code>type()</code> to inspect what type a variable holds:</p>
<pre><code>x = 42
print(type(x))   # &lt;class 'int'&gt;</code></pre>
<h2>Type Conversion</h2>
<p>Convert between types using built-in functions:</p>
<pre><code>num_str = "100"
num = int(num_str)   # string → int
pi = float("3.14")   # string → float
text = str(99)       # int → string</code></pre>
<div class="tip">💡 Python variable names are case-sensitive: <code>age</code> and <code>Age</code> are two different variables. Use lowercase with underscores for multi-word names: <code>first_name</code>.</div>
`,
      starterCode: `# Variables and Data Types

name = "Alex"
age = 17
gpa = 3.85
is_enrolled = True
favorite_color = None

print("Name:", name)
print("Age:", age)
print("GPA:", gpa)
print("Enrolled:", is_enrolled)
print("Favorite color:", favorite_color)

# Check types
print(type(name))
print(type(age))
print(type(gpa))

# Type conversion
score_str = "95"
score_int = int(score_str)
print("Score + 5 =", score_int + 5)
`,
      expectedOutput: 'Name: Alex\nAge: 17\nGPA: 3.85\nEnrolled: True\nFavorite color: None\n<class \'str\'>\n<class \'int\'>\n<class \'float\'>\nScore + 5 = 100',
    },
    {
      id: 'strings',
      title: '3. Strings & String Methods',
      content: `
<h2>Creating Strings</h2>
<p>Strings are sequences of characters. You can use single or double quotes, or triple quotes for multi-line strings:</p>
<pre><code>greeting = "Hello, World!"
name = 'Python'
poem = """Roses are red,
Violets are blue"""</code></pre>
<h2>String Concatenation & f-Strings</h2>
<p>Join strings with <code>+</code>, or use f-strings (formatted string literals) for cleaner interpolation:</p>
<pre><code>first = "John"
last = "Doe"
full = first + " " + last          # concatenation
full2 = f"{first} {last}"          # f-string (preferred)
print(f"My name is {first} {last} and I am {2 + 2} years old")</code></pre>
<h2>Common String Methods</h2>
<ul>
  <li><code>.upper()</code> / <code>.lower()</code> — change case</li>
  <li><code>.strip()</code> — remove leading/trailing whitespace</li>
  <li><code>.replace(old, new)</code> — replace occurrences</li>
  <li><code>.split(sep)</code> — split into a list</li>
  <li><code>.find(sub)</code> — find index of substring (-1 if not found)</li>
  <li><code>.startswith()</code> / <code>.endswith()</code> — check prefix/suffix</li>
  <li><code>len(s)</code> — length of string</li>
</ul>
<h2>String Slicing</h2>
<p>Access characters using indexing (0-based) and slicing:</p>
<pre><code>s = "Python"
print(s[0])      # 'P'
print(s[-1])     # 'n'
print(s[0:3])    # 'Pyt'
print(s[::2])    # 'Pto'  (every other character)</code></pre>
<div class="tip">💡 Strings in Python are immutable — you can't change individual characters. You must create a new string instead.</div>
`,
      starterCode: `# String Methods

message = "  Hello, Python World!  "

print(message.strip())
print(message.strip().upper())
print(message.strip().lower())
print(message.strip().replace("Python", "Amazing"))

# Split and join
words = "apple,banana,cherry"
fruit_list = words.split(",")
print(fruit_list)
print(" | ".join(fruit_list))

# f-strings
name = "Brooklyn"
year = 2025
print(f"Welcome to {name} in {year}!")
print(f"2 + 2 = {2 + 2}")

# Slicing
lang = "Python"
print(lang[0:3])
print(lang[::-1])   # reversed
print(len(lang))
`,
    },
    {
      id: 'lists',
      title: '4. Lists',
      content: `
<h2>What is a List?</h2>
<p>A list is an ordered, mutable collection that can hold items of any type. Lists are defined with square brackets:</p>
<pre><code>fruits = ["apple", "banana", "cherry"]
mixed = [1, "two", 3.0, True]
empty = []</code></pre>
<h2>Accessing & Modifying Items</h2>
<pre><code>fruits = ["apple", "banana", "cherry"]
print(fruits[0])      # "apple"
print(fruits[-1])     # "cherry"
fruits[1] = "mango"   # modify item
print(fruits[0:2])    # slice: ["apple", "mango"]</code></pre>
<h2>Common List Methods</h2>
<ul>
  <li><code>.append(item)</code> — add to end</li>
  <li><code>.insert(index, item)</code> — insert at position</li>
  <li><code>.remove(item)</code> — remove first occurrence</li>
  <li><code>.pop(index)</code> — remove and return item (default: last)</li>
  <li><code>.sort()</code> — sort in place</li>
  <li><code>.reverse()</code> — reverse in place</li>
  <li><code>.index(item)</code> — find index of item</li>
  <li><code>len(list)</code> — number of items</li>
</ul>
<h2>List Comprehensions</h2>
<p>A concise way to build lists using a single line:</p>
<pre><code>squares = [x**2 for x in range(1, 6)]
# [1, 4, 9, 16, 25]

evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]</code></pre>
<div class="tip">💡 Lists can contain other lists: <code>matrix = [[1, 2], [3, 4]]</code>. Access nested items with <code>matrix[0][1]</code> → <code>2</code>.</div>
`,
      starterCode: `# Lists

# Create and access
grades = [92, 85, 78, 95, 88]
print("Grades:", grades)
print("First:", grades[0])
print("Last:", grades[-1])
print("Highest:", max(grades))
print("Lowest:", min(grades))
print("Average:", sum(grades) / len(grades))

# Modify
grades.append(91)
grades.sort(reverse=True)
print("Sorted:", grades)

# List comprehension
squared = [g**2 for g in grades[:3]]
print("Squared top 3:", squared)

# Strings as lists
letters = list("Python")
print(letters)
letters.reverse()
print("Reversed:", letters)
`,
    },
    {
      id: 'dictionaries',
      title: '5. Dictionaries',
      content: `
<h2>What is a Dictionary?</h2>
<p>A dictionary stores key-value pairs. Keys must be unique and immutable (strings, numbers, tuples). Values can be anything. Defined with curly braces:</p>
<pre><code>student = {
    "name": "Alice",
    "age": 18,
    "gpa": 3.9
}</code></pre>
<h2>Accessing & Modifying Values</h2>
<pre><code>print(student["name"])     # "Alice"
print(student.get("age"))  # 18 (safe — returns None if key missing)
student["grade"] = "A"     # add new key
student["age"] = 19        # update existing key
del student["gpa"]         # remove a key</code></pre>
<h2>Useful Dictionary Methods</h2>
<ul>
  <li><code>.keys()</code> — all keys</li>
  <li><code>.values()</code> — all values</li>
  <li><code>.items()</code> — all key-value pairs as tuples</li>
  <li><code>.get(key, default)</code> — safe access with fallback</li>
  <li><code>.update(other_dict)</code> — merge another dict in</li>
  <li><code>.pop(key)</code> — remove and return a value</li>
</ul>
<h2>Iterating a Dictionary</h2>
<pre><code>for key, value in student.items():
    print(f"{key}: {value}")</code></pre>
<div class="tip">💡 Since Python 3.7+, dictionaries maintain insertion order. Use <code>.get(key, default)</code> instead of <code>[key]</code> when you're not sure a key exists — it avoids a KeyError.</div>
`,
      starterCode: `# Dictionaries

person = {
    "name": "Jordan",
    "age": 16,
    "city": "Brooklyn",
    "hobbies": ["coding", "chess", "basketball"]
}

# Access
print("Name:", person["name"])
print("City:", person.get("city"))
print("Hobbies:", person["hobbies"])

# Modify
person["age"] = 17
person["school"] = "Brooklyn Prep"

# Iterate
print("\\nAll info:")
for key, value in person.items():
    print(f"  {key}: {value}")

# Dictionary comprehension
scores = {"math": 90, "english": 85, "science": 92}
passed = {subject: score for subject, score in scores.items() if score >= 90}
print("\\nPassed with 90+:", passed)
`,
    },
    {
      id: 'tuples-sets',
      title: '6. Tuples & Sets',
      content: `
<h2>Tuples</h2>
<p>A tuple is like a list, but <strong>immutable</strong> — once created, its contents cannot change. Defined with parentheses:</p>
<pre><code>coordinates = (40.7128, -74.0060)   # NYC lat/lng
rgb = (255, 128, 0)
single = (42,)   # comma required for single-item tuple!

x, y = coordinates   # tuple unpacking</code></pre>
<p>Tuples are faster than lists and signal to readers that the data shouldn't change. They can be used as dictionary keys (lists cannot).</p>
<h2>Sets</h2>
<p>A set is an unordered collection of <strong>unique</strong> values. Duplicates are automatically removed. Defined with curly braces (but unlike dicts, no key-value pairs):</p>
<pre><code>colors = {"red", "green", "blue", "red"}  # {"red", "green", "blue"}
empty_set = set()   # NOT {} — that creates an empty dict!</code></pre>
<h2>Set Operations</h2>
<ul>
  <li><code>.add(item)</code> — add an element</li>
  <li><code>.remove(item)</code> — remove (KeyError if missing)</li>
  <li><code>.discard(item)</code> — remove (no error if missing)</li>
  <li><code>a | b</code> — union (all items from both)</li>
  <li><code>a & b</code> — intersection (items in both)</li>
  <li><code>a - b</code> — difference (in a but not b)</li>
  <li><code>a ^ b</code> — symmetric difference (in one but not both)</li>
</ul>
<div class="tip">💡 Use sets when you need fast membership testing (<code>item in my_set</code> is O(1)) or when you want to eliminate duplicates from a list: <code>unique = list(set(my_list))</code>.</div>
`,
      starterCode: `# Tuples and Sets

# Tuples
point = (3, 7)
print("Point:", point)
x, y = point
print(f"x={x}, y={y}")

rgb_red = (255, 0, 0)
rgb_blue = (0, 0, 255)
print("Red:", rgb_red)

# Sets - automatic deduplication
nums = {1, 2, 3, 2, 1, 4, 3, 5}
print("Unique numbers:", nums)

# Set operations
a = {1, 2, 3, 4, 5}
b = {3, 4, 5, 6, 7}
print("Union:", a | b)
print("Intersection:", a & b)
print("Difference (a-b):", a - b)

# Practical: remove duplicates from a list
words = ["apple", "banana", "apple", "cherry", "banana", "date"]
unique_words = list(set(words))
print("Unique words:", sorted(unique_words))
`,
    },
    {
      id: 'conditionals',
      title: '7. if / elif / else',
      content: `
<h2>Conditional Statements</h2>
<p>Conditionals let your program make decisions based on whether something is true or false:</p>
<pre><code>age = 18
if age >= 18:
    print("You can vote!")
elif age >= 16:
    print("Almost voting age!")
else:
    print("Too young to vote.")</code></pre>
<h2>Comparison Operators</h2>
<table>
  <tr><th>Operator</th><th>Meaning</th></tr>
  <tr><td><code>==</code></td><td>Equal to</td></tr>
  <tr><td><code>!=</code></td><td>Not equal to</td></tr>
  <tr><td><code>&gt;</code> / <code>&lt;</code></td><td>Greater / Less than</td></tr>
  <tr><td><code>&gt;=</code> / <code>&lt;=</code></td><td>Greater / Less than or equal</td></tr>
  <tr><td><code>in</code></td><td>Membership test</td></tr>
  <tr><td><code>is</code></td><td>Identity test</td></tr>
</table>
<h2>Logical Operators</h2>
<p>Combine conditions with <code>and</code>, <code>or</code>, and <code>not</code>:</p>
<pre><code>score = 85
if score >= 90 and score <= 100:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C or below"</code></pre>
<h2>Ternary (Inline) Expressions</h2>
<pre><code>status = "adult" if age >= 18 else "minor"</code></pre>
<div class="tip">💡 Python uses truthy/falsy values — empty strings, 0, empty lists, and None are all falsy. You can write <code>if my_list:</code> instead of <code>if len(my_list) > 0:</code>.</div>
`,
      starterCode: `# Conditionals

score = 87

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score: {score} → Grade: {grade}")

# Multiple conditions
username = "alice"
password = "secret123"
if username == "alice" and password == "secret123":
    print("Login successful!")
else:
    print("Invalid credentials.")

# Membership test
fruits = ["apple", "banana", "cherry"]
search = "banana"
if search in fruits:
    print(f"{search} is in the list!")

# Ternary
temperature = 75
weather = "warm" if temperature > 70 else "cool"
print(f"It's {weather} today ({temperature}°F)")
`,
    },
    {
      id: 'loops',
      title: '8. for & while Loops',
      content: `
<h2>for Loops</h2>
<p>A <code>for</code> loop iterates over any iterable — a list, string, range, dictionary, etc.:</p>
<pre><code>for fruit in ["apple", "banana", "cherry"]:
    print(fruit)

for i in range(5):      # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 10, 2):  # 1, 3, 5, 7, 9
    print(i)</code></pre>
<h2>while Loops</h2>
<p>A <code>while</code> loop keeps running as long as a condition is True:</p>
<pre><code>count = 0
while count < 5:
    print(count)
    count += 1</code></pre>
<h2>Loop Control</h2>
<ul>
  <li><code>break</code> — exit the loop immediately</li>
  <li><code>continue</code> — skip to the next iteration</li>
  <li><code>else</code> — runs after a loop completes normally (without break)</li>
</ul>
<h2>enumerate() and zip()</h2>
<pre><code># enumerate gives index + value
for i, fruit in enumerate(["apple", "banana"]):
    print(f"{i}: {fruit}")

# zip pairs up two lists
names = ["Alice", "Bob"]
scores = [90, 85]
for name, score in zip(names, scores):
    print(f"{name}: {score}")</code></pre>
<div class="tip">💡 Avoid infinite loops! Always ensure your <code>while</code> loop's condition will eventually become False, or include a <code>break</code> statement.</div>
`,
      starterCode: `# Loops

# for loop with range
print("Counting up:")
for i in range(1, 6):
    print(f"  {i}")

# Iterating a list
colors = ["red", "green", "blue", "yellow"]
print("\\nColors:")
for color in colors:
    print(f"  - {color}")

# while loop
print("\\nCountdown:")
n = 5
while n > 0:
    print(f"  {n}...")
    n -= 1
print("  Blast off!")

# enumerate
print("\\nIndexed fruits:")
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits, start=1):
    print(f"  {i}. {fruit}")

# List built with loop
squares = []
for x in range(1, 6):
    squares.append(x ** 2)
print("\\nSquares:", squares)
`,
    },
    {
      id: 'functions',
      title: '9. Functions & Scope',
      content: `
<h2>Defining Functions</h2>
<p>Functions let you group reusable code under a name. Use the <code>def</code> keyword:</p>
<pre><code>def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))   # Hello, Alice!</code></pre>
<h2>Parameters & Default Values</h2>
<pre><code>def power(base, exponent=2):
    return base ** exponent

print(power(3))      # 9  (exponent defaults to 2)
print(power(2, 10))  # 1024</code></pre>
<h2>*args and **kwargs</h2>
<pre><code>def add_all(*numbers):
    return sum(numbers)

print(add_all(1, 2, 3, 4))  # 10

def describe(**info):
    for k, v in info.items():
        print(f"{k}: {v}")

describe(name="Bob", age=25)</code></pre>
<h2>Scope</h2>
<p>Variables defined inside a function are <strong>local</strong> — they only exist within that function. Variables defined outside are <strong>global</strong>.</p>
<pre><code>x = 10           # global
def show():
    x = 99       # local — does NOT change global x
    print(x)

show()           # 99
print(x)         # 10 — unchanged</code></pre>
<div class="tip">💡 Functions should do one thing well. If a function is getting long, break it into smaller functions. This is called the Single Responsibility Principle.</div>
`,
      starterCode: `# Functions

def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Good morning"))

# Function with multiple return values
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([5, 2, 8, 1, 9, 3])
print(f"Min: {low}, Max: {high}")

# *args
def total(*args):
    result = sum(args)
    print(f"Sum of {args} = {result}")
    return result

total(1, 2, 3)
total(10, 20, 30, 40)

# Recursive function
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

for i in range(1, 7):
    print(f"{i}! = {factorial(i)}")
`,
    },
    {
      id: 'classes',
      title: '10. Classes & OOP',
      content: `
<h2>Object-Oriented Programming</h2>
<p>OOP organizes code into <strong>classes</strong> (blueprints) and <strong>objects</strong> (instances). Python is fully object-oriented.</p>
<h2>Defining a Class</h2>
<pre><code>class Dog:
    species = "Canis familiaris"   # class attribute

    def __init__(self, name, age):   # constructor
        self.name = name   # instance attributes
        self.age = age

    def bark(self):
        return f"{self.name} says Woof!"

    def __str__(self):   # string representation
        return f"Dog({self.name}, {self.age})"

rex = Dog("Rex", 3)
print(rex.bark())    # Rex says Woof!
print(str(rex))      # Dog(Rex, 3)</code></pre>
<h2>Inheritance</h2>
<p>A child class inherits all the attributes and methods of its parent:</p>
<pre><code>class GuideDog(Dog):
    def __init__(self, name, age, owner):
        super().__init__(name, age)
        self.owner = owner

    def bark(self):   # override parent method
        return f"{self.name} guides {self.owner}"</code></pre>
<h2>Special Methods (Dunder Methods)</h2>
<ul>
  <li><code>__init__</code> — constructor</li>
  <li><code>__str__</code> — human-readable string</li>
  <li><code>__repr__</code> — developer-friendly string</li>
  <li><code>__len__</code> — supports <code>len(obj)</code></li>
  <li><code>__eq__</code> — supports <code>==</code></li>
</ul>
<div class="tip">💡 The <code>self</code> parameter refers to the current instance. It's required as the first parameter in all instance methods, but you don't pass it explicitly when calling the method.</div>
`,
      starterCode: `# Classes and OOP

class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

    def speak(self):
        return f"{self.name} says {self.sound}!"

    def __str__(self):
        return f"Animal({self.name})"

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, "Woof")
        self.breed = breed

    def fetch(self, item):
        return f"{self.name} fetched the {item}!"

class Cat(Animal):
    def __init__(self, name):
        super().__init__(name, "Meow")

    def purr(self):
        return f"{self.name} is purring..."

dog = Dog("Rex", "Labrador")
cat = Cat("Whiskers")

print(dog.speak())
print(dog.fetch("ball"))
print(cat.speak())
print(cat.purr())

animals = [dog, cat, Animal("Cow", "Moo")]
for animal in animals:
    print(animal.speak())
`,
    },
    {
      id: 'modules',
      title: '11. Modules & Imports',
      content: `
<h2>What is a Module?</h2>
<p>A module is a file containing Python code (functions, classes, variables) that you can reuse. Python comes with a large <strong>standard library</strong> of built-in modules.</p>
<h2>Importing Modules</h2>
<pre><code>import math
print(math.pi)           # 3.141592653589793
print(math.sqrt(16))     # 4.0

import random
print(random.randint(1, 100))   # random int between 1-100

from datetime import datetime
now = datetime.now()
print(now.strftime("%Y-%m-%d"))</code></pre>
<h2>Useful Standard Library Modules</h2>
<table>
  <tr><th>Module</th><th>Purpose</th></tr>
  <tr><td><code>math</code></td><td>Mathematical functions</td></tr>
  <tr><td><code>random</code></td><td>Random number generation</td></tr>
  <tr><td><code>datetime</code></td><td>Dates and times</td></tr>
  <tr><td><code>os</code></td><td>Operating system interaction</td></tr>
  <tr><td><code>json</code></td><td>JSON encoding/decoding</td></tr>
  <tr><td><code>sys</code></td><td>System-specific parameters</td></tr>
  <tr><td><code>re</code></td><td>Regular expressions</td></tr>
  <tr><td><code>collections</code></td><td>Specialized container types</td></tr>
</table>
<h2>Creating Your Own Module</h2>
<p>Any <code>.py</code> file is a module. If you have <code>utils.py</code>, you can do <code>import utils</code> and call <code>utils.my_function()</code>.</p>
<div class="tip">💡 Use <code>from module import name</code> to import a specific item without the module prefix. Use <code>import module as alias</code> to give a module a shorter name (e.g., <code>import numpy as np</code>).</div>
`,
      starterCode: `# Modules and Imports
import math
import random
from datetime import datetime

# math module
print("=== math module ===")
print(f"pi = {math.pi:.4f}")
print(f"e = {math.e:.4f}")
print(f"sqrt(144) = {math.sqrt(144)}")
print(f"ceil(4.2) = {math.ceil(4.2)}")
print(f"floor(4.9) = {math.floor(4.9)}")
print(f"factorial(6) = {math.factorial(6)}")

# random module
print("\\n=== random module ===")
print(f"Random int 1-10: {random.randint(1, 10)}")
fruits = ["apple", "banana", "cherry", "date"]
print(f"Random choice: {random.choice(fruits)}")
numbers = list(range(1, 11))
random.shuffle(numbers)
print(f"Shuffled: {numbers}")

# datetime module
print("\\n=== datetime module ===")
now = datetime.now()
print(f"Now: {now.strftime('%Y-%m-%d %H:%M')}")
print(f"Year: {now.year}, Month: {now.month}")
`,
    },
    {
      id: 'errors',
      title: '12. Error Handling',
      content: `
<h2>Exceptions in Python</h2>
<p>When Python encounters an error at runtime, it raises an <strong>exception</strong>. If not handled, the program crashes with a traceback. Common exceptions:</p>
<ul>
  <li><code>ValueError</code> — wrong value (e.g., <code>int("abc")</code>)</li>
  <li><code>TypeError</code> — wrong type (e.g., adding int and string)</li>
  <li><code>ZeroDivisionError</code> — dividing by zero</li>
  <li><code>IndexError</code> — list index out of range</li>
  <li><code>KeyError</code> — dictionary key not found</li>
  <li><code>FileNotFoundError</code> — file doesn't exist</li>
</ul>
<h2>try / except / else / finally</h2>
<pre><code>try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
except (TypeError, ValueError) as e:
    print(f"Type or value error: {e}")
else:
    print("No errors occurred!")
finally:
    print("This always runs")</code></pre>
<h2>Raising Exceptions</h2>
<p>Use <code>raise</code> to throw your own exceptions:</p>
<pre><code>def set_age(age):
    if age < 0:
        raise ValueError(f"Age cannot be negative: {age}")
    return age</code></pre>
<h2>Custom Exceptions</h2>
<pre><code>class InsufficientFundsError(Exception):
    pass</code></pre>
<div class="tip">💡 Don't use bare <code>except:</code> without specifying the exception type — it catches everything including keyboard interrupts and system errors, making debugging very difficult.</div>
`,
      starterCode: `# Error Handling

# Basic try/except
print("=== Basic try/except ===")
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Caught: Cannot divide by zero!")

# Multiple exceptions
print("\\n=== Multiple exceptions ===")
def safe_convert(value):
    try:
        return int(value)
    except ValueError:
        print(f"  Cannot convert '{value}' to int")
        return None
    except TypeError:
        print(f"  Wrong type: {type(value)}")
        return None

print(safe_convert("42"))
print(safe_convert("hello"))
print(safe_convert(None))

# finally block
print("\\n=== finally ===")
try:
    data = [1, 2, 3]
    print(data[10])
except IndexError as e:
    print(f"Caught: {e}")
finally:
    print("Cleanup: this always runs")

# Custom exception
class TooYoungError(Exception):
    pass

def check_age(age):
    if age < 18:
        raise TooYoungError(f"Age {age} is under 18")
    return "Access granted"

try:
    print(check_age(15))
except TooYoungError as e:
    print(f"Caught custom error: {e}")
`,
    },
  ],
}
