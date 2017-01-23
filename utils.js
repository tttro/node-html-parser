const cheerio = require('cheerio');
const Promise = require('bluebird');


// HTML parser
function guitarParser(html, item) {

    return new Promise(function(resolve, reject) {

        if(!html) reject();

        let $ = cheerio.load(html);

        $('.wrapper .content').filter(function(){
            var data = $(this);
            var content = data.find('div');
            var text = '';

            content.each(function(item, el){
                text = text + " " + $(this).find('strong').text().trim();
            });

            item.text = text;

            resolve(item);
        });
    });
}

module.exports = {
    guitarParser:guitarParser
}