const express = require('express');
const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');
const Promise = require('bluebird');

const guitarParser = require('./utils').guitarParser;
const guitarModel =  require('./model').model;

const config = require('./configs');

var createRouter = function() {

    const router = express.Router();

    router.get('/', function(req, res){

        var searchWord = req.query.search || '';
        searchWord = searchWord.toLowerCase().trim();

        // Fetch html from site
        request(config.startPageUrl, function(error, response, html) {

            if(!error) {
                
                var $ = cheerio.load(html);
                var id = 1;

                $('.wrapper .content').filter(function(){

                    var data = $(this);
                    var guitarList = [];
                    var result = [];

                    // Find new arrivals
                    var listOfNewStuff = data.find('h3').eq(2).find('a');

                    // Get link and img urls
                    $(listOfNewStuff).each(function(i, element){

                        var model = _.assign({},guitarModel);

                        var imgUrl = $(this).find('img').first().attr('src');

                        model.url = config.baseUrl + '/' + $(this).attr('href');
                        model.imgUrl = config.baseUrl + imgUrl.substring(1);;
                        model.id = id;
                        id++;

                        guitarList.push(model);
                    });

                    result = guitarList;

                    // find interesting stuff from guitar urls by search word
                    if(searchWord.length) {
                        result = guitarList.filter(function(item) {

                            return _.includes(item.imgUrl.toLowerCase(), searchWord.trim());

                        });
                    }

                    
                    // Get guitar title and price from subsites
                    Promise.map(result, function(item) {

                        return request.getAsync(item.url).spread(function(response,body) {
                            return guitarParser(body, item);
                        });

                    }).then(function(results) {

                        //If result is empty
                        if(_.isEmpty(results)) {
                            res.send( { msg: 'Nothing found' } );
                        }

                        var result = {
                            result_count: results.length,
                            search_word: searchWord,
                            data: results
                        };
                            
                        res.send(result);

                    }).catch(function(err) {

                        res.status(500).send({ error: 'Something failed!' });

                    });
                });

            }
        });

    });
    

    return router;

}

module.exports = createRouter;