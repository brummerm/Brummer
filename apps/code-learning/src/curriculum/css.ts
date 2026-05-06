import type { Language } from './types.ts'

export const css: Language = {
  id: 'css',
  name: 'CSS',
  icon: '🎨',
  color: 'bg-blue-400',
  textColor: 'text-blue-900',
  runtime: 'html',
  description: 'Style the web. CSS controls colors, layouts, animations, and the overall look of your pages.',
  lessons: [
    {
      id: 'intro',
      title: '1. Introduction & Selectors',
      content: `
<h2>What is CSS?</h2>
<p>CSS (Cascading Style Sheets) controls how HTML elements look. It separates content (HTML) from presentation (CSS), making your code more maintainable.</p>
<h2>Three Ways to Add CSS</h2>
<ul>
  <li><strong>Inline</strong>: <code>&lt;p style="color: red;"&gt;</code> — highest specificity, avoid overusing</li>
  <li><strong>Internal</strong>: <code>&lt;style&gt;</code> tag in the <code>&lt;head&gt;</code></li>
  <li><strong>External</strong>: <code>&lt;link rel="stylesheet" href="style.css" /&gt;</code> — best practice</li>
</ul>
<h2>Selectors</h2>
<pre><code>/* Element selector */
p { color: blue; }

/* Class selector */
.card { background: white; }

/* ID selector */
#header { font-size: 2rem; }

/* Descendant selector */
.card p { margin: 0; }

/* Multiple selectors */
h1, h2, h3 { font-family: serif; }

/* Pseudo-class */
a:hover { color: red; }</code></pre>
<h2>CSS Rule Anatomy</h2>
<pre><code>selector {
  property: value;   /* declaration */
}</code></pre>
<div class="tip">💡 CSS stands for "Cascading" because styles cascade down — later rules override earlier ones, and more specific selectors override less specific ones.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CSS Selectors</title>
    <style>
      /* Element selector */
      body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #f0f4f8; }
      h1 { color: #1e1b4b; }

      /* Class selector */
      .card { background: white; border-radius: 12px; padding: 20px; margin: 12px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

      /* ID selector */
      #featured { border-left: 4px solid #7c3aed; }

      /* Multiple selectors */
      h2, h3 { color: #374151; }

      /* Descendant */
      .card p { color: #6b7280; line-height: 1.6; }

      /* Pseudo-class */
      .card:hover { transform: translateY(-2px); transition: transform 0.2s; }
    </style>
  </head>
  <body>
    <h1>CSS Selectors Demo</h1>

    <div class="card" id="featured">
      <h2>Featured Card (has an ID)</h2>
      <p>This card has a purple left border because it's selected by <code>#featured</code>.</p>
    </div>

    <div class="card">
      <h2>Regular Card</h2>
      <p>This card uses only the <code>.card</code> class selector. Hover over me!</p>
    </div>

    <div class="card">
      <h3>Third Card (h3 heading)</h3>
      <p>Multiple selectors: <code>h2, h3</code> both get the same color.</p>
    </div>
  </body>
</html>`,
    },
    {
      id: 'colors',
      title: '2. Colors & Backgrounds',
      content: `
<h2>Color Values in CSS</h2>
<p>CSS supports multiple ways to specify colors:</p>
<table>
  <tr><th>Format</th><th>Example</th><th>Notes</th></tr>
  <tr><td>Named</td><td><code>red</code>, <code>coral</code></td><td>147 built-in names</td></tr>
  <tr><td>Hex</td><td><code>#ff6347</code></td><td>Red, Green, Blue in hex (00–FF)</td></tr>
  <tr><td>RGB</td><td><code>rgb(255, 99, 71)</code></td><td>Each channel 0–255</td></tr>
  <tr><td>RGBA</td><td><code>rgba(255, 99, 71, 0.5)</code></td><td>Alpha = transparency (0–1)</td></tr>
  <tr><td>HSL</td><td><code>hsl(9, 100%, 64%)</code></td><td>Hue, Saturation, Lightness</td></tr>
</table>
<h2>Background Properties</h2>
<pre><code>/* Solid color */
background-color: #4f46e5;

/* Image */
background-image: url('photo.jpg');
background-size: cover;        /* or contain */
background-position: center;
background-repeat: no-repeat;

/* Gradient */
background: linear-gradient(135deg, #667eea, #764ba2);
background: radial-gradient(circle, #f093fb, #f5576c);</code></pre>
<div class="tip">💡 The <code>background</code> shorthand can set all background properties at once. Use HSL colors for easier theming — adjusting just the hue gives you a whole new color family.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Colors & Backgrounds</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      .box { height: 80px; border-radius: 10px; margin: 10px 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }

      .named    { background-color: tomato; }
      .hex      { background-color: #4f46e5; }
      .rgb      { background-color: rgb(16, 185, 129); }
      .rgba     { background-color: rgba(245, 158, 11, 0.85); color: #1c1917; }
      .hsl      { background-color: hsl(280, 80%, 50%); }
      .gradient { background: linear-gradient(135deg, #667eea, #764ba2); }
      .radial   { background: radial-gradient(circle at 30%, #f093fb, #f5576c); }
      .pattern  {
        background-image:
          linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%);
        background-color: #4f46e5;
        background-size: 20px 20px;
      }
    </style>
  </head>
  <body>
    <h1>Color & Background Demos</h1>
    <div class="box named">Named: tomato</div>
    <div class="box hex">Hex: #4f46e5</div>
    <div class="box rgb">RGB: rgb(16, 185, 129)</div>
    <div class="box rgba">RGBA: rgba(245, 158, 11, 0.85)</div>
    <div class="box hsl">HSL: hsl(280, 80%, 50%)</div>
    <div class="box gradient">Linear Gradient</div>
    <div class="box radial">Radial Gradient</div>
    <div class="box pattern">CSS Pattern</div>
  </body>
</html>`,
    },
    {
      id: 'box-model',
      title: '3. The Box Model',
      content: `
<h2>Every Element is a Box</h2>
<p>In CSS, every element is a rectangular box made up of four layers (from inside out):</p>
<ol>
  <li><strong>Content</strong> — the actual text or image</li>
  <li><strong>Padding</strong> — space between content and border</li>
  <li><strong>Border</strong> — the border around the padding</li>
  <li><strong>Margin</strong> — space outside the border (pushes other elements away)</li>
</ol>
<pre><code>.box {
  width: 200px;
  padding: 20px;           /* all sides */
  padding: 10px 20px;      /* top/bottom left/right */
  border: 2px solid black;
  margin: 16px;
}</code></pre>
<h2>box-sizing: border-box</h2>
<p>By default, width/height only count the content. With <code>border-box</code>, padding and border are included in the stated size — much more intuitive:</p>
<pre><code>*, *::before, *::after {
  box-sizing: border-box;
}</code></pre>
<h2>Margin Collapse</h2>
<p>Vertical margins between block elements collapse — only the larger margin applies.</p>
<div class="tip">💡 Always add <code>box-sizing: border-box</code> to your CSS reset. It prevents a lot of confusion when sizing elements, especially with padding and borders.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CSS Box Model</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: sans-serif; padding: 20px; background: #f9fafb; }

      .outer {
        background: #fde68a;
        padding: 24px;
        margin: 16px 0;
        border-radius: 8px;
      }

      .middle {
        background: #a7f3d0;
        padding: 20px;
        border: 3px dashed #059669;
        border-radius: 6px;
      }

      .inner {
        background: #bfdbfe;
        padding: 16px;
        border: 2px solid #2563eb;
        border-radius: 4px;
        text-align: center;
      }

      .demo-box {
        width: 250px;
        padding: 20px;
        border: 4px solid #7c3aed;
        margin: 20px auto;
        background: #ede9fe;
        text-align: center;
        border-radius: 8px;
      }

      .shorthand {
        margin: 10px 20px 30px 40px; /* top right bottom left */
        padding: 8px 16px;           /* vertical horizontal */
        border-top: 2px solid red;
        border-right: 3px dashed blue;
        border-bottom: 4px dotted green;
        border-left: 5px solid orange;
        background: white;
      }
    </style>
  </head>
  <body>
    <h1>The CSS Box Model</h1>

    <div class="outer">
      Margin / Outer box
      <div class="middle">
        Padding area
        <div class="inner">Content Box</div>
      </div>
    </div>

    <div class="demo-box">
      width: 250px<br/>
      padding: 20px<br/>
      border: 4px solid
    </div>

    <div class="shorthand">
      <p>Different border on each side<br/>Different margin/padding shorthand</p>
    </div>
  </body>
</html>`,
    },
    {
      id: 'typography',
      title: '4. Typography & Text',
      content: `
<h2>Font Properties</h2>
<pre><code>p {
  font-family: 'Georgia', serif;  /* font stack */
  font-size: 16px;                /* or 1rem, 1.2em */
  font-weight: 700;               /* or bold, normal */
  font-style: italic;
  line-height: 1.6;               /* unitless preferred */
  letter-spacing: 0.05em;
}</code></pre>
<h2>Web Fonts</h2>
<p>Load Google Fonts in your <code>&lt;head&gt;</code>:</p>
<pre><code>&lt;link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"&gt;</code></pre>
<h2>Text Alignment & Decoration</h2>
<pre><code>text-align: left | center | right | justify;
text-decoration: underline | none | line-through;
text-transform: uppercase | lowercase | capitalize;
text-shadow: 2px 2px 4px rgba(0,0,0,0.3);</code></pre>
<h2>Units: px, em, rem</h2>
<ul>
  <li><code>px</code> — absolute pixels (fixed size)</li>
  <li><code>em</code> — relative to parent font size</li>
  <li><code>rem</code> — relative to root font size (usually 16px) — most consistent choice</li>
</ul>
<div class="tip">💡 Use <code>rem</code> for font sizes and spacing — it respects the user's browser font size preferences. Set a base size on <code>html</code> or <code>:root</code> and scale everything from there.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Typography</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;700&family=Fira+Code&display=swap" rel="stylesheet" />
    <style>
      :root { font-size: 16px; }
      body { font-family: 'Inter', sans-serif; padding: 24px; max-width: 640px; margin: 0 auto; background: #fafafa; }

      h1 { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: #1e1b4b; line-height: 1.2; letter-spacing: -0.02em; }
      h2 { font-size: 1.25rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 1.5rem; }

      .lead { font-size: 1.125rem; color: #6b7280; line-height: 1.7; }

      .highlight { background: linear-gradient(180deg, transparent 60%, #fef08a 60%); }
      .strikethrough { text-decoration: line-through; color: #9ca3af; }
      .caps { text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.75rem; font-weight: 600; }

      code { font-family: 'Fira Code', monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.875rem; }

      .shadow { text-shadow: 2px 2px 8px rgba(124, 58, 237, 0.4); color: #7c3aed; font-size: 2rem; font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>Typography Matters</h1>
    <p class="lead">Good typography makes your content <span class="highlight">easy to read</span> and visually appealing.</p>

    <h2>Text Styles</h2>
    <p>Regular text — the baseline of all typography.</p>
    <p><strong>Bold text</strong> for emphasis. <em>Italic</em> for titles or stress.</p>
    <p><span class="strikethrough">Old price: $99</span> → New price: <strong>$49</strong></p>
    <p class="caps">Small caps label</p>
    <p>Inline <code>code snippet</code> looks great with a monospace font.</p>

    <h2>Text Shadow</h2>
    <p class="shadow">Glowing Text Effect</p>
  </body>
</html>`,
    },
    {
      id: 'display',
      title: '5. Display & Visibility',
      content: `
<h2>The display Property</h2>
<p>The <code>display</code> property controls how an element is rendered in the flow:</p>
<table>
  <tr><th>Value</th><th>Behavior</th></tr>
  <tr><td><code>block</code></td><td>Starts on new line, full width (div, p, h1–h6)</td></tr>
  <tr><td><code>inline</code></td><td>Flows in text, width = content (span, a, strong)</td></tr>
  <tr><td><code>inline-block</code></td><td>Inline flow but can have width/height/padding</td></tr>
  <tr><td><code>none</code></td><td>Completely removed from layout</td></tr>
  <tr><td><code>flex</code></td><td>Flexbox container</td></tr>
  <tr><td><code>grid</code></td><td>CSS Grid container</td></tr>
</table>
<h2>visibility vs display</h2>
<pre><code>display: none;        /* hidden AND removed from layout */
visibility: hidden;   /* hidden BUT space is preserved */
opacity: 0;           /* invisible but still takes space and receives clicks */</code></pre>
<h2>overflow</h2>
<pre><code>overflow: visible;   /* default — content spills out */
overflow: hidden;    /* clips content */
overflow: scroll;    /* always shows scrollbars */
overflow: auto;      /* scrollbars only when needed */</code></pre>
<div class="tip">💡 Use <code>display: none</code> to hide elements from the page completely (including from screen readers). Use <code>visibility: hidden</code> when you want to hide content but keep its space reserved in the layout.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Display & Visibility</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }

      .block-box { display: block; background: #ddd6fe; padding: 12px; margin: 8px 0; border-radius: 6px; }
      .inline-box { display: inline; background: #fde68a; padding: 4px 8px; border-radius: 4px; }
      .inline-block-box { display: inline-block; background: #bbf7d0; padding: 12px 20px; border-radius: 6px; margin: 4px; width: 120px; text-align: center; }

      .hidden-none { display: none; }
      .hidden-visibility { visibility: hidden; background: #fecaca; padding: 12px; }
      .hidden-opacity { opacity: 0.15; background: #bfdbfe; padding: 12px; border-radius: 6px; }

      .overflow-demo { width: 200px; height: 80px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; overflow: auto; padding: 8px; font-size: 13px; }
    </style>
  </head>
  <body>
    <h1>Display Property</h1>

    <div class="block-box">Block — full width, new line</div>
    <div class="block-box">Another block element</div>

    <p>These are <span class="inline-box">inline</span> and <span class="inline-box">flow</span> with text.</p>

    <div>
      <span class="inline-block-box">Card 1</span>
      <span class="inline-block-box">Card 2</span>
      <span class="inline-block-box">Card 3</span>
    </div>

    <h2>Visibility Comparison</h2>
    <p>Element with display:none — <span class="hidden-none">you can't see me</span> — gap disappears.</p>
    <p>visibility:hidden keeps space:</p>
    <div class="hidden-visibility">This reserves space but is invisible</div>
    <p>opacity: 0.15 fades but preserves layout:</p>
    <div class="hidden-opacity">Almost transparent</div>

    <h2>Overflow</h2>
    <div class="overflow-demo">
      This container has a fixed height and overflow:auto. When content is too long, it scrolls instead of overflowing. Lorem ipsum dolor sit amet, more text here to trigger scrolling behavior.
    </div>
  </body>
</html>`,
    },
    {
      id: 'flexbox',
      title: '6. Flexbox',
      content: `
<h2>What is Flexbox?</h2>
<p>Flexbox (Flexible Box Layout) makes it easy to lay out items in one direction — row or column. The parent is the <strong>flex container</strong>; children are <strong>flex items</strong>.</p>
<pre><code>.container {
  display: flex;
  flex-direction: row;           /* row | column | row-reverse */
  justify-content: center;       /* align on main axis */
  align-items: center;           /* align on cross axis */
  gap: 16px;                     /* space between items */
  flex-wrap: wrap;               /* allow items to wrap */
}</code></pre>
<h2>justify-content Values</h2>
<ul>
  <li><code>flex-start</code> — items at start (default)</li>
  <li><code>flex-end</code> — items at end</li>
  <li><code>center</code> — items centered</li>
  <li><code>space-between</code> — equal gaps between items</li>
  <li><code>space-around</code> — equal space around items</li>
  <li><code>space-evenly</code> — equal space everywhere</li>
</ul>
<h2>Flex Item Properties</h2>
<pre><code>.item {
  flex: 1;          /* shorthand for grow/shrink/basis */
  flex-grow: 1;     /* take up remaining space */
  flex-shrink: 0;   /* don't shrink */
  align-self: end;  /* override align-items for this item */
}</code></pre>
<div class="tip">💡 Flexbox is perfect for one-dimensional layouts (navbar, card row, centering). For two-dimensional layouts (full page grids), use CSS Grid. Both can be combined!</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Flexbox</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: sans-serif; padding: 20px; background: #f8fafc; }
      h2 { color: #374151; font-size: 1rem; margin-top: 1.5rem; }

      .flex-container {
        display: flex;
        background: #e0e7ff;
        border-radius: 8px;
        padding: 12px;
        gap: 10px;
        margin: 8px 0;
      }
      .flex-item {
        background: #7c3aed;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
      }
      .centered { justify-content: center; }
      .space-between { justify-content: space-between; }
      .flex-end { justify-content: flex-end; }
      .wrap { flex-wrap: wrap; }
      .column { flex-direction: column; align-items: flex-start; }
      .grow .flex-item:nth-child(2) { flex: 1; background: #5b21b6; }

      /* Navbar demo */
      nav { display: flex; justify-content: space-between; align-items: center;
            background: #1e1b4b; color: white; padding: 12px 20px; border-radius: 8px; margin-top: 16px; }
      .nav-links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
      .nav-links a { color: #c4b5fd; text-decoration: none; font-size: 14px; }
    </style>
  </head>
  <body>
    <h1>Flexbox Demos</h1>

    <h2>flex-start (default)</h2>
    <div class="flex-container"><div class="flex-item">A</div><div class="flex-item">B</div><div class="flex-item">C</div></div>

    <h2>justify-content: center</h2>
    <div class="flex-container centered"><div class="flex-item">A</div><div class="flex-item">B</div><div class="flex-item">C</div></div>

    <h2>justify-content: space-between</h2>
    <div class="flex-container space-between"><div class="flex-item">A</div><div class="flex-item">B</div><div class="flex-item">C</div></div>

    <h2>flex: 1 — item grows to fill</h2>
    <div class="flex-container grow"><div class="flex-item">Fixed</div><div class="flex-item">Grows →</div><div class="flex-item">Fixed</div></div>

    <h2>Practical: Navbar with Flexbox</h2>
    <nav>
      <strong>Code Lab</strong>
      <ul class="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Lessons</a></li>
        <li><a href="#">About</a></li>
      </ul>
    </nav>
  </body>
</html>`,
    },
    {
      id: 'grid',
      title: '7. CSS Grid',
      content: `
<h2>What is CSS Grid?</h2>
<p>CSS Grid is a two-dimensional layout system — it can handle both rows <em>and</em> columns simultaneously. It's perfect for page layouts.</p>
<pre><code>.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 3 equal columns */
  grid-template-columns: repeat(3, 1fr); /* same, shorter */
  grid-template-columns: 200px 1fr 2fr;  /* mixed */
  gap: 16px;                              /* gutter */
}</code></pre>
<h2>The fr Unit</h2>
<p>The <code>fr</code> unit represents a fraction of the available space. <code>1fr 2fr</code> means the second column gets twice the space of the first.</p>
<h2>Placing Items</h2>
<pre><code>.item {
  grid-column: 1 / 3;   /* span columns 1 to 3 */
  grid-row: 2 / 4;      /* span rows 2 to 4 */
  grid-column: span 2;  /* span 2 columns from current position */
}</code></pre>
<h2>Named Template Areas</h2>
<pre><code>.layout {
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
}
header { grid-area: header; }
aside  { grid-area: sidebar; }</code></pre>
<div class="tip">💡 Use Flexbox for components (navigation, card rows) and Grid for page-level layouts. They work perfectly together — you can have a Grid layout that contains Flex components.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CSS Grid</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: sans-serif; padding: 20px; background: #f8fafc; }

      /* Basic grid */
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0; }
      .cell { background: #7c3aed; color: white; padding: 20px; border-radius: 8px; text-align: center; font-weight: 600; }
      .cell.span2 { grid-column: span 2; background: #5b21b6; }

      /* Page layout with template areas */
      .page {
        display: grid;
        grid-template-areas:
          "header header header"
          "sidebar main    main"
          "footer  footer  footer";
        grid-template-columns: 180px 1fr 1fr;
        grid-template-rows: auto 1fr auto;
        gap: 12px;
        margin-top: 20px;
        min-height: 300px;
      }
      .page > * { padding: 16px; border-radius: 8px; font-size: 14px; }
      .page header  { grid-area: header; background: #1e1b4b; color: white; }
      .page aside   { grid-area: sidebar; background: #ddd6fe; }
      .page main    { grid-area: main; background: white; border: 1px solid #e5e7eb; }
      .page footer  { grid-area: footer; background: #374151; color: white; text-align: center; }
    </style>
  </head>
  <body>
    <h1>CSS Grid Demos</h1>

    <h2>3-Column Grid with Span</h2>
    <div class="grid-3">
      <div class="cell">1</div>
      <div class="cell">2</div>
      <div class="cell">3</div>
      <div class="cell span2">4 (spans 2 columns)</div>
      <div class="cell">5</div>
    </div>

    <h2>Page Layout with grid-template-areas</h2>
    <div class="page">
      <header><strong>Header</strong> — spans all 3 columns</header>
      <aside><strong>Sidebar</strong><br/>Navigation links here</aside>
      <main><strong>Main Content</strong><br/>This spans 2 columns. Articles, posts, etc.</main>
      <footer>Footer — spans all columns &copy; 2025</footer>
    </div>
  </body>
</html>`,
    },
    {
      id: 'positioning',
      title: '8. Positioning',
      content: `
<h2>CSS Position Values</h2>
<table>
  <tr><th>Value</th><th>Behavior</th></tr>
  <tr><td><code>static</code></td><td>Default. Element in normal document flow</td></tr>
  <tr><td><code>relative</code></td><td>Offset from normal position; still in flow</td></tr>
  <tr><td><code>absolute</code></td><td>Removed from flow; positioned relative to nearest positioned ancestor</td></tr>
  <tr><td><code>fixed</code></td><td>Removed from flow; positioned relative to viewport (stays on screen)</td></tr>
  <tr><td><code>sticky</code></td><td>In flow until threshold, then fixed</td></tr>
</table>
<h2>Offset Properties</h2>
<p>Use <code>top</code>, <code>right</code>, <code>bottom</code>, <code>left</code> to position non-static elements:</p>
<pre><code>.tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
}</code></pre>
<h2>z-index</h2>
<p>Controls stacking order when elements overlap. Higher values appear in front. Only works on positioned elements (not static):</p>
<pre><code>.modal    { z-index: 1000; }
.overlay  { z-index: 999; }
.dropdown { z-index: 100; }</code></pre>
<div class="tip">💡 The "positioned ancestor" for <code>absolute</code> is the nearest parent with <code>position</code> set to anything other than <code>static</code>. A common pattern is to set the parent to <code>position: relative</code> and the child to <code>position: absolute</code>.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CSS Positioning</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: sans-serif; padding: 20px; padding-top: 70px; }

      /* Fixed navbar */
      .fixed-nav {
        position: fixed; top: 0; left: 0; right: 0;
        background: #1e1b4b; color: white;
        padding: 12px 20px; z-index: 100;
        display: flex; justify-content: space-between;
      }

      /* Relative + Absolute badge */
      .card-wrapper { position: relative; display: inline-block; margin: 20px; }
      .card { background: white; border: 1px solid #e5e7eb; padding: 20px 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .badge {
        position: absolute; top: -10px; right: -10px;
        background: #ef4444; color: white;
        border-radius: 999px; width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: bold;
      }

      /* Sticky header */
      .scroll-box { height: 160px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; margin: 16px 0; }
      .sticky-header { position: sticky; top: 0; background: #7c3aed; color: white; padding: 8px 16px; font-weight: 600; font-size: 14px; }
      .scroll-content { padding: 12px 16px; font-size: 14px; color: #374151; }
    </style>
  </head>
  <body>
    <div class="fixed-nav">
      <strong>Fixed Navbar</strong>
      <span>Stays at top while scrolling</span>
    </div>

    <h1>CSS Positioning</h1>

    <h2>position: absolute — Notification Badge</h2>
    <div class="card-wrapper">
      <div class="card">Shopping Cart 🛒</div>
      <div class="badge">3</div>
    </div>

    <h2>position: sticky — Table Header</h2>
    <div class="scroll-box">
      <div class="sticky-header">Sticky Header (scroll me!)</div>
      <div class="scroll-content">
        <p>Row 1: Item data here</p><p>Row 2: More data</p>
        <p>Row 3: Even more</p><p>Row 4: Still going</p>
        <p>Row 5: Almost done</p><p>Row 6: Last row</p>
      </div>
    </div>
  </body>
</html>`,
    },
    {
      id: 'responsive',
      title: '9. Responsive Design',
      content: `
<h2>What is Responsive Design?</h2>
<p>Responsive design makes your website look great on all screen sizes — mobile phones, tablets, and desktops. The three pillars are:</p>
<ol>
  <li><strong>Fluid layouts</strong> — use % or fr instead of fixed px widths</li>
  <li><strong>Flexible images</strong> — <code>max-width: 100%</code></li>
  <li><strong>Media queries</strong> — apply different styles at different screen widths</li>
</ol>
<h2>The Viewport Meta Tag</h2>
<p>Always include this in your <code>&lt;head&gt;</code> — without it, mobile browsers zoom out:</p>
<pre><code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0" /&gt;</code></pre>
<h2>Media Queries</h2>
<pre><code>/* Mobile first — default styles are for mobile */
.container { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 24px; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}</code></pre>
<h2>Common Breakpoints</h2>
<ul>
  <li>Mobile: &lt; 640px</li>
  <li>Tablet: 640px – 1024px</li>
  <li>Desktop: &gt; 1024px</li>
</ul>
<div class="tip">💡 Design mobile-first: write base styles for small screens, then use <code>min-width</code> media queries to add complexity for larger screens. This typically results in simpler, cleaner code.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Responsive Design</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: sans-serif; margin: 0; background: #f8fafc; color: #1f2937; }

      /* Mobile first */
      .container { padding: 16px; max-width: 1200px; margin: 0 auto; }
      header { background: #1e1b4b; color: white; padding: 16px; text-align: center; }
      .grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
      .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .card h2 { margin: 0 0 8px; font-size: 1.1rem; }
      .breakpoint-indicator { background: #fef3c7; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin: 8px 0; }

      /* Tablet */
      @media (min-width: 640px) {
        header { text-align: left; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
        .grid { grid-template-columns: repeat(2, 1fr); }
        .breakpoint-indicator { background: #d1fae5; }
        .breakpoint-indicator::before { content: "📱→ Tablet (≥640px): 2-column grid"; }
      }

      /* Desktop */
      @media (min-width: 1024px) {
        .grid { grid-template-columns: repeat(3, 1fr); }
        .breakpoint-indicator { background: #dbeafe; }
        .breakpoint-indicator::before { content: "🖥️ Desktop (≥1024px): 3-column grid"; }
      }

      @media (max-width: 639px) {
        .breakpoint-indicator::before { content: "📱 Mobile (<640px): 1-column grid"; }
      }
    </style>
  </head>
  <body>
    <header>
      <strong>Responsive Layout</strong>
      <span>Resize the preview to see changes!</span>
    </header>
    <div class="container">
      <div class="breakpoint-indicator"></div>
      <div class="grid">
        <div class="card"><h2>Card 1</h2><p>Responsive cards — 1, 2, or 3 columns depending on screen width.</p></div>
        <div class="card"><h2>Card 2</h2><p>Uses CSS Grid with media query breakpoints.</p></div>
        <div class="card"><h2>Card 3</h2><p>Mobile-first approach: base styles → tablet → desktop.</p></div>
        <div class="card"><h2>Card 4</h2><p>No JavaScript needed for basic responsive layouts!</p></div>
        <div class="card"><h2>Card 5</h2><p>The viewport meta tag is essential for mobile scaling.</p></div>
        <div class="card"><h2>Card 6</h2><p>Use fr units and percentages for fluid layouts.</p></div>
      </div>
    </div>
  </body>
</html>`,
    },
    {
      id: 'animations',
      title: '10. Transitions & Animations',
      content: `
<h2>CSS Transitions</h2>
<p>Transitions smoothly animate a property from one value to another when it changes (e.g., on hover):</p>
<pre><code>.button {
  background: blue;
  transition: background 0.3s ease, transform 0.2s ease;
}
.button:hover {
  background: darkblue;
  transform: scale(1.05);
}</code></pre>
<p>Transition syntax: <code>property duration timing-function delay</code></p>
<h2>Timing Functions</h2>
<ul>
  <li><code>ease</code> — slow start, fast middle, slow end (default)</li>
  <li><code>linear</code> — constant speed</li>
  <li><code>ease-in</code> — starts slow, ends fast</li>
  <li><code>ease-out</code> — starts fast, ends slow</li>
  <li><code>cubic-bezier()</code> — custom curve</li>
</ul>
<h2>CSS Animations</h2>
<p>Animations allow complex multi-step effects using <code>@keyframes</code>:</p>
<pre><code>@keyframes slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

.element {
  animation: slide-in 0.5s ease-out forwards;
}</code></pre>
<div class="tip">💡 Prefer animating <code>transform</code> and <code>opacity</code> — they're GPU-accelerated and don't trigger layout recalculation. Avoid animating <code>width</code>, <code>height</code>, or <code>margin</code> as they cause expensive repaints.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Transitions & Animations</title>
    <style>
      body { font-family: sans-serif; padding: 30px; background: #f8fafc; }
      h2 { color: #374151; margin-top: 2rem; }

      /* Transition: hover button */
      .btn {
        display: inline-block; padding: 12px 28px; background: #7c3aed; color: white;
        border-radius: 8px; cursor: pointer; font-weight: 600; margin: 6px;
        transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        user-select: none;
      }
      .btn:hover { background: #5b21b6; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(124,58,237,0.4); }
      .btn:active { transform: translateY(0); }

      /* Transition: card flip feel */
      .card { width: 120px; height: 80px; background: #ddd6fe; border-radius: 10px; display: inline-flex;
              align-items: center; justify-content: center; font-weight: bold; cursor: pointer; margin: 6px;
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .card:hover { background: #7c3aed; color: white; transform: scale(1.15) rotate(3deg); }

      /* Keyframe animations */
      @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      @keyframes slide  { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

      .bounce { display: inline-block; width: 50px; height: 50px; background: #f59e0b; border-radius: 50%; animation: bounce 1s ease infinite; margin: 8px; }
      .spin   { display: inline-block; width: 50px; height: 50px; background: #10b981; border-radius: 8px; animation: spin 2s linear infinite; margin: 8px; }
      .pulse  { display: inline-block; width: 50px; height: 50px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s ease infinite; margin: 8px; }
      .slide  { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; border-radius: 6px; animation: slide 0.6s ease-out; margin: 8px; }
    </style>
  </head>
  <body>
    <h1>CSS Transitions & Animations</h1>

    <h2>Hover Transitions</h2>
    <div class="btn">Hover Me!</div>
    <div class="btn">Click Me!</div>

    <h2>Card Hover Effect</h2>
    <div class="card">Hover</div>
    <div class="card">Here</div>
    <div class="card">Too</div>

    <h2>Keyframe Animations</h2>
    <div class="bounce"></div>
    <div class="spin"></div>
    <div class="pulse"></div>
    <span class="slide">Slide In</span>
  </body>
</html>`,
    },
    {
      id: 'variables',
      title: '11. CSS Variables',
      content: `
<h2>Custom Properties (CSS Variables)</h2>
<p>CSS variables (also called custom properties) let you store reusable values and update them in one place:</p>
<pre><code>:root {
  --color-primary: #7c3aed;
  --color-bg: #f8fafc;
  --spacing-base: 16px;
  --border-radius: 8px;
  --font-size-base: 1rem;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-base);
  border-radius: var(--border-radius);
}</code></pre>
<h2>Fallback Values</h2>
<pre><code>color: var(--color-text, #333);  /* use #333 if variable not defined */</code></pre>
<h2>Dynamic Theming</h2>
<p>You can change variables with JavaScript or media queries to create themes:</p>
<pre><code>@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a2e;
    --color-text: #e2e8f0;
  }
}</code></pre>
<h2>Scoped Variables</h2>
<pre><code>.card {
  --card-padding: 24px;  /* only available inside .card */
}</code></pre>
<div class="tip">💡 Define all your design tokens (colors, spacing, font sizes, border radii) as CSS variables in <code>:root</code>. This is the foundation of a maintainable design system — change one variable and the whole site updates.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CSS Variables</title>
    <style>
      /* Design tokens */
      :root {
        --color-primary: #7c3aed;
        --color-primary-light: #ede9fe;
        --color-secondary: #059669;
        --color-danger: #dc2626;
        --color-bg: #f8fafc;
        --color-surface: white;
        --color-text: #1f2937;
        --color-muted: #6b7280;
        --radius: 10px;
        --gap: 16px;
        --shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: sans-serif; background: var(--color-bg); color: var(--color-text); padding: 24px; }

      .btn {
        padding: 10px 24px; border-radius: var(--radius); border: none;
        font-weight: 600; cursor: pointer; margin: 6px;
        transition: opacity 0.2s;
      }
      .btn:hover { opacity: 0.85; }
      .btn-primary  { background: var(--color-primary); color: white; }
      .btn-success  { background: var(--color-secondary); color: white; }
      .btn-danger   { background: var(--color-danger); color: white; }
      .btn-outline  { background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); }

      .card {
        --card-border: var(--color-primary);
        background: var(--color-surface);
        border-left: 4px solid var(--card-border);
        padding: var(--gap);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        margin: var(--gap) 0;
      }
      .card.danger  { --card-border: var(--color-danger); }
      .card.success { --card-border: var(--color-secondary); }
      .card p { color: var(--color-muted); margin: 4px 0 0; font-size: 14px; }
    </style>
  </head>
  <body>
    <h1>CSS Variables Demo</h1>
    <p>All colors, spacing, and radii come from <code>:root</code> variables.</p>

    <h2>Buttons Using Variable Colors</h2>
    <button class="btn btn-primary">Primary</button>
    <button class="btn btn-success">Success</button>
    <button class="btn btn-danger">Danger</button>
    <button class="btn btn-outline">Outline</button>

    <h2>Cards with Scoped Variables</h2>
    <div class="card">
      <strong>Info Card</strong>
      <p>Uses --color-primary for the left border via --card-border.</p>
    </div>
    <div class="card danger">
      <strong>Danger Card</strong>
      <p>Overrides --card-border to --color-danger at the component level.</p>
    </div>
    <div class="card success">
      <strong>Success Card</strong>
      <p>The variable change is scoped — it only affects this card.</p>
    </div>
  </body>
</html>`,
    },
    {
      id: 'pseudo',
      title: '12. Pseudo-classes & Pseudo-elements',
      content: `
<h2>Pseudo-classes</h2>
<p>Pseudo-classes select elements based on their <strong>state</strong> or <strong>position</strong> in the DOM:</p>
<pre><code>a:hover   { color: blue; }          /* mouse over */
a:visited { color: purple; }        /* visited link */
input:focus { outline: 2px solid blue; } /* focused */
button:active { transform: scale(0.98); } /* being clicked */

/* Structural */
li:first-child  { font-weight: bold; }
li:last-child   { border-bottom: none; }
li:nth-child(2) { background: yellow; }
li:nth-child(odd) { background: #f9f9f9; }

/* Form states */
input:valid   { border-color: green; }
input:invalid { border-color: red; }
input:disabled { opacity: 0.5; }</code></pre>
<h2>Pseudo-elements</h2>
<p>Pseudo-elements create virtual elements that are part of the element's content but don't exist in HTML:</p>
<pre><code>p::first-line { font-weight: bold; }
p::first-letter { font-size: 2em; float: left; }

/* Most common — insert generated content */
.quote::before { content: '"'; color: purple; }
.quote::after  { content: '"'; color: purple; }

/* Style placeholder */
input::placeholder { color: #aaa; font-style: italic; }

/* Custom selection color */
::selection { background: #7c3aed; color: white; }</code></pre>
<div class="tip">💡 The <code>::before</code> and <code>::after</code> pseudo-elements require a <code>content</code> property (even if it's <code>content: ""</code>) to render. They're extremely useful for decorative elements that don't need to be in the HTML.</div>
`,
      starterCode: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pseudo-classes & Pseudo-elements</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: sans-serif; padding: 24px; background: #f9fafb; }
      h2 { color: #374151; margin-top: 1.5rem; }

      /* Pseudo-classes */
      .link-demo a { color: #7c3aed; margin-right: 16px; }
      .link-demo a:hover { color: #5b21b6; text-decoration: none; border-bottom: 2px solid; }

      ol.styled li { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
      ol.styled li:first-child { font-weight: bold; color: #7c3aed; }
      ol.styled li:last-child { border-bottom: none; }
      ol.styled li:nth-child(even) { background: #f3f4f6; }
      ol.styled li:hover { background: #ede9fe; cursor: pointer; }

      input.validated { padding: 8px 12px; border-radius: 6px; border: 2px solid #e5e7eb; outline: none; }
      input.validated:focus { border-color: #7c3aed; }
      input.validated:valid { border-color: #059669; }
      input.validated:invalid { border-color: #dc2626; }

      /* Pseudo-elements */
      .drop-cap::first-letter {
        float: left; font-size: 3em; line-height: 0.75; margin-right: 8px;
        color: #7c3aed; font-weight: bold;
      }

      .quote { font-style: italic; color: #374151; margin: 16px 0; position: relative; }
      .quote::before { content: '“'; font-size: 3em; color: #c4b5fd; line-height: 0; vertical-align: -0.6em; margin-right: 4px; }
      .quote::after  { content: '”'; font-size: 3em; color: #c4b5fd; line-height: 0; vertical-align: -0.6em; margin-left: 4px; }

      .badge-item { position: relative; display: inline-block; margin-right: 32px; }
      .badge-item::after { content: attr(data-count); position: absolute; top: -8px; right: -20px;
        background: #ef4444; color: white; border-radius: 999px; width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; }

      ::selection { background: #7c3aed; color: white; }
    </style>
  </head>
  <body>
    <h1>Pseudo-classes & Pseudo-elements</h1>
    <p>Try selecting any text on this page — it turns purple! (::selection)</p>

    <h2>:hover &amp; Link States</h2>
    <div class="link-demo">
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </div>

    <h2>:nth-child &amp; :first/:last-child</h2>
    <ol class="styled">
      <li>First item (bold + purple)</li>
      <li>Second item (even = gray)</li>
      <li>Third item</li>
      <li>Fourth item (even = gray)</li>
      <li>Last item (no bottom border)</li>
    </ol>

    <h2>::first-letter Drop Cap</h2>
    <p class="drop-cap">Once upon a time there was a language called CSS that made the web beautiful. It started simple but grew into a powerful system for designing visual experiences.</p>

    <h2>::before & ::after — Quotation Marks</h2>
    <p class="quote">The best way to learn to code is to actually write code every single day.</p>

    <h2>::after — CSS Badges (no HTML change!)</h2>
    <span class="badge-item" data-count="3">Inbox</span>
    <span class="badge-item" data-count="12">Notifications</span>
  </body>
</html>`,
    },
  ],
}
