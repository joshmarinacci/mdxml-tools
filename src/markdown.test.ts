import {describe, expect, it} from "vitest"
import {Block, Codeblock, Header, parse_markdown_blocks} from "./markdown";

describe("Markdown", () => {
    it('should parse a header', () => {
        let text = `# greetings earthling\n`
        let blocks = parse_markdown_blocks(text)
        expect(blocks.length).toBe(1)
    })
    it('should parse a code block', () => {
        let text = '``` name\n   foo code \n ```'
        let blocks = parse_markdown_blocks(text)
        // console.log("codeblock",JSON.stringify(blocks,null,'  '))
        expect(blocks.length).toBe(1)
    })
})

function toHTMLs(args:Block[]) {
    return `<html><body>${args.map(b => toHTML(b)).join("")}</body></html>`
}
function toHTML(block: Block) {
    if(block.type === 'header') {
        let h1 = block as Header
        return `<h${h1.level}>${h1.content}</h${h1.level}>`;
    }
    if(block.type === 'codeblock') {
        return `<blockquote><code>${block.content.trim()}</code></blockquote>`
    }
    if(block.type === 'blank') return ''
    return "???"
}

describe("render to html", () => {
    it('h1', () => {
        let h1: Header = {
            type: "header",
            level: 1,
            content: "greetings earthling"
        }
        let html: string = toHTML(h1)
        expect(html).toEqual("<h1>greetings earthling</h1>")
    })

    it('h2', () => {
        let h2: Header = {
            type: "header",
            level: 2,
            content: "greetings earthling"
        }
        let html: string = toHTML(h2)
        expect(html).toEqual("<h2>greetings earthling</h2>")
    })
})

describe("render expression", () => {
    it("simple expression", () => {
        let doc = `#exp test
                
hi there
        `
        let blocks:Block[] = parse_markdown_blocks(doc)
        console.log("blocks",blocks)
        // blocks = blocks.map((block:Block) => {
        //     // console.log("block",block)
        //     if(block.type === 'codeblock') {
        //         let codeblock = block as Codeblock
        //         if(codeblock.language === 'exp') {
        //             let ast = parse_expression_ast(codeblock.content)
        //             // console.log("ast",ast)
        //             let val = resolve(ast)
        //             // console.log("becomes",val.value)
        //             codeblock.content = val.value+""
        //         }
        //     }
        //     return block
        // })
        // let html:string = toHTMLs(blocks)
        // // console.log("html is",html)
        // expect(html).toEqual("<html><body><h1>exp test</h1><blockquote><code>9</code></blockquote></body></html>")
    })
})


