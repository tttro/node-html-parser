import cheerio from 'cheerio';
import Promise from 'bluebird';


// HTML parser
function guitarParser(html, item) {
    return new Promise((resolve, reject)  => {

        if (!html) reject('no html');


        let $ = cheerio.load(html);

        $('.wrapper .content').filter((index, data) => {

            let content = $(data).find('div');
            let text = '';

            content.each(function(item, el){
                text = text + " " + $(el).find('strong').text().trim();
            });

            item.text = text;

            resolve(item);
        });
    });
}

export default guitarParser;