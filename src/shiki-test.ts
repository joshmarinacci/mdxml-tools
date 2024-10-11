import {codeToHtml} from "shiki"

const code = 'const a = 1'

const html = await codeToHtml(code, {
    lang:'javascript',
    theme:'vitesse-dark',
})

console.log(html)
