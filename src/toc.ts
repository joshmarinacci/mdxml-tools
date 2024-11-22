import {XmlElement} from "@rgrove/parse-xml";
import {Block, Header} from "./markdown.js";
import {Visitor} from "./visitor.js";
import {childrenToText} from "./xml.js";
import {slugForHeader} from "./util.js";

export type TOCEntry = {
    level: number;
    text:string,
}

export async function find_xml_toc(root: XmlElement) {
    const TOC: TOCEntry[] = []
    const toc_finder = new Visitor({
        enter: async (e) => {
            if (e.name === 'h1') TOC.push({level:1, text:childrenToText(e)[0]})
            if (e.name === 'h2') TOC.push({level:2, text:childrenToText(e)[0]})
            if (e.name === 'h3') TOC.push({level:3, text:childrenToText(e)[0]})
        },
        text: async (e) => {
        },
        exit: async (e) => {
        }
    })
    await toc_finder.visit(root)
    return TOC
}

export async function find_markdown_toc(blocks: Block[]): Promise<TOCEntry[]> {
    const TOC: TOCEntry[] = []
    for (let block of blocks) {
        if (block.type === 'header') {
            const entry:TOCEntry = {
                level: (block as Header).level,
                text: block.content,
            }
            TOC.push(entry)
        }
    }
    return TOC
}

function renderTOCLink(entry: TOCEntry) {
    const slug = slugForHeader(entry.text)
    return `<a href='#${slug}' class='toc-${entry.level}'>${entry.text}</a>`
}

function renderTOCList(entries:TOCEntry[]):string {
    let depth = 0
    let output = ""
    for(let entry of entries) {
        if (entry.level > depth) {
            output += "<ul>"
            depth += 1
            output += "<li>"
            output += renderTOCLink(entry)
            continue
        }
        if (entry.level == depth) {
            output += "</li>"
            output += "<li>"
            output += renderTOCLink(entry)
            continue
        }
        if (entry.level < depth) {
            output += "</li>"
            depth -= 1
            output += "</ul>"
            output += "</li>"
            output += "<li>"
            output += renderTOCLink(entry)
            continue
        }
    }
    return output
}
export function renderTOC(toc: TOCEntry[]) {
    return `<nav class="toc">
    <ul>
    ${renderTOCList(toc)}
    </ul>
    </nav>`
}
