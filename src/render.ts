import {parseXml, XmlElement, XmlText} from "@rgrove/parse-xml";
// import path from "path";
// import {promises as fs} from "fs";
import {codeToHtml} from "shiki";
import {Docset} from "./docset.js";
import {Block, parse_markdown_blocks} from "./markdown.js";
type VisitorCallback = (e:XmlElement) => Promise<void>
type VisitorTextCallback = (e:XmlText) => Promise<void>
type VisitorOptions = {
    enter: VisitorCallback,
    text: VisitorTextCallback,
    exit: VisitorCallback,
}


class Visitor {
    private opts: VisitorOptions;
    constructor(opts:VisitorOptions) {
        this.opts = opts
    }
    async visit(root: XmlElement) {
        await this._visit(root, '')
    }
    private async _visit(el: XmlElement, s: string) {
        // console.log(s,el.name)
        await this.opts.enter(el)
        for(let ch of el.children) {
            if(ch instanceof XmlElement) {
                await this._visit(ch,s+'  ')
            }
            if(ch instanceof XmlText) {
                await this.opts.text(ch)
            }
        }
        await this.opts.exit(el)
    }
}
function renderHeader() {
    return `<html>
<head>
    <title>doc title</title>
    <link rel="stylesheet" href="./style.css"/>
<!--    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css">-->
<!--    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>-->
</head>
<body>
`
}
function renderFooter() {
    return `
<!--<script>hljs.highlightAll();</script>-->
</body></html>`
}
function slugForHeader(title:string) {
    return title.replaceAll(' ','_').toLowerCase()
}
function renderTOCLink(entry:TOCEntry) {
    const slug = slugForHeader(entry[1])
    return `<li><a href='#${slug}' class='toc-${entry[0]}'>${entry[1]}</a></li>`
}
function renderTOC(toc: TOCEntry[]) {
    return `<nav class="toc">
    <ul>
    ${toc.map(entry => renderTOCLink(entry)).join("\n")}
    </ul>
    </nav>`
}

type CodeDecoration = {
    start:number,
    end:number,
}
function childrenToText(e: XmlElement):[string,CodeDecoration[]] {
    let decs:CodeDecoration[] = []
    let totalText = ""
    e.children.forEach(ch => {
        if(ch instanceof XmlText) {
            totalText += ch.text
            return
        }
        if(ch instanceof XmlElement) {
            let [text] = childrenToText(ch)
            decs.push({
                start:totalText.length,
                end: totalText.length + text.length,
            })
            totalText += text
        }
    })
    return [totalText, decs]
}
type TOCEntry = [string,string]
async function find_xml_toc(root: XmlElement) {
    const TOC:TOCEntry[] = []
    const toc_finder = new Visitor({
        enter:async (e) => {
            if(e.name === 'h1') TOC.push([e.name,childrenToText(e)[0]])
            if(e.name === 'h2') TOC.push([e.name,childrenToText(e)[0]])
            if(e.name === 'h3') TOC.push([e.name,childrenToText(e)[0]])
        },
        text: async (e) => {},
        exit: async (e) => {}
    })
    await toc_finder.visit(root)
    return TOC
}
async function find_markdown_toc(blocks:Block[]):Promise<TOCEntry[]> {
    const TOC:TOCEntry[] = []
    for(let block of blocks) {
        if(block.type === 'header') {
            TOC.push(['h1',block.content])
        }
    }
    return TOC
}

function renderHeaderStart(e: XmlElement) {
    return `<${e.name} id=${slugForHeader(e.text)}>`
}

function renderNav(url_map: Map<any, any>, docset: Docset) {
    let nav_links = docset.pages.map(page => {
        return `<li><a href="${url_map.get(page.src)}">${page.title}</a></li>`
    })
        return `<nav class="docset">
    <ul>
    ${nav_links.join("\n")}
    </ul>
    </nav>`
}

