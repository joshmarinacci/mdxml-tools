import * as ohm from 'ohm-js'
import {b} from "vitest/dist/suite-IbNSsUWN.js";

export type Block = {
    type:"header"|"para"|"blank"|"li"|"codeblock"|"extension"|"image"
    content:string
}
export type Header = {
    type: "header"
    level:number,
} & Block

export type BlockImage = {
    type:"image",
    content:string,
    url:string,
} & Block
export type Codeblock = {
    type:'codeblock',
    language:string,
} & Block

export type MDSpanType = "plain" | "bold" | "italic" | "code" | "link"
export type MDStandardSpan = [MDSpanType, string]
export type MDLinkSpan = ["link", string, string, string]
export type MDSpan = MDStandardSpan | MDLinkSpan


export function parse_markdown_blocks(str:string) {
    // let parser = {}
    const grammar = ohm.grammar(`
MarkdownOuter {
  doc = block+
  block =  blank | h4 | h3 | h2 | h1 | bullet | img | code | ext | para | endline
  h4 = "####" rest
  h3 = "###" rest
  h2 = "##" rest
  h1 = "#" rest
  para = line+ //paragraph is just multiple consecutive lines
  bullet = "* " rest (~"*" ~blank rest)*
  img = "![" (~"]" any)+ "]" "(" (~")" any)+ ")" rest
  code = q rest (~q any)* q //anything between the \`\`\` markers
  q = "\`\`\`"   // start and end code blocks
  ext = obb rest (~cbb any)* cbb //anything between {{ and }}
  obb = "\{\{"
  cbb = "\}\}"
  nl = "\\n"   // new line
  sp = " "
  blank = sp* nl  // blank line has only newline
  endline = (~nl any)+ end
  line = (~nl any)+ nl  // line has at least one letter
  rest = (~nl any)* nl  // everything to the end of the line
}

    `)
    const semantics = grammar.createSemantics()
    semantics.addOperation('blocks',{
        _terminal() { return this.sourceString },
        _iter:(...children) => children.map(c => c.blocks()),
        h1:(_,b) => ({ type:"header",level:1,content:b.blocks() } as Header),
        h2:(_,b) => ({ type:"header",level:2,content:b.blocks() } as Header),
        h3:(_,b) => ({ type:"header",level:3,content:b.blocks() } as Header),
        h4:(_,b) => ({ type:"header",level:4,content:b.blocks() } as Header),
        img:(_,text,c,d,e,f,styles) => ({type:"image", content:text.sourceString, url:e.sourceString, styles:styles.sourceString} as BlockImage),
        code:(_,name,cod,_2) =>
            ({ type:"codeblock", language:name.blocks(), content:cod.blocks().join("")} as Codeblock),
        ext:(_a,_b,content,_d) => ({type: 'extension', content: content.sourceString} as Block),
        para: a=> ({type:"para", content:a.sourceString} as Block),
        blank: (a,b) => ({type:'blank'} as Block),
        bullet: (a,b,c) =>
            ({type:'li', content:b.sourceString + c.sourceString} as Block),
        line: (a,_) => a.blocks().join(""),
        endline: (a,_) => a.blocks().join(""),
        rest: (a,_) => a.blocks().join("")
    })
    let match = grammar.match(str)
    // console.log("match is",match)
    return semantics(match).blocks()
}
export function parse_markdown_content(text:string) {
    // l("parsing markdown inside block",block)
    let grammar = ohm.grammar(`
MarkdownInner {
  block = para*
  para = link | bold | italic | code | plain
  plain = ( ~( "*" | "\`" | "[" | "__") any)+
  bold   = "**" (~"**" any)* "**"   -- extended
         | "*"  (~"*" any)*  "*"    -- standard
  italic = "__" (~"__" any)* "__"   -- extended
         | "_"  (~"_" any)*  "_"    -- standard
  code = "\`" (~"\`" any)* "\`"
  link = "!"? "[" (~"]" any)* "]" "(" (~")" any)* ")"
}
    `)
    let semantics = grammar.createSemantics()
    semantics.addOperation('content',{
        // @ts-ignore
        _terminal() { return this.sourceString },
        _iter:(...children) => children.map(c => c.content()),
        plain(a) {return ['plain',a.content().join("")] },
        bold_standard(_1,a,_2) { return (['bold',a.content().join("")]) as MDSpan },
        bold_extended(_1,a,_2) { return (['bold',a.content().join("")]) as MDSpan },
        italic_extended(_1,a,_2) { return (['italic',a.content().join("")]) as MDSpan },
        italic_standard(_1,a,_2) { return (['italic',a.content().join("")]) as MDSpan },
        code:(_1,a,_2) => (['code',a.content().join("")]) as MDSpan,
        link:(img,_1,text,_2,_3,url,_4) => ['link',
            text.content().join(""),
            url.content().join(""),
            img.content().join("")] as MDSpan
    })
    let match = grammar.match(text)
    if(match.failed()) {
        console.log("match failed on block",text)
        console.log(match.message)
        // text.content = [['plain',text.content]]
        return ""
    } else {
        return semantics(match).content()
    }
}

