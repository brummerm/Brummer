export type RunResult = { output: string; isError: boolean; isPreview: boolean; previewHtml?: string }

// ── JavaScript runner (sandboxed iframe) ─────────────────────────────────────
export async function runJavaScript(code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('sandbox', 'allow-scripts')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const timeout = setTimeout(() => {
      document.body.removeChild(iframe)
      resolve({ output: 'Error: Code timed out (5s)', isError: true, isPreview: false })
    }, 5000)

    const handler = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return
      clearTimeout(timeout)
      window.removeEventListener('message', handler)
      document.body.removeChild(iframe)
      const { logs, error } = e.data as { logs: string[]; error?: string }
      const output = error
        ? `Error: ${error}\n${logs.join('\n')}`
        : logs.join('\n') || '(no output)'
      resolve({ output, isError: !!error, isPreview: false })
    }
    window.addEventListener('message', handler)

    const wrappedCode = `
      const __logs = [];
      const __origLog = console.log;
      const __origError = console.error;
      console.log = (...a) => { __logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ')); };
      console.error = (...a) => { __logs.push('Error: ' + a.join(' ')); };
      try {
        ${code}
        window.parent.postMessage({ logs: __logs }, '*');
      } catch(e) {
        window.parent.postMessage({ logs: __logs, error: e.message }, '*');
      }
    `
    iframe.srcdoc = `<script>${wrappedCode}<\/script>`
  })
}

// ── HTML/CSS preview ──────────────────────────────────────────────────────────
export async function previewHTML(code: string): Promise<RunResult> {
  return { output: '', isError: false, isPreview: true, previewHtml: code }
}

// ── Python runner (Pyodide via CDN) ──────────────────────────────────────────
declare global {
  interface Window {
    loadPyodide?: (cfg: { indexURL: string }) => Promise<PyodideHandle>
    __pyodide?: PyodideHandle
    __pyodideLoading?: boolean
  }
}
interface PyodideHandle {
  runPythonAsync(code: string): Promise<unknown>
  setStdout(opts: { batched: (s: string) => void }): void
  setStderr(opts: { batched: (s: string) => void }): void
}

export async function runPython(code: string, onStatus?: (s: string) => void): Promise<RunResult> {
  if (!window.__pyodide) {
    if (!window.__pyodideLoading) {
      window.__pyodideLoading = true
      onStatus?.('Loading Python runtime (~10 MB, one-time download)…')
      await new Promise<void>((res, rej) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js'
        s.onload = () => res()
        s.onerror = () => rej(new Error('Failed to load Pyodide'))
        document.head.appendChild(s)
      })
      window.__pyodide = await window.loadPyodide!({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      })
      window.__pyodideLoading = false
    } else {
      // Wait for loading to finish
      while (window.__pyodideLoading) await new Promise(r => setTimeout(r, 200))
    }
  }
  onStatus?.('Running…')
  const py = window.__pyodide!
  let output = ''
  let errors = ''
  py.setStdout({ batched: (s: string) => { output += s + '\n' } })
  py.setStderr({ batched: (s: string) => { errors += s + '\n' } })
  try {
    await py.runPythonAsync(code)
    const combined = (output + errors).trim()
    return { output: combined || '(no output)', isError: !!errors, isPreview: false }
  } catch (e: unknown) {
    return { output: String(e), isError: true, isPreview: false }
  }
}

// ── Static (Java / C++ / Docker) ─────────────────────────────────────────────
export async function showStatic(): Promise<RunResult> {
  return { output: 'This language runs locally. See the "Expected Output" below the editor.', isError: false, isPreview: false }
}
