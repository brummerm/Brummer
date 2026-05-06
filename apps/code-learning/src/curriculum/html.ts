import type { Language } from './types.ts'

export const html: Language = {
  id: 'html',
  name: 'HTML',
  icon: '🌐',
  color: 'bg-orange-400',
  textColor: 'text-orange-900',
  runtime: 'html',
  description: 'The building blocks of the web. HTML defines the structure and content of every webpage.',
  lessons: [
    {
      id: 'intro',
      title: '1. HTML Structure',
      content: `
<h2>What is HTML?</h2>
<p>HTML (HyperText Markup Language) is the foundation of every webpage. It uses <strong>tags</strong> to describe the structure and meaning of content. Browsers read HTML and render it as a visual page.</p>
<h2>Anatomy of an HTML Tag</h2>
<pre><code>&lt;tagname attribute="value"&gt;Content goes here&lt;/tagname&gt;</code></pre>
<p>Most tags have an opening tag and a closing tag. The content lives between them. Some tags are self-closing: <code>&lt;br /&gt;</code>, <code>&lt;img /&gt;</code>, <code>&lt;input /&gt;</code>.</p>
<h2>The Boilerplate</h2>
<pre><code>&lt;!doctype html&gt;
&lt;html lang="en"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8" /&gt;
    &lt;title&gt;My Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello, World!&lt;/h1&gt;
    &lt;p&gt;This is my first webpage.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
<ul>
  <li><code>&lt;!doctype html&gt;</code> — tells the browser this is HTML5</li>
  <li><code>&lt;html&gt;</code> — root element of the page</li>
  <li><code>&lt;head&gt;</code> — metadata (not visible on page)</li>
  <li><code>&lt;body&gt;</code> — everything visible on the page</li>
</ul>
<div class="tip">💡 The preview panel on the right shows the rendered output of your HTML. Click ▶ Run to see changes!</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>Welcome to HTML. This is a paragraph of text.</p>
    <p>Every webpage starts with this basic structure.</p>
  </body>
</html>`,
    },
    {
      id: 'headings-paragraphs',
      title: '2. Headings & Paragraphs',
      content: `
<h2>Headings</h2>
<p>HTML has six levels of headings, from <code>&lt;h1&gt;</code> (largest/most important) to <code>&lt;h6&gt;</code> (smallest). Use headings to create a logical document hierarchy — not just for visual size.</p>
<pre><code>&lt;h1&gt;Main Title&lt;/h1&gt;
&lt;h2&gt;Section Heading&lt;/h2&gt;
&lt;h3&gt;Subsection&lt;/h3&gt;</code></pre>
<h2>Paragraphs</h2>
<p>The <code>&lt;p&gt;</code> tag wraps a paragraph. Browsers add space above and below automatically.</p>
<h2>Text Formatting</h2>
<ul>
  <li><code>&lt;strong&gt;</code> — <strong>bold/important text</strong></li>
  <li><code>&lt;em&gt;</code> — <em>italic/emphasized text</em></li>
  <li><code>&lt;mark&gt;</code> — highlighted text</li>
  <li><code>&lt;small&gt;</code> — smaller text</li>
  <li><code>&lt;del&gt;</code> — strikethrough (deleted text)</li>
  <li><code>&lt;ins&gt;</code> — underlined (inserted text)</li>
  <li><code>&lt;sub&gt;</code> / <code>&lt;sup&gt;</code> — subscript / superscript</li>
</ul>
<h2>Line Breaks & Horizontal Rules</h2>
<pre><code>&lt;br /&gt;   &lt;!-- single line break --&gt;
&lt;hr /&gt;   &lt;!-- horizontal dividing line --&gt;</code></pre>
<div class="tip">💡 Use only one <code>&lt;h1&gt;</code> per page — it's treated as the main title by search engines and screen readers. Nest headings logically: h1 → h2 → h3, never skipping levels.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Headings & Paragraphs</title>
  </head>
  <body>
    <h1>Welcome to My Blog</h1>
    <h2>About This Site</h2>
    <p>This is a <strong>sample blog</strong> built with <em>pure HTML</em>. No CSS yet!</p>
    <p>Text can be <mark>highlighted</mark>, written in <small>small print</small>, or shown as H<sub>2</sub>O or x<sup>2</sup>.</p>

    <hr />

    <h2>Latest Post</h2>
    <h3>Learning to Code</h3>
    <p>Today I learned about <strong>HTML headings</strong> and paragraphs.</p>
    <p>It was <em>really fun</em>! Tomorrow I'll learn about <del>tables</del> links.</p>
  </body>
</html>`,
    },
    {
      id: 'links-images',
      title: '3. Links & Images',
      content: `
<h2>Anchor Tags (Links)</h2>
<p>The <code>&lt;a&gt;</code> tag creates hyperlinks. The <code>href</code> attribute specifies the destination:</p>
<pre><code>&lt;a href="https://example.com"&gt;Visit Example&lt;/a&gt;
&lt;a href="about.html"&gt;About Page&lt;/a&gt;   &lt;!-- relative link --&gt;
&lt;a href="#section2"&gt;Jump to Section 2&lt;/a&gt;   &lt;!-- anchor --&gt;
&lt;a href="mailto:hi@example.com"&gt;Email Us&lt;/a&gt;</code></pre>
<p>Add <code>target="_blank"</code> to open links in a new tab: <code>&lt;a href="..." target="_blank" rel="noopener"&gt;</code></p>
<h2>Images</h2>
<p>The <code>&lt;img&gt;</code> tag is self-closing. Always include <code>alt</code> for accessibility:</p>
<pre><code>&lt;img src="photo.jpg" alt="A description of the image" /&gt;
&lt;img src="https://example.com/logo.png" alt="Logo" width="200" /&gt;</code></pre>
<h2>Image as a Link</h2>
<pre><code>&lt;a href="https://example.com"&gt;
  &lt;img src="logo.png" alt="Home" /&gt;
&lt;/a&gt;</code></pre>
<div class="tip">💡 Always write meaningful <code>alt</code> text for images — screen readers use it for visually impaired users, and it also appears if the image fails to load. Decorative images can use <code>alt=""</code>.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Links & Images</title>
  </head>
  <body>
    <h1>Links & Images</h1>

    <h2>Links</h2>
    <p>
      Visit <a href="https://www.python.org" target="_blank" rel="noopener">Python.org</a>
      or learn at <a href="https://developer.mozilla.org" target="_blank" rel="noopener">MDN Web Docs</a>.
    </p>
    <p><a href="mailto:hello@example.com">Send us an email</a></p>

    <h2>Images from the Web</h2>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/120px-HTML5_logo_and_wordmark.svg.png"
      alt="HTML5 Logo"
    />

    <h2>Image as a Link</h2>
    <a href="https://developer.mozilla.org" target="_blank" rel="noopener">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/120px-HTML5_logo_and_wordmark.svg.png"
        alt="Click to visit MDN"
        style="border: 2px solid orange; border-radius: 4px;"
      />
    </a>
  </body>
</html>`,
    },
    {
      id: 'lists',
      title: '4. Lists',
      content: `
<h2>Unordered Lists</h2>
<p>Use <code>&lt;ul&gt;</code> for bullet lists. Each item is wrapped in <code>&lt;li&gt;</code>:</p>
<pre><code>&lt;ul&gt;
  &lt;li&gt;Apples&lt;/li&gt;
  &lt;li&gt;Bananas&lt;/li&gt;
  &lt;li&gt;Cherries&lt;/li&gt;
&lt;/ul&gt;</code></pre>
<h2>Ordered Lists</h2>
<p>Use <code>&lt;ol&gt;</code> for numbered lists:</p>
<pre><code>&lt;ol&gt;
  &lt;li&gt;Step one&lt;/li&gt;
  &lt;li&gt;Step two&lt;/li&gt;
  &lt;li&gt;Step three&lt;/li&gt;
&lt;/ol&gt;</code></pre>
<p>You can change the numbering with attributes: <code>type="A"</code> (A, B, C), <code>type="i"</code> (roman numerals), <code>start="5"</code> (start at 5).</p>
<h2>Description Lists</h2>
<p>Use <code>&lt;dl&gt;</code> for term-definition pairs:</p>
<pre><code>&lt;dl&gt;
  &lt;dt&gt;HTML&lt;/dt&gt;
  &lt;dd&gt;HyperText Markup Language&lt;/dd&gt;
  &lt;dt&gt;CSS&lt;/dt&gt;
  &lt;dd&gt;Cascading Style Sheets&lt;/dd&gt;
&lt;/dl&gt;</code></pre>
<h2>Nested Lists</h2>
<p>Lists can be nested inside <code>&lt;li&gt;</code> elements to create sub-items.</p>
<div class="tip">💡 Use lists for navigation menus too — most navbars are built from <code>&lt;ul&gt;</code> lists styled with CSS to display horizontally.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HTML Lists</title>
  </head>
  <body>
    <h1>Shopping & To-Do</h1>

    <h2>Shopping List (unordered)</h2>
    <ul>
      <li>Milk</li>
      <li>Eggs</li>
      <li>Bread
        <ul>
          <li>Sourdough</li>
          <li>Whole wheat</li>
        </ul>
      </li>
      <li>Coffee</li>
    </ul>

    <h2>Recipe Steps (ordered)</h2>
    <ol>
      <li>Gather ingredients</li>
      <li>Preheat oven to 350°F</li>
      <li>Mix wet ingredients</li>
      <li>Fold in dry ingredients</li>
      <li>Bake for 30 minutes</li>
    </ol>

    <h2>Web Glossary (description list)</h2>
    <dl>
      <dt><strong>HTML</strong></dt>
      <dd>HyperText Markup Language — structure of webpages</dd>
      <dt><strong>CSS</strong></dt>
      <dd>Cascading Style Sheets — styling and layout</dd>
      <dt><strong>JavaScript</strong></dt>
      <dd>Programming language for interactive behavior</dd>
    </dl>
  </body>
</html>`,
    },
    {
      id: 'tables',
      title: '5. Tables',
      content: `
<h2>Table Structure</h2>
<p>HTML tables organize data into rows and columns. The key tags are:</p>
<ul>
  <li><code>&lt;table&gt;</code> — the table container</li>
  <li><code>&lt;thead&gt;</code> — header section</li>
  <li><code>&lt;tbody&gt;</code> — body section</li>
  <li><code>&lt;tfoot&gt;</code> — footer section (totals, etc.)</li>
  <li><code>&lt;tr&gt;</code> — table row</li>
  <li><code>&lt;th&gt;</code> — header cell (bold, centered by default)</li>
  <li><code>&lt;td&gt;</code> — data cell</li>
</ul>
<pre><code>&lt;table&gt;
  &lt;thead&gt;
    &lt;tr&gt;
      &lt;th&gt;Name&lt;/th&gt;
      &lt;th&gt;Score&lt;/th&gt;
    &lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;
      &lt;td&gt;Alice&lt;/td&gt;
      &lt;td&gt;95&lt;/td&gt;
    &lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;</code></pre>
<h2>Spanning Cells</h2>
<p>Use <code>colspan</code> to span across columns, <code>rowspan</code> to span rows:</p>
<pre><code>&lt;td colspan="2"&gt;This spans 2 columns&lt;/td&gt;
&lt;td rowspan="3"&gt;This spans 3 rows&lt;/td&gt;</code></pre>
<div class="tip">💡 Tables are for tabular data — schedules, comparisons, statistics. Don't use tables for page layout! That's what CSS Grid and Flexbox are for.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HTML Tables</title>
    <style>
      table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
      th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
      th { background: #4f46e5; color: white; }
      tr:nth-child(even) { background: #f9fafb; }
    </style>
  </head>
  <body>
    <h1>Student Grades</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Math</th>
          <th>English</th>
          <th>Science</th>
          <th>Average</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alice</td>
          <td>95</td>
          <td>88</td>
          <td>92</td>
          <td><strong>91.7</strong></td>
        </tr>
        <tr>
          <td>Bob</td>
          <td>78</td>
          <td>85</td>
          <td>80</td>
          <td><strong>81.0</strong></td>
        </tr>
        <tr>
          <td>Carol</td>
          <td>90</td>
          <td>94</td>
          <td>88</td>
          <td><strong>90.7</strong></td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4"><em>Class Average</em></td>
          <td><strong>87.8</strong></td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>`,
    },
    {
      id: 'forms',
      title: '6. Forms & Inputs',
      content: `
<h2>HTML Forms</h2>
<p>Forms collect user input. The <code>&lt;form&gt;</code> element wraps all inputs. Key attributes:</p>
<ul>
  <li><code>action</code> — where to send the data (URL)</li>
  <li><code>method</code> — how to send it: <code>"get"</code> or <code>"post"</code></li>
</ul>
<h2>Common Input Types</h2>
<pre><code>&lt;input type="text" name="username" placeholder="Enter name" /&gt;
&lt;input type="email" name="email" /&gt;
&lt;input type="password" name="pwd" /&gt;
&lt;input type="number" name="age" min="0" max="120" /&gt;
&lt;input type="checkbox" name="agree" /&gt;
&lt;input type="radio" name="gender" value="m" /&gt;
&lt;input type="date" name="birthday" /&gt;
&lt;input type="submit" value="Submit" /&gt;</code></pre>
<h2>Labels, Textarea & Select</h2>
<pre><code>&lt;label for="name"&gt;Your name:&lt;/label&gt;
&lt;input id="name" type="text" /&gt;

&lt;textarea name="bio" rows="4" cols="40"&gt;&lt;/textarea&gt;

&lt;select name="country"&gt;
  &lt;option value="us"&gt;United States&lt;/option&gt;
  &lt;option value="uk"&gt;United Kingdom&lt;/option&gt;
&lt;/select&gt;</code></pre>
<div class="tip">💡 Always connect <code>&lt;label&gt;</code> to its input using <code>for</code> (on label) and <code>id</code> (on input). This improves accessibility and makes the label clickable.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HTML Forms</title>
    <style>
      body { font-family: sans-serif; max-width: 500px; margin: 20px auto; padding: 0 16px; }
      label { display: block; margin-top: 12px; font-weight: 600; color: #374151; }
      input[type="text"], input[type="email"], textarea, select {
        display: block; width: 100%; padding: 8px; margin-top: 4px;
        border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;
      }
      button { margin-top: 16px; padding: 10px 24px; background: #4f46e5;
               color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
    </style>
  </head>
  <body>
    <h1>Sign Up Form</h1>
    <form action="#" method="post">
      <label for="fname">First Name:</label>
      <input type="text" id="fname" name="fname" placeholder="Alice" required />

      <label for="email">Email:</label>
      <input type="email" id="email" name="email" placeholder="alice@example.com" required />

      <label for="grade">Grade Level:</label>
      <select id="grade" name="grade">
        <option value="9">9th Grade</option>
        <option value="10">10th Grade</option>
        <option value="11">11th Grade</option>
        <option value="12">12th Grade</option>
      </select>

      <label for="bio">About You:</label>
      <textarea id="bio" name="bio" rows="3" placeholder="Tell us about yourself..."></textarea>

      <label>
        <input type="checkbox" name="agree" required />
        I agree to the terms
      </label>

      <button type="submit">Sign Up</button>
    </form>
  </body>
</html>`,
    },
    {
      id: 'div-span',
      title: '7. Div & Span',
      content: `
<h2>Generic Containers</h2>
<p><code>&lt;div&gt;</code> and <code>&lt;span&gt;</code> are generic containers with no inherent meaning. They're used to group elements for styling or scripting purposes.</p>
<h2>&lt;div&gt; — Block Container</h2>
<p>A <code>&lt;div&gt;</code> is a <strong>block-level</strong> element — it starts on a new line and takes up the full available width. Use it to group and layout sections of your page:</p>
<pre><code>&lt;div class="card"&gt;
  &lt;h2&gt;Card Title&lt;/h2&gt;
  &lt;p&gt;Card content goes here.&lt;/p&gt;
&lt;/div&gt;</code></pre>
<h2>&lt;span&gt; — Inline Container</h2>
<p>A <code>&lt;span&gt;</code> is an <strong>inline</strong> element — it flows within text without breaking to a new line. Use it to style a portion of text:</p>
<pre><code>&lt;p&gt;My favorite color is &lt;span style="color: blue"&gt;blue&lt;/span&gt;.&lt;/p&gt;</code></pre>
<h2>When to Use Each</h2>
<table>
  <tr><th>Element</th><th>Display</th><th>Use for</th></tr>
  <tr><td><code>&lt;div&gt;</code></td><td>Block</td><td>Layout sections, cards, containers</td></tr>
  <tr><td><code>&lt;span&gt;</code></td><td>Inline</td><td>Styling part of a sentence</td></tr>
</table>
<div class="tip">💡 Prefer semantic elements (<code>&lt;header&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;article&gt;</code>) over <code>&lt;div&gt;</code> when the element has a clear meaning. Use <code>&lt;div&gt;</code> only when no semantic element fits.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Div & Span</title>
    <style>
      body { font-family: sans-serif; padding: 16px; background: #f9fafb; }
      .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px;
              padding: 20px; margin: 12px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .card h2 { margin: 0 0 8px; color: #1f2937; }
      .badge { background: #ddd6fe; color: #5b21b6; border-radius: 999px;
               padding: 2px 10px; font-size: 12px; font-weight: 600; }
      .highlight { background: #fef3c7; padding: 0 3px; border-radius: 2px; }
    </style>
  </head>
  <body>
    <h1>Profile Cards</h1>

    <div class="card">
      <h2>Alice Johnson <span class="badge">Admin</span></h2>
      <p>Alice is a <span class="highlight">senior developer</span> with 8 years of experience.</p>
      <p>She specializes in <span style="color: #7c3aed; font-weight: 600;">Python</span> and <span style="color: #ea580c; font-weight: 600;">React</span>.</p>
    </div>

    <div class="card">
      <h2>Bob Smith <span class="badge">Student</span></h2>
      <p>Bob is learning <span style="color: #2563eb; font-weight: 600;">HTML</span> and <span style="color: #16a34a; font-weight: 600;">CSS</span> this semester.</p>
      <p>He's made <span class="highlight">great progress</span> so far!</p>
    </div>
  </body>
</html>`,
    },
    {
      id: 'attributes',
      title: '8. HTML Attributes',
      content: `
<h2>What are Attributes?</h2>
<p>Attributes provide extra information about an element. They go inside the opening tag as name-value pairs:</p>
<pre><code>&lt;img src="photo.jpg" alt="My photo" width="300" /&gt;
     ^^^^             ^^^            ^^^^^
     attr             attr           attr</code></pre>
<h2>Global Attributes</h2>
<p>These attributes can be used on <em>any</em> HTML element:</p>
<ul>
  <li><code>id</code> — unique identifier (one per page)</li>
  <li><code>class</code> — CSS class name(s) for styling</li>
  <li><code>style</code> — inline CSS styles</li>
  <li><code>title</code> — tooltip on hover</li>
  <li><code>hidden</code> — hide the element</li>
  <li><code>data-*</code> — custom data attributes (e.g., <code>data-id="42"</code>)</li>
  <li><code>tabindex</code> — keyboard navigation order</li>
</ul>
<h2>id vs class</h2>
<pre><code>&lt;!-- id: unique, used for one specific element --&gt;
&lt;div id="main-header"&gt;...&lt;/div&gt;

&lt;!-- class: reusable, used on multiple elements --&gt;
&lt;div class="card featured"&gt;...&lt;/div&gt;
&lt;div class="card"&gt;...&lt;/div&gt;</code></pre>
<div class="tip">💡 <code>id</code> must be unique on the page — think of it as a passport number. <code>class</code> is like a job title — many people can share the same class. You can assign multiple classes: <code>class="card large featured"</code>.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HTML Attributes</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      .box { padding: 12px; margin: 8px 0; border-radius: 8px; }
      .primary { background: #ddd6fe; border: 1px solid #8b5cf6; }
      .success { background: #dcfce7; border: 1px solid #16a34a; }
      .warning { background: #fef3c7; border: 1px solid #f59e0b; }
      #hero { background: #1e1b4b; color: white; padding: 20px; border-radius: 12px; }
    </style>
  </head>
  <body>
    <div id="hero">
      <h1>HTML Attributes Demo</h1>
      <p>Every element above has attributes controlling it.</p>
    </div>

    <div class="box primary" title="This is a primary box (hover to see)">
      <strong>class="box primary"</strong> — Two CSS classes applied
    </div>

    <div class="box success" data-color="green" data-priority="1">
      <strong>data-* attributes</strong> — Custom data for JavaScript
    </div>

    <div class="box warning">
      <strong>Inline style:</strong>
      <span style="color: #b45309; font-weight: bold; font-size: 1.1em;">styled with the style attribute</span>
    </div>

    <p>
      <a href="https://developer.mozilla.org" target="_blank" rel="noopener" title="Opens in new tab">
        MDN Web Docs (opens in new tab)
      </a>
    </p>
  </body>
</html>`,
    },
    {
      id: 'semantic',
      title: '9. Semantic HTML',
      content: `
<h2>What is Semantic HTML?</h2>
<p>Semantic HTML uses elements that describe their <em>meaning</em> rather than just their appearance. This benefits:</p>
<ul>
  <li><strong>Accessibility</strong> — screen readers understand the page structure</li>
  <li><strong>SEO</strong> — search engines better understand your content</li>
  <li><strong>Maintainability</strong> — easier for developers to read and update</li>
</ul>
<h2>Key Semantic Elements</h2>
<ul>
  <li><code>&lt;header&gt;</code> — site or section header (logo, nav)</li>
  <li><code>&lt;nav&gt;</code> — navigation links</li>
  <li><code>&lt;main&gt;</code> — main content of the page (one per page)</li>
  <li><code>&lt;article&gt;</code> — self-contained content (blog post, news story)</li>
  <li><code>&lt;section&gt;</code> — thematic grouping of content</li>
  <li><code>&lt;aside&gt;</code> — sidebar or supplemental content</li>
  <li><code>&lt;footer&gt;</code> — site or section footer</li>
  <li><code>&lt;figure&gt;</code> / <code>&lt;figcaption&gt;</code> — image with caption</li>
  <li><code>&lt;time&gt;</code> — dates and times</li>
</ul>
<pre><code>&lt;!-- Non-semantic (avoid) --&gt;
&lt;div id="header"&gt;...&lt;/div&gt;
&lt;div id="nav"&gt;...&lt;/div&gt;

&lt;!-- Semantic (preferred) --&gt;
&lt;header&gt;...&lt;/header&gt;
&lt;nav&gt;...&lt;/nav&gt;</code></pre>
<div class="tip">💡 A good rule of thumb: ask "What is this content?" If it's the main navigation, use <code>&lt;nav&gt;</code>. If it's a blog post, use <code>&lt;article&gt;</code>. If it's a sidebar, use <code>&lt;aside&gt;</code>.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Semantic HTML</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: sans-serif; margin: 0; background: #f9fafb; }
      header { background: #1e1b4b; color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
      nav a { color: #c4b5fd; text-decoration: none; margin-left: 16px; }
      nav a:hover { color: white; }
      main { max-width: 800px; margin: 24px auto; padding: 0 16px; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
      article { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      aside { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      footer { background: #1f2937; color: #9ca3af; text-align: center; padding: 16px; margin-top: 24px; font-size: 14px; }
    </style>
  </head>
  <body>
    <header>
      <h1>Code Blog</h1>
      <nav>
        <a href="#">Home</a>
        <a href="#">Articles</a>
        <a href="#">About</a>
      </nav>
    </header>

    <main>
      <article>
        <h2>Why Semantic HTML Matters</h2>
        <p>Published <time datetime="2025-05-01">May 1, 2025</time></p>
        <p>Semantic HTML makes your pages more accessible, SEO-friendly, and maintainable.</p>
        <section>
          <h3>Key Benefits</h3>
          <p>Screen readers, search engines, and fellow developers all benefit from meaningful markup.</p>
        </section>
      </article>

      <aside>
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#">MDN Docs</a></li>
          <li><a href="#">W3Schools</a></li>
          <li><a href="#">Can I Use</a></li>
        </ul>
      </aside>
    </main>

    <footer>
      <p>&copy; 2025 Code Blog. Built with semantic HTML.</p>
    </footer>
  </body>
</html>`,
    },
    {
      id: 'media',
      title: '10. Iframes & Media',
      content: `
<h2>Iframes</h2>
<p>An <code>&lt;iframe&gt;</code> embeds another webpage inside your page. Commonly used for YouTube videos, Google Maps, or widgets:</p>
<pre><code>&lt;iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  width="560"
  height="315"
  allowfullscreen
  title="Video title"
&gt;&lt;/iframe&gt;</code></pre>
<h2>HTML5 Audio</h2>
<pre><code>&lt;audio controls&gt;
  &lt;source src="audio.mp3" type="audio/mpeg" /&gt;
  &lt;source src="audio.ogg" type="audio/ogg" /&gt;
  Your browser does not support audio.
&lt;/audio&gt;</code></pre>
<h2>HTML5 Video</h2>
<pre><code>&lt;video controls width="640" poster="thumbnail.jpg"&gt;
  &lt;source src="movie.mp4" type="video/mp4" /&gt;
  &lt;source src="movie.webm" type="video/webm" /&gt;
  Your browser does not support video.
&lt;/video&gt;</code></pre>
<h2>Responsive Embeds</h2>
<p>Wrap iframes in a container div and use CSS to make them responsive:</p>
<pre><code>.video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; }
.video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</code></pre>
<div class="tip">💡 Always add <code>title</code> to iframes for accessibility. Be cautious embedding third-party content — only embed from trusted sources, and check their embedding terms.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Iframes & Media</title>
    <style>
      body { font-family: sans-serif; padding: 20px; max-width: 700px; margin: 0 auto; }
      .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin: 12px 0; }
      .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
      figure { margin: 0 0 20px; }
      figcaption { font-size: 13px; color: #6b7280; margin-top: 6px; font-style: italic; }
    </style>
  </head>
  <body>
    <h1>Media Elements</h1>

    <h2>Embedded YouTube Video</h2>
    <figure>
      <div class="video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Sample YouTube Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowfullscreen
        ></iframe>
      </div>
      <figcaption>Responsive embedded video using a wrapper div</figcaption>
    </figure>

    <h2>Embedded Map</h2>
    <figure>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-74.02%2C40.69%2C-73.97%2C40.73&layer=mapnik"
        width="100%"
        height="300"
        style="border: 1px solid #ccc; border-radius: 8px;"
        title="Brooklyn, New York Map"
      ></iframe>
      <figcaption>Brooklyn, NY — OpenStreetMap embed</figcaption>
    </figure>
  </body>
</html>`,
    },
    {
      id: 'entities',
      title: '11. HTML Entities',
      content: `
<h2>What are HTML Entities?</h2>
<p>Some characters have special meaning in HTML (like <code>&lt;</code> and <code>&gt;</code>). To display them literally, use <strong>HTML entities</strong> — special codes that start with <code>&amp;</code> and end with <code>;</code>.</p>
<h2>Common Entities</h2>
<table>
  <tr><th>Character</th><th>Entity</th><th>Description</th></tr>
  <tr><td>&lt;</td><td><code>&amp;lt;</code></td><td>Less-than sign</td></tr>
  <tr><td>&gt;</td><td><code>&amp;gt;</code></td><td>Greater-than sign</td></tr>
  <tr><td>&amp;</td><td><code>&amp;amp;</code></td><td>Ampersand</td></tr>
  <tr><td>&quot;</td><td><code>&amp;quot;</code></td><td>Double quote</td></tr>
  <tr><td>&apos;</td><td><code>&amp;apos;</code></td><td>Apostrophe</td></tr>
  <tr><td>&nbsp;</td><td><code>&amp;nbsp;</code></td><td>Non-breaking space</td></tr>
  <tr><td>&copy;</td><td><code>&amp;copy;</code></td><td>Copyright sign</td></tr>
  <tr><td>&reg;</td><td><code>&amp;reg;</code></td><td>Registered trademark</td></tr>
  <tr><td>&trade;</td><td><code>&amp;trade;</code></td><td>Trademark symbol</td></tr>
  <tr><td>&mdash;</td><td><code>&amp;mdash;</code></td><td>Em dash —</td></tr>
  <tr><td>&rarr;</td><td><code>&amp;rarr;</code></td><td>Right arrow →</td></tr>
  <tr><td>&hearts;</td><td><code>&amp;hearts;</code></td><td>Heart ♥</td></tr>
</table>
<h2>Numeric Entities</h2>
<p>You can also use numeric codes: <code>&amp;#169;</code> = &copy; or in hex: <code>&amp;#xA9;</code> = &copy;</p>
<div class="tip">💡 The non-breaking space (<code>&amp;nbsp;</code>) prevents line breaks between two words. Use it sparingly — prefer CSS margin/padding for spacing elements.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HTML Entities</title>
    <style>
      body { font-family: sans-serif; padding: 20px; line-height: 1.7; }
      code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; color: #7c3aed; }
      .entity-demo { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 16px; border-radius: 8px; margin: 8px 0; }
    </style>
  </head>
  <body>
    <h1>HTML Entities in Action</h1>

    <div class="entity-demo">
      <p>Math: 5 &lt; 10 and 10 &gt; 5 and a &amp; b</p>
      <p>Quote: &quot;To be or not to be&quot; &mdash; Shakespeare</p>
    </div>

    <div class="entity-demo">
      <p>&copy; 2025 Code Lab&trade; &bull; All rights reserved</p>
      <p>Arrows: &larr; &uarr; &darr; &rarr; &harr; &varr;</p>
      <p>Symbols: &hearts; &diams; &clubs; &spades;</p>
    </div>

    <div class="entity-demo">
      <p>Displaying HTML code: <code>&lt;p&gt;Hello&lt;/p&gt;</code></p>
      <p>Price: 5&nbsp;&times;&nbsp;$10&nbsp;=&nbsp;$50</p>
    </div>

    <h2>Currency & Math</h2>
    <p>&euro;99 &bull; &pound;85 &bull; &yen;1200 &bull; &dollar;100</p>
    <p>x&sup2; + y&sup2; = z&sup2; (Pythagorean theorem)</p>
    <p>H&sub2;O is water. CO&sub2; is carbon dioxide.</p>
  </body>
</html>`,
    },
    {
      id: 'best-practices',
      title: '12. HTML Best Practices',
      content: `
<h2>Write Clean, Valid HTML</h2>
<ul>
  <li>Always include <code>&lt;!doctype html&gt;</code> at the very top</li>
  <li>Set <code>lang</code> on the <code>&lt;html&gt;</code> tag: <code>&lt;html lang="en"&gt;</code></li>
  <li>Include a <code>&lt;meta charset="UTF-8"&gt;</code> in <code>&lt;head&gt;</code></li>
  <li>Always include a descriptive <code>&lt;title&gt;</code></li>
  <li>Validate your HTML at <a href="https://validator.w3.org" target="_blank" rel="noopener">validator.w3.org</a></li>
</ul>
<h2>Accessibility (a11y)</h2>
<ul>
  <li>Use semantic elements (<code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, etc.)</li>
  <li>Every <code>&lt;img&gt;</code> needs an <code>alt</code> attribute</li>
  <li>Every <code>&lt;iframe&gt;</code> needs a <code>title</code></li>
  <li>Form inputs should have associated <code>&lt;label&gt;</code> elements</li>
  <li>Color should not be the only way to convey information</li>
</ul>
<h2>Performance Tips</h2>
<ul>
  <li>Put <code>&lt;script&gt;</code> tags at the bottom of <code>&lt;body&gt;</code> (or use <code>defer</code>)</li>
  <li>Compress and resize images before using them</li>
  <li>Use modern formats: WebP for images, WOFF2 for fonts</li>
</ul>
<h2>Naming Conventions</h2>
<ul>
  <li>Use lowercase for all element names and attribute names</li>
  <li>File names: lowercase with hyphens (<code>my-page.html</code>, not <code>MyPage.HTML</code>)</li>
  <li>CSS class names: lowercase with hyphens (<code>nav-bar</code>, not <code>navBar</code>)</li>
</ul>
<div class="tip">💡 The best HTML is invisible — it doesn't get in the way, it just structures the content clearly so CSS and JavaScript can do their jobs effectively.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A well-structured HTML page demonstrating best practices." />
    <title>Best Practices Demo | Code Lab</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>

    <main>
      <article>
        <h1>HTML Best Practices</h1>
        <p>This page follows web standards and accessibility guidelines.</p>

        <section aria-labelledby="tips-heading">
          <h2 id="tips-heading">Key Tips</h2>
          <ul>
            <li>Use semantic HTML elements</li>
            <li>Write accessible markup</li>
            <li>Keep your code clean and indented</li>
            <li>Validate your HTML regularly</li>
          </ul>
        </section>

        <figure>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/120px-HTML5_logo_and_wordmark.svg.png"
            alt="HTML5 logo — orange shield with white H5 text"
            width="120"
          />
          <figcaption>HTML5 — the current standard for web markup</figcaption>
        </figure>
      </article>
    </main>

    <footer>
      <p><small>&copy; 2025 Code Lab. All rights reserved.</small></p>
    </footer>

    <script src="app.js" defer></script>
  </body>
</html>`,
    },
  ],
}
