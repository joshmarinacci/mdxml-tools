import process from "process"
import path from 'path'
import {promises as fs} from "fs"
import {make_logger} from "josh_js_util"
import {doRender} from "./lib.js";

const log = make_logger("RENDER")
const infile = process.argv[2]
log.info("reading", infile)
const raw_data = await fs.readFile(infile)
const str = raw_data.toString('utf-8')

const output = await doRender(str)
const BUILD_DIR = "build"
const outfile = path.join(BUILD_DIR,path.basename(infile,path.extname(infile))+'.html')
await fs.writeFile(outfile,output)
