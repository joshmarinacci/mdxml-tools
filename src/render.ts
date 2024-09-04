import process from "process"
import {make_logger} from "josh_js_util"
const log = make_logger("RENDER")

// console.log("rendering out", process.argv)

const infile = process.argv[2]

log.info("reading",infile)

// setup element mapping
// read in file
// render to output elements
// flatten output elements to HTML string
// load HTML output template
// save template to disk