async function renderToHtml(root: XmlElement, TOC: TOCEntry[], url_map: Map<any, any>, docset: Docset) {
    let output = ""
    let inside_codeblock = false
    const render = new Visitor({
        enter: async (e) => {
            if(e.name === 'codeblock') {
                const [text,decs] = childrenToText(e)
                console.log('code block decs',decs,'--',text,'--')
                inside_codeblock = true
                let html = await codeToHtml(text, {
                    lang:e.attributes.language,
                    theme:'vitesse-light',
                    decorations: decs.map(dec => ({
                        start:dec.start,
                        end:dec.end,
                        properties: { class: 'highlighted-word' }
                    }))
                })

                output += `yowza <div class='codeblock-wrapper'><button class="codeblock-button">Copy Code</button>${html}</div>`
                return
            }
            if(e.name === 'para') {
                output += '<p>'
                return
            }
            if(e.name === 'document') {
                output += renderHeader()
                output += renderNav(url_map,docset)
                output += renderTOC(TOC)
                output += '<article>'
                return
            }
            if(e.name === 'image') {
                output += `<figure><img src="${e.attributes.src}" title="${e.attributes.title}"/><figcaption>${e.attributes.title}</figcaption></figure>`
            }
            if(e.name === 'link') {
                let target = e.attributes.target
                if(!target) console.warn("link missing target",e.name, e.attributes)
                if(url_map.has(target)) {
                    target = url_map.get(target)
                }
                output += `<a href="${target}">`
            }
            if(e.name === 'include') return
            if(e.name === 'fragment') return
            if(e.name === 'youtube') {
                output += `
<iframe id="ytplayer" type="text/html" width="720" height="405"
src="https://www.youtube.com/embed/${e.attributes.embed}"
 allowfullscreen>`
            }
            if(e.name === 'h1' || e.name === 'h2' || e.name === 'h3') {
                output += renderHeaderStart(e)
                return
            }
            output += `<${e.name}>`
        },
        text:async (e:XmlText) => {
            if(inside_codeblock) {
                // console.log('inside code block', e.text)
                // codeblock_text = e.text
                return
            }
            output += e.text
        },
        exit: async (e) => {
            if(e.name === 'include') return
            if(e.name === 'fragment') return
            if(e.name === 'link') {
                output += "</a>"
            }
            if(e.name === 'codeblock') {
                console.log('exiting codeblock')
                inside_codeblock = false
                // codeblock_text = ""
                // output += html
                // output += "</code></pre>"
                return
            }
            if(e.name === 'para') {
                output += '</p>'
                return
            }
            if(e.name === 'document') {
                output += '</article>'
                output += renderFooter()
                return
            }
            output += `</${e.name}>`
        },
    })
    await render.visit(root)
    return output
}
export async function renderXMLPage(str: string, url_map: Map<any, any>, docset: Docset) {
    const out = parseXml(str,{
        includeOffsets:true
    })
    const root = out.children[0] as XmlElement
    const TOC = await find_xml_toc(root)
    return renderToHtml(root,TOC, url_map, docset)


    // async function streamInclude(src: string) {
    //     const base = path.dirname(infile)
    //     const pth = path.join(base,src)
    //     console.log("base is",base)
    //     console.log("loading", pth)
    //     let include = await fs.readFile(pth,'utf-8')
    //     console.log("including",include)
    //     const out = parseXml(include)
    //     // console.log("out is",out)
    //     return out
    // }

    // await new Visitor({
    //     enter:async (e) => {
    //         // if(e.name === 'include') {
    //         //     console.log("entering",e.name)
    //         //     let frag = await streamInclude(e.attributes.src)
    //         //     for(let v of frag.children) {
    //         //         // console.log("inserting",v)
    //         //         if(v instanceof XmlElement) {
    //         //             e.children.push(v)
    //         //         }
    //         //     }
    //         // }
    //     },
    //     text: async (e) => {
    //
    //     },
    //     exit: async (e) => {
    //
    //     }
    // }).visit(out.children[0] as XmlElement)

}

async function formatCodeBlock(text: string, lang: string) {
    let html = await codeToHtml(text, {
        lang: lang,
        theme: 'vitesse-light',
        // decorations: decs.map(dec => ({
        //     start:dec.start,
        //     end:dec.end,
        //     properties: { class: 'highlighted-word' }
        // }))
    })
    return `${lang} <div class='codeblock-wrapper'><button class="codeblock-button">Copy Code</button>${html}</div>`
}

export async function renderMarkdownPage(str: string, url_map: Map<any, any>, docset: Docset) {
    // read in the markdown to a data structure
    const blocks = parse_markdown_blocks(str)
    const TOC = await find_markdown_toc(blocks)

    let output = ""
    output += renderHeader()
    output += renderNav(url_map,docset)
    output += renderTOC(TOC)
    output += '<article>'

    for(let block of blocks) {
        if(block.type === 'blank') continue
        // console.log("block",block)
        if(block.type === 'para') {
            output += `<p>${block.content}</p>\n`
            continue
        }
        if(block.type === 'header') {
            output += `<h${block.level}>${block.content}</h${block.level}>\n`
            continue
        }
        if(block.type === 'li') {
            output += `<li>${block.content}</li>\n`
            continue
        }
        const SUPPORTED_LANGUAGES = ['javascript']
        if(block.type === 'codeblock') {
            const text = block.content
            const lang = block.language?.trim()
            if(!lang) {
                console.warn("block is missing language")
                continue
            }
            if(!SUPPORTED_LANGUAGES.includes(lang)) {
                console.warn("unsupported language",lang)
                continue
            }
            output += await formatCodeBlock(text, lang)
            continue
        }
        // console.log('block is',block)
        if(block.type === 'extension') {
            console.log("skipping extension for now")
            continue
        }
        console.warn("unsupported block type",block.type)
    }

    output += '</article>'
    output += renderFooter()

    // console.log("final markdown output is",output)
    return output
}
