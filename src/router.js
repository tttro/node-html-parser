import express from 'express';
import cheerio from 'cheerio';
import _ from 'lodash';
import Promise from 'bluebird';
import req from 'request';
const request = Promise.promisifyAll(req, {multiArgs: true});

import guitarParser from './utils';
import guitarModel from './model';

import config from './configs';

let createRouter = function() {

    const router = express.Router();

    /**
     * API
     * qs: search=<string>
     */
    router.get('/', (req, res) => {

        // api?search=
        let searchWord = req.query.search || '';
        searchWord = searchWord.toLowerCase().trim();

        // Fetch html from site
        request(config.startPageUrl, (error, response, html) => {

            if (!error) {
                
                var $ = cheerio.load(html);
                let id = 1;

                // Get specific data from DOM
                $('.wrapper .content').filter((ind,data) => {

                    let guitarList = [];
                    let result = [];

                    // Find guitars from html
                    let listOfNewStuff = $(data).find('h3').eq(2).find('a');

                    // Get link and img urls
                    $(listOfNewStuff).each((index, element) => {

                        let model = _.assign({}, guitarModel);

                        let imgUrl = $(element).find('img').first().attr('src');

                        model.url = config.baseUrl + '/' + $(element).attr('href');
                        model.imgUrl = config.baseUrl + imgUrl.substring(1);
                        model.id = id;
                        id++;

                        guitarList.push(model);
                    });

                    result = guitarList;


                    // find interesting stuff from guitar urls by search word
                    if (searchWord.length) {
                        result = guitarList.filter((item) => {

                            return _.includes(item.imgUrl.toLowerCase(), searchWord.trim());

                        });
                    }


                    // Get guitar title and price from subsites
                    Promise.map(result, (item) => {
                        return request.getAsync(item.url)
                            .spread((response,body) => {
                                return guitarParser(body, item);
                             });

                    }).then((results)  => {

                        //If result is empty
                        if (_.isEmpty(results)) {
                            return res.send( { msg: 'Nothing found' } );
                        }

                        let resultModel = {
                            result_count: results.length,
                            search_word: searchWord,
                            data: results
                        };

                         return res.send(resultModel);

                    }).catch((err) => {

                         return res.status(500).send({ error: 'Something failed!' });

                    });


                });

            }
        });

    });

    return router;

};

export default createRouter;