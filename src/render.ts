import {parseXml, XmlElement, XmlText} from "@rgrove/parse-xml";
import {codeToHtml} from "shiki";
import {Docset} from "./docset.js";
import {
    BlockImage,
    MDLinkSpan,
    MDSpan,
    parse_markdown_blocks,
    parse_markdown_content
} from "./markdown.js";
import {find_markdown_toc, find_xml_toc, TOCEntry} from "./toc.js";
import {Visitor} from "./visitor.js";
import {childrenToText} from "./xml.js";


function renderHeader() {
    return `<html>
<head>
    <title>doc title</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf8" />
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
    const slug = slugForHeader(entry.text)
    return `<li><a href='#${slug}' class='toc-${entry.level}'>${entry.text}</a></li>`
}
function renderTOC(toc: TOCEntry[]) {
    return `<nav class="toc">
    <ul>
    ${toc.map(entry => renderTOCLink(entry)).join("\n")}
    </ul>
    </nav>`
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

function makeElem(name:string) {
    return (text:string) => `<${name}>${text}</${name}>`
}
const code = makeElem('code')
const bold = makeElem('b')
const italic = makeElem('i')

function markdown_inline_to_html(span: MDSpan) {
    const type = span[0]
    if(type === 'bold') return bold(span[1])
    if(type === 'plain') return span[1]
    if(type === 'code') return code(span[1])
    if(type === 'italic') return italic(span[1])
    if(type === 'link') {
        const ld = span as MDLinkSpan
        return `<a href="${ld[2]}">${ld[1]}</a>`
    }
    console.warn("unsupported span type",span)
    return span
}

function markdown_block_to_html(spans: MDSpan[]) {
    let output = ""
    for(let span of spans) {
        output += markdown_inline_to_html(span)
    }
    return output
}

function render_block_image(img: BlockImage) {
    return `<figure>
            <img src="${img.url}"/>
            <figcaption>${img.content}</figcaption>
            </figure>`
}

type MarkdownExtensionGallery = {
    type:"gallery",
    title:string,
    images:string[]
}
function render_markdown_gallery(json: MarkdownExtensionGallery) {
    console.log("making gallery",json)
    return `<div class='gallery'>
    <h5>${json.title}</h5>
    <ul>
        ${json.images.map(image => `<li><img src="${image}"/></li>`).join("\n")}
    </ul>
    <a href='#'>prev</a>
    dots
    <a href='#'>next</a>
    </div>`
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
        if(block.type === 'para') {
            output += `<p>${markdown_block_to_html(parse_markdown_content(block.content))}</p>\n`
            continue
        }
        if(block.type === 'header') {
            const slug = slugForHeader(block.content)
            output += `<h${block.level} id="${slug}">${markdown_block_to_html(parse_markdown_content(block.content))}</h${block.level}>\n`
            continue
        }
        if(block.type === 'li') {
            output += `<li>${markdown_block_to_html(parse_markdown_content(block.content))}</li>\n`
            continue
        }
        const SUPPORTED_LANGUAGES = ['javascript']
        if(block.type === 'codeblock') {
            const text = block.content
            const lang = block.language?.trim()
            if(!lang) {
                console.warn("block is missing language")
                // @ts-ignore
                output += await formatCodeBlock(text, undefined)
                continue
            }
            // if(!SUPPORTED_LANGUAGES.includes(lang)) {
            //     console.warn("unsupported language",lang)
            //     output += await formatCodeBlock(text, undefined)
            //     continue
            // }
            output += await formatCodeBlock(text, lang)
            continue
        }
        // console.log('block is',block)
        if(block.type === 'extension') {
            // console.log("skipping extension for now")
            const parsable = `{${block.content}}`
            // console.log('parsing',parsable)
            try {
                const json = JSON.parse(parsable)
                if(json.type === 'gallery') {
                    output += render_markdown_gallery(json)
                    continue
                }
                console.log("unknown extension json is", json)
            } catch (error) {
                console.error("could not parse extension")
            }
            continue
        }
        if(block.type === 'image') {
            output += render_block_image(block as BlockImage)
            continue
        }
        console.warn("unsupported block type",block.type,block)
    }

    output += '</article>'
    output += renderFooter()

    // console.log("final markdown output is",output)
    return output
}
