import {promises as fs} from "fs";
import {parseXml} from "@rgrove/parse-xml";

export async function loadXml(infile: string) {
    // log.info("parsing", infile)
    const raw_data = await fs.readFile(infile as string)
    const str = raw_data.toString('utf-8')
    return parseXml(str, {includeOffsets: true})
}
