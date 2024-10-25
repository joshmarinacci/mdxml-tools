import {XmlDocument, XmlElement} from "@rgrove/parse-xml";
import path from "node:path";

export type Page = {
    src:string
    title:string
}
export type Resource = {
    src:string
}
export type Docset = {
    title:string
    pages:Page[]
    resources:Resource[]
}

function xmlToPage(ch: XmlElement):Page {
    return {
        title: ch.attributes['title'],
        src: ch.attributes['src']
    }
}
function xmlToResource(ch: XmlElement):Resource {
    return {
        src: ch.attributes['src']
    }
}

export function xmlToDocset(xml: XmlDocument) {
    // console.log('root is',xml.root)
    // console.log("atts is",xml.root?.attributes['title'])
    const docset:Docset = {
        title:xml.root?.attributes['title'],
        pages:xml.root?.children
            .filter(ch => ch instanceof XmlElement)
            .filter(ch => ch.name === 'page')
            .map(ch => xmlToPage(ch)),
        resources: xml.root?.children
            .filter(ch => ch instanceof XmlElement)
            .filter(ch => ch.name === 'resource')
            .map(ch => xmlToResource(ch))

    }
    return docset
}

export async function renderIndexPage(docset: Docset) {
    const pages = docset.pages.map(page => {
            return `<li><a href="${path.basename(page.src, '.xml') + ".html"}">${page.title}</a></li>`
        }
    ).join('\n')
    return `<html><body>
Pages:
<ul>
${pages}
</ul>
</body></html>`
}
