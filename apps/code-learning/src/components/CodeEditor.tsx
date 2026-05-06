import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { python as pythonLang } from '@codemirror/lang-python'
import { javascript as jsLang } from '@codemirror/lang-javascript'
import { html as htmlLang } from '@codemirror/lang-html'
import { java as javaLang } from '@codemirror/lang-java'
import { cpp as cppLang } from '@codemirror/lang-cpp'
import type { RuntimeType } from '../curriculum/types.ts'

const extensions: Record<RuntimeType, ReturnType<typeof pythonLang>[]> = {
  python: [pythonLang()],
  javascript: [jsLang({ jsx: false })],
  html: [htmlLang()],
  static: [],
}

interface Props {
  code: string
  onChange: (val: string) => void
  runtime: RuntimeType
  languageId: string
}

export default function CodeEditor({ code, onChange, runtime, languageId }: Props) {
  const exts = languageId === 'css' ? [htmlLang()] :
               languageId === 'cpp' ? [cppLang()] :
               languageId === 'java' ? [javaLang()] :
               extensions[runtime] ?? []
  return (
    <CodeMirror
      value={code}
      height="100%"
      theme={oneDark}
      extensions={exts}
      onChange={onChange}
      style={{ height: '100%' }}
    />
  )
}
