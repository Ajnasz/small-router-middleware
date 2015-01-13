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
router.post('/foo/{num}/{word}', function (req, res, next, args) {
	// if called '/foo/123/bar
	// args[0] = '/foo/123/bar
	// args[1] = '123'
	// args[2] = 'bar
	res.send('foo');
});

require('http').createServer(router.route).listen(12345);
```
