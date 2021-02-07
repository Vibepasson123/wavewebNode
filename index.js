const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pagination = require("./pagination");
const app = express();
const port = 3000;
let articles = require("./data/articles.json");

const baseMiddlewares = [
  bodyParser.json({
    limit: "20mb"
  })
]
app.get('/api/articles/paginations', pagination.articlePaginator(articles), (req, res) => {
  res.send(res.paginatedResults)
})

app.use(baseMiddlewares);
app.use(express.urlencoded({ extended: false }))
app.use('/api/articles', require('./routes/api/articles'))

app.listen(port, () => console.log(`App listening on http://127.0.0.1:${port}`));