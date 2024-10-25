import path from 'node:path'
import express from "express"
import {promises as fs} from "fs"
import {parseArgs} from "node:util";
import {make_logger} from "josh_js_util"
import {mkdir} from "josh_node_util"
import {doRender} from "./render.js";
import {spawn} from "node:child_process";
import {parseXml} from "@rgrove/parse-xml";
import {renderIndexPage, xmlToDocset} from "./docset.js";

type CLIOpts = {
    values: {
        resources: string
        infile: string
        outdir: string
        serve: boolean
        browser: boolean
        docset: boolean
    }
}


const log = make_logger("RENDER")

const opts = (parseArgs({
    strict: true,
    options: {
        serve: {
            type: 'boolean',
        },
        outdir: {
            type: 'string'
        },
        infile: {
            type: "string"
        },
        resources: {
            type: 'string'
        },
        browser: {
            type: 'boolean',
            default: false
        },
        docset: {
            type: 'boolean',
            default: false
        }
    }
}) as unknown as CLIOpts)
console.log("parsed the args", opts)

// make dir
await mkdir(opts.values.outdir)

async function loadXml(infile: string) {
    log.info("parsing", infile)
    const raw_data = await fs.readFile(infile as string)
    const str = raw_data.toString('utf-8')
    const xml = parseXml(str, {includeOffsets: true})
    return xml
}

async function renderDocset(opts: CLIOpts) {
    const xml = await loadXml(opts.values.infile)
    const docset = xmlToDocset(xml)
    console.log('docset', docset)
    // copy style
    await copyStyles(opts)
    // render each page
    for (let page of docset.pages) {
        let page_path = path.join(path.dirname(opts.values.infile), page.src)
        console.log("page path", page_path)
        const str = (await fs.readFile(page_path)).toString("utf8");
        const url_map = new Map<string,string>
        url_map.set('page1.xml','page1.html')
        url_map.set('page2.xml','page2.html')
        const output = await doRender(str, url_map)
        const page_out_path = path.join(opts.values.outdir, path.basename(page.src, path.extname(page.src)) + '.html')
        console.log('writing out to', page_out_path)
        await fs.writeFile(page_out_path, output)
    }
    for(let res of docset.resources) {
        let res_path = path.join(path.dirname(opts.values.infile), res.src)
        let res_out_path = path.join(opts.values.outdir,res.src)
        await mkdir(path.dirname(res_out_path))
        await fs.cp(res_path, res_out_path, {
            recursive:true
        })
    }
    // render index page
    const index_output = await renderIndexPage(docset)
    const index_out_path = path.join(opts.values.outdir, "index.html")
    await fs.writeFile(index_out_path, index_output)
}

async function serveDocs(outfile_name: string) {
    const app = express()
    app.use(express.static(opts.values.outdir))
    log.info(`serving ${opts.values.outdir}`)
    const port = 3000
    const url = `http://localhost:${port}/${outfile_name}`
    log.info("open", url)
    app.listen(port)
    if (opts.values.browser) {
        log.info("opening the browser to", url)
        spawn('open', [url])
    }
}

async function copyStyles(opts: CLIOpts) {
    const style_inpath = path.join(opts.values.resources, 'style.css')
    const style_outpath = path.join(opts.values.outdir, 'style.css')
    log.info("copying", style_inpath, 'to', style_outpath)
    await fs.cp(style_inpath, style_outpath)
}

// add resources
if (opts.values.docset) {
    let index_path = await renderDocset(opts)
    if (opts.values.serve) {
        await serveDocs("index.html")
    }
} else {
    await copyStyles(opts)

    const image_inpath = path.join(opts.values.resources, 'redsquare.png')
    const image_outpath = path.join(opts.values.outdir, 'redsquare.png')
    log.info("copying", image_inpath, 'to', image_outpath)
    await fs.cp(image_inpath, image_outpath)

    log.info("parsing", opts.values.infile)
    const raw_data = await fs.readFile(opts.values.infile as string)
    const str = raw_data.toString('utf-8')
    const output = await doRender(str, new Map())
    const outfile_name = path.basename(opts.values.infile, path.extname(opts.values.infile)) + '.html'
    const outfile = path.join(opts.values.outdir,
        path.basename(opts.values.infile, path.extname(opts.values.infile)) + '.html')
    await fs.writeFile(outfile, output)

    log.info("wrote", outfile)
    if (opts.values.serve) {
        await serveDocs(outfile_name)
    }
}

