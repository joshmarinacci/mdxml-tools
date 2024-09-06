import process from "process"
import path from 'path'
import {promises as fs} from "fs"
import {make_logger} from "josh_js_util"
// import {XMLValidator, XMLParser} from "fast-xml-parser"
import {parseXml, XmlCdata, XmlElement, XmlText} from '@rgrove/parse-xml';

const log = make_logger("RENDER")
const infile = process.argv[2]
log.info("reading", infile)
const raw_data = await fs.readFile(infile)
const str = raw_data.toString('utf-8')
const out = parseXml(str,{})

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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
</head>
<body>
`
}

function renderFooter() {
    return `
<script>hljs.highlightAll();</script>
</body></html>`
}

async function streamInclude(src: string) {
    const base = path.dirname(infile)
    const pth = path.join(base,src)
    console.log("base is",base)
    console.log("loading", pth)
    let include = await fs.readFile(pth,'utf-8')
    console.log("including",include)
    const out = parseXml(include)
    // console.log("out is",out)
    return out
}

await new Visitor({
    enter:async (e) => {
        if(e.name === 'include') {
            console.log("entering",e.name)
            let frag = await streamInclude(e.attributes.src)
            for(let v of frag.children) {
                // console.log("inserting",v)
                e.children.push(v)
            }
        }
    },
    text: async (e) => {

    },
    exit: async (e) => {

    }
}).visit(out.children[0] as XmlElement)

const visitor = new Visitor({
    enter: async (e) => {
        if(e.name === 'codeblock') {
            output += "<pre><code>"
            return
        }
        if(e.name === 'para') {
            output += '<p>'
            return
        }
        if(e.name === 'document') {
            output += renderHeader()
            return
        }
        if(e.name === 'image') {
            output += `<img src="${e.attributes.src}" title="${e.attributes.title}"/>`
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
        output += e.text
    },
    exit: async (e) => {
        if(e.name === 'include') return
        if(e.name === 'fragment') return
        if(e.name === 'link') {
            output += "</a>"
        }
        if(e.name === 'codeblock') {
            output += "</code></pre>"
            return
        }
        if(e.name === 'para') {
            output += '</p>'
            return
        }
        if(e.name === 'document') {
            output += renderFooter()
            return
        }
        output += `</${e.name}>`
    },
})
await visitor.visit(out.children[0] as XmlElement)

const BUILD_DIR = "build"
// console.log(output)
const outfile = path.join(BUILD_DIR,path.basename(infile,path.extname(infile))+'.html')
// console.log('writing to ',outfile)
await fs.writeFile(outfile,output)
// setup element mapping
// read in file
// render to output elements
// flatten output elements to HTML string
// load HTML output template
// save template to disk
