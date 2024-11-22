import {XmlElement, XmlText} from "@rgrove/parse-xml";

type VisitorCallback = (e: XmlElement) => Promise<void>
type VisitorTextCallback = (e: XmlText) => Promise<void>
type VisitorOptions = {
    enter: VisitorCallback,
    text: VisitorTextCallback,
    exit: VisitorCallback,
}

export class Visitor {
    private opts: VisitorOptions;

    constructor(opts: VisitorOptions) {
        this.opts = opts
    }

    async visit(root: XmlElement) {
        await this._visit(root, '')
    }

    private async _visit(el: XmlElement, s: string) {
        // console.log(s,el.name)
        await this.opts.enter(el)
        for (let ch of el.children) {
            if (ch instanceof XmlElement) {
                await this._visit(ch, s + '  ')
            }
            if (ch instanceof XmlText) {
                await this.opts.text(ch)
            }
        }
        await this.opts.exit(el)
    }
}
