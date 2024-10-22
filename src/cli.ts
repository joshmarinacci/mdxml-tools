import path from 'node:path'
import express from "express"
import {promises as fs} from "fs"
import {parseArgs} from "node:util";
import {make_logger} from "josh_js_util"
import {mkdir} from "josh_node_util"
import {doRender} from "./render.js";


type CLIOpts = {
    values: {
        resources:string
        infile:string
        outdir:string
        serve:boolean
    }
}


const log = make_logger("RENDER")

const opts = (parseArgs({
    strict:true,
    options: {
        serve: {
            type: 'string',
        },
        outdir: {
            type: 'string'
        },
        infile: {
            type:"string"
        },
        resources:{
            type:'string'
        }
    }
}) as unknown as CLIOpts)
console.log("parsed the args",opts)

// make dir
await mkdir(opts.values.outdir)

// add resources

const style_inpath = path.join(opts.values.resources,'style.css')
const style_outpath = path.join(opts.values.outdir,'style.css')
log.info("copying",style_inpath,'to',style_outpath)
await fs.cp(style_inpath,style_outpath)

const image_inpath = path.join(opts.values.resources,'redsquare.png')
const image_outpath = path.join(opts.values.outdir,'redsquare.png')
log.info("copying",image_inpath,'to',image_outpath)
await fs.cp(image_inpath,image_outpath)

log.info("parsing", opts.values.infile)
const raw_data = await fs.readFile(opts.values.infile as string)
const str = raw_data.toString('utf-8')
const output = await doRender(str)
const outfile_name = path.basename(opts.values.infile, path.extname(opts.values.infile)) + '.html'
const outfile = path.join(opts.values.outdir,
    path.basename(opts.values.infile,path.extname(opts.values.infile))+'.html')
await fs.writeFile(outfile,output)

log.info("wrote",outfile)

if(opts.values.serve) {
    const app = express()
    app.use(express.static(opts.values.outdir))
    log.info(`serving ${opts.values.outdir}`)
    const port = 3000
    const url = `http://localhost:${port}/${outfile_name}`
    log.info("open",url)
    app.listen(port)
}
