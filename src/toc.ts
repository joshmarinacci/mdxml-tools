import {XmlElement} from "@rgrove/parse-xml";
import {Block, Header} from "./markdown.js";
import { Visitor } from "./visitor.js";
import {childrenToText} from "./xml.js";

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
            console.log("found a header",block)
            const entry:TOCEntry = {
                level: (block as Header).level,
                text: block.content,
            }
            TOC.push(entry)
        }
    }
    return TOC
}
