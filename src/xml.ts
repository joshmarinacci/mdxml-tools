import {XmlElement, XmlText} from "@rgrove/parse-xml";

type CodeDecoration = {
    start: number,
    end: number,
}

export function childrenToText(e: XmlElement): [string, CodeDecoration[]] {
    let decs: CodeDecoration[] = []
    let totalText = ""
    e.children.forEach(ch => {
        if (ch instanceof XmlText) {
            totalText += ch.text
            return
        }
        if (ch instanceof XmlElement) {
            let [text] = childrenToText(ch)
            decs.push({
                start: totalText.length,
                end: totalText.length + text.length,
            })
            totalText += text
        }
    })
    return [totalText, decs]
}
