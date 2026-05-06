import { python } from './python.ts'
import { html } from './html.ts'
import { css } from './css.ts'
import { javascript } from './javascript.ts'
import { java } from './java.ts'
import { cpp } from './cpp.ts'
import { docker } from './docker.ts'
import type { Language } from './types.ts'

export const languages: Language[] = [python, javascript, html, css, java, cpp, docker]
export type { Language, Lesson } from './types.ts'
