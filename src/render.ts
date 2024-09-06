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

type VisitorCallback = (e:XmlElement) => void
type VisitorTextCallback = (e:XmlText) => void

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

    visit(root: XmlElement) {
        this._visit(root, '')
    }

    private _visit(el: XmlElement, s: string) {
        // console.log(s,el.name)
        this.opts.enter(el)
        for(let ch of el.children) {
            if(ch instanceof XmlElement) {
                this._visit(ch,s+'  ')
            }
            if(ch instanceof XmlText) {
                this.opts.text(ch)
            }
        }
        this.opts.exit(el)
    }
}

let output = ""

function isInline(name: string) {
    if(name === 'b') {
        return true
    }
}


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

const visitor = new Visitor({
    enter: (e) => {
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
        output += `<${e.name}>`
    },
    text:(e:XmlText) => {
        output += e.text
    },
    exit: (e) => {
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
visitor.visit(out.children[0] as XmlElement)

const BUILD_DIR = "build"
// console.log(output)
const outfile = path.join(BUILD_DIR,path.basename(infile,path.extname(infile))+'.html')
console.log('writing to ',outfile)
await fs.writeFile(outfile,output)
// setup element mapping
// read in file
// render to output elements
// flatten output elements to HTML string
// load HTML output template
// save template to disk
