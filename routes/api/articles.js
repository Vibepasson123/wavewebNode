const express = require('express');
const path = require("path");
const router = express.Router();
var fs = require('fs')
let articles = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../data/articles.json")));
let authors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../data/authors.json")));
const countries = require("../../data/countries.json");
const { json } = require('body-parser');


router.get('/', function (req, res) {

    let response = [];
    articles.forEach(article => {
        let getArticleAuthor = authors.find(author => {
            return author.id === parseInt(article.author_id)
        });
        response.push({
            id: article.id,
            tittle: article.title,
            author: getArticleAuthor.name,
            country: countries[getArticleAuthor.country_code.toLowerCase()] ? countries[getArticleAuthor.country_code.toLowerCase()] : "",
        });

    });

    res.send(response);
});

router.post('/', function (req, res) {

    let reqAuthor = req.body.authorName;
    let authorId = null;
    let queryAuth = getAuthorId(reqAuthor);
    if (queryAuth) {
        authorId = queryAuth.id;
    } else {
        authorId = Math.max.apply(Math, authors.map(function (o) { return o.id; })) + 1;
    }

    let articleId = Math.max.apply(Math, articles.map(function (o) { return o.id; })) + 1;


    try {
        const newArticale = {
            "id": articleId,
            "author_id": authorId,
            "title": req.body.title,

        }
        const newAuthor = {
            "id": authorId,
            "name": reqAuthor,
            "country_code": "",
        }

        if (!newArticale.title || !newAuthor.name) {
            return res.status(400).json({ msg: 'Please include the title,authors name' })
        }

        if (!queryAuth) {
            authors.push(newAuthor);
            fs.writeFile(path.resolve(__dirname, "../../data/authors.json"), JSON.stringify(authors), 'utf8', finished);
        }

        articles.push(newArticale);
        fs.writeFile(path.resolve(__dirname, "../../data/articles.json"), JSON.stringify(articles), 'utf8', finished);

        function finished(err) {
            return res.status(500).json({ mes: `Server error found. Please check the request` });
        }

    } catch (error) {

        return res.status(500).json({ mes: `Server error found. Please check the request` });
    }

    res.send(articles);
});

router.put('/update/:id', function (req, res) {

    let slectArticles = articles.findIndex((obj => obj.id == req.params.id));
    let requestBody = req.body;

    if (articles[slectArticles]) {
        slectArticles = articles[slectArticles];
        slectArticles.title = requestBody.title ? requestBody.title : slectArticles.title;
        slectArticles.author_id = getAuthorId(requestBody.authorName) ? getAuthorId(requestBody.authorName) : slectArticles.author_id;
    }

    fs.writeFile(path.resolve(__dirname, "../../data/articles.json"), JSON.stringify(articles), 'utf8', finished);

    res.send(articles);
});

router.delete('/:id', function (req, res) {

    let slectArticles = articles.findIndex((obj => obj.id == req.params.id));



    if (slectArticles == -1) {
        return res.status(404).json({ mes: `Article not found` });
    }
    if (!slectArticles == 0) {
        articles.splice(slectArticles, slectArticles);
    } else {
        articles.shift();
    }
    fs.writeFile(path.resolve(__dirname, "../../data/articles.json"), JSON.stringify(articles), 'utf8', finished);

    function finished(err) {
        return res.status(500).json({ mes: `Server error found. Please check the request` });
    }
    res.send(articles);


});

function getAuthorId(name) {
    if (!name) {
        return false;
    }
    return authors.find(author => {
        return author.name.replace(/ /g, '') === name.replace(/ /g, '')
    })
}


module.exports = router;