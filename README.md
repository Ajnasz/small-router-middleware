# small-router-middleware

Small router middleware to handle requests (similar to expresses) 

```
var router = require('small-router-middleware')();

router.get('/foo', function (req, res, next) {
	res.send('foo');
});
router.post('/foo', function (req, res, next) {
	res.send('foo');
});

require('http').createServer(router.route).listen(12345);
```
