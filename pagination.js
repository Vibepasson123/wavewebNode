module.exports = {
    articlePaginator: function (model) {

        return (req, res, next) => {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.per_page);
            const order = req.query.order ? req.query.order : 'id';
            const sort = req.query.sort ? req.query.sort : 'asc';

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const results = {};

            if (endIndex < model.length) {
                results.next = {
                    page: page + 1,
                    per_page: limit
                }
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    per_page: limit
                }
            }
            try {
                function stringAscending(params) {
                    return function (a, b) {
                        if (a[params].toLowerCase() < b[params].toLowerCase()) return -1;
                        if (a[params].toLowerCase() > b[params].toLowerCase()) return 1;
                        return 0;

                    }
                }
                function stringDecending(params) {
                    return function (a, b) {
                        if (a[params].toLowerCase() > b[params].toLowerCase()) return -1;
                        if (a[params].toLowerCase() < b[params].toLowerCase()) return 1;
                        return 0;

                    }
                }

                function decendingOrder(params) {
                    return function (a, b) {
                        return b[params] - a[params];
                    }
                }
                function ascendingOrder(params) {
                    return function (a, b) {
                        return a[params] - b[params];
                    }
                }

                if (typeof model[0][order] === 'number') {
                    if (sort === 'desc') {
                        model.sort(decendingOrder(order));
                    } else {
                        model.sort(ascendingOrder(order));
                    }
                } else {
                    if (sort === 'desc') {
                        model.sort(stringDecending(order));
                    } else {
                        model.sort(stringAscending(order));
                    }
                }

                results.results = model.slice(startIndex, endIndex)
                res.paginatedResults = results
                next()
            } catch (e) {
                res.status(500).json({ message: e.message })
            }
        }
    }
}