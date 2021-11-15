import {TaskFunction} from "puppeteer-cluster/dist/Cluster";
import cheerio, {CheerioAPI} from "cheerio";
import {LighthouseTaskArgs, LighthouseTaskReturn} from "../../../types";
import {Page} from "puppeteer";
import fs from "fs";

export const inspectHtmlTask: TaskFunction<LighthouseTaskArgs, LighthouseTaskReturn> = async(props) => {
    const {page, data} = props
    const {routeReport} = data

    let html: string

    // basic caching based on saving html payloads
    if (fs.existsSync(routeReport.htmlPayload)) {
        html = fs.readFileSync(routeReport.htmlPayload, { encoding: 'utf-8' })
    } else {
        html = await extractHtmlPayload(page, routeReport.route.url)
        fs.writeFileSync(routeReport.htmlPayload, html)
    }

    const $ = cheerio.load(html)
    routeReport.seo = processSeoMeta($)
    return routeReport
}

export const extractHtmlPayload: (page: Page, route: string) => Promise<string> = async(page, route) => {
    // get page html content
    const pageVisit = await page.goto(route, { waitUntil: 'domcontentloaded' })
    return await pageVisit.text()
}

export const processSeoMeta = ($: CheerioAPI) => {
    const ogImage = $('meta[property=\'og:image\']').attr('content')
    return {
        title: $('head > title').text(),
        description: $('meta[name=\'description\']').attr('content'),
        image: $('meta[property=\'image\']').attr('content') || ogImage,
        og: {
            image: ogImage,
            description: $('meta[property=\'og:description\']').attr('content'),
            title: $('meta[property=\'og:title\']').attr('content')
        }
    }
}