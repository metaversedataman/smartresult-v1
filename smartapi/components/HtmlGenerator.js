const Mustache = require('mustache')

const htmlGenerator = (json, template) => {
    let data  = {};

    if(typeof json == 'string') {
        data = JSON.parse(json)
    } else {
        data = json;
    }
    
    const html = Mustache.render(template, data)

    return html
}

module.exports = {
    HtmlGenerator: htmlGenerator
}