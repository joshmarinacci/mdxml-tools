import {parseXml, XmlElement, XmlText} from "@rgrove/parse-xml";
// import path from "path";
// import {promises as fs} from "fs";
import {codeToHtml} from "shiki";

export async function doRender(str:string) {
    const out = parseXml(str,{
        includeOffsets:true
    })

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

    let output = ""

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

    await new Visitor({
        enter:async (e) => {
            // if(e.name === 'include') {
            //     console.log("entering",e.name)
            //     let frag = await streamInclude(e.attributes.src)
            //     for(let v of frag.children) {
            //         // console.log("inserting",v)
            //         if(v instanceof XmlElement) {
            //             e.children.push(v)
            //         }
            //     }
            // }
        },
        text: async (e) => {

        },
        exit: async (e) => {

        }
    }).visit(out.children[0] as XmlElement)

    let inside_codeblock = false

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
    const TOC:TOCEntry[] = []
    const toc_finder = new Visitor({
        enter:async (e) => {
            if(e.name === 'h1') TOC.push([e.name,childrenToText(e)[0]])
            if(e.name === 'h2') TOC.push([e.name,childrenToText(e)[0]])
            if(e.name === 'h3') TOC.push([e.name,childrenToText(e)[0]])
        },
        text: async (e) => {},
        exit: async (e) => {

        }
    })
    await toc_finder.visit(out.children[0] as XmlElement)

    function renderTOC(toc: TOCEntry[]) {
        return `<nav class="toc">${toc.map(entry => `<li>${entry[1]}</li>`).join("\n")}</nav>`
    }

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
                output += renderTOC(TOC)
                output += '<article>'
                return
            }
            if(e.name === 'image') {
                output += `<figure><img src="${e.attributes.src}" title="${e.attributes.title}"/><figcaption>${e.attributes.title}</figcaption></figure>`
            }
            if(e.name === 'link') {
                output += `<a href="${e.attributes.target}">`
            }
            if(e.name === 'include') return
            if(e.name === 'fragment') return
            if(e.name === 'youtube') {
                output += `
<iframe id="ytplayer" type="text/html" width="720" height="405"
src="https://www.youtube.com/embed/${e.attributes.embed}"
 allowfullscreen>`
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
    await render.visit(out.children[0] as XmlElement)
    return output
}