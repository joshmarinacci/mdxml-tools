import {XmlDocument, XmlElement} from "@rgrove/parse-xml";

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

export function xmlToDocset(xml: XmlDocument):Docset {
    if (!xml.root) throw new Error("docset.xml missing root")
    if (!xml.root.attributes) throw new Error("docset.xml missing attributes")
    if (!xml.root.attributes['title']) throw new Error("docset.xml missing 'title' attribute")
    return {
        title: xml.root?.attributes['title'],
        pages: xml.root?.children
            .filter(ch => ch instanceof XmlElement)
            .filter(ch => ch.name === 'page')
            .map(ch => xmlToPage(ch)),
        resources: xml.root?.children
            .filter(ch => ch instanceof XmlElement)
            .filter(ch => ch.name === 'resource')
            .map(ch => xmlToResource(ch))

    }
}


type TransformCallback = (e:XmlElement, doNext:() => string) => string
function transform(e:XmlElement, rules:Record<string,TransformCallback>) {
    if(rules[e.name]) {
        const cb = () => {
            let out = ""
            for(let ch of e.children) {
                if(ch.type === 'element') {
                    const el:XmlElement = ch as XmlElement
                    out += transform(el,rules)
                }
            }
            return out
        }
        return rules[e.name](e, cb)
    } else {
        console.warn("no rule for", e.name)
        return ""
    }
}

const index_template = (docset:Docset,content:string) => {
    return `<html>
<head>
    <title>${docset.title}</title>
    <link rel="stylesheet" href="./style.css"/>
</head>
<body>
<nav class='docset'>
<ul>
${content}
</ul>
</nav>
<h1>${docset.title}</h1>
</body>
</html>`
}

export async function renderIndexPage(docset: Docset, root: XmlDocument, url_map: Map<any, any>) {
    const output = transform(root.root as XmlElement, {
        'docset':(e,children) => index_template(docset,children()),
        'page':(e) => `<li><a href="${url_map.get(e.attributes.src)}">${e.attributes.title}</a></li>\n`,
        "resource":(e,c) => ""
    })
    console.log("the output is",output)
    return output
/*    const pages = docset.pages.map(page => {
            return `<li><a href="${path.basename(page.src, '.xml') + ".html"}">${page.title}</a></li>`
        }
    ).join('\n')
    return `<html>
<head>
    <title>${docset.title}</title>
    <link rel="stylesheet" href="./style.css"/>
</head>
<body>
Pages:
<ul>
${pages}
</ul>
</body></html>`*/
}
