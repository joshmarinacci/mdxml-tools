import {promises as fs} from "fs";
import {parseXml} from "@rgrove/parse-xml";

export function make_inset(count:number) {
    let str = ""
    for(let i=0; i<count; i++) {
        str += "  "
    }
    return str
}
export async function loadXml(infile: string) {
    // log.info("parsing", infile)
    const raw_data = await fs.readFile(infile as string)
    const str = raw_data.toString('utf-8')
    return parseXml(str, {includeOffsets: true})
}

export function slugForHeader(title: string) {
    return title.replaceAll(' ', '_').toLowerCase()
}
