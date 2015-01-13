var url = require('url');

var router = function () {
	var routes;

	function createRoutes() {
		routes = {
			get: {},
			post: {}
		};
	}

	function toArray(arg) {
		return Array.prototype.slice.call(arg);
	}

	function curry(method) {
		var savedArgs = toArray(arguments).slice(1);
		return function () {
			method.apply(null, savedArgs.concat(toArray(arguments)));
		};
	}

	function handleRoute(type, url, handler) {
		if (!routes[type]) {
			throw new Error('Invalid route type: ' + type);
		}

		if (!routes[type][url]) {
			routes[type][url] = [];
		}

		routes[type][url].push(handler);
	}

	function decorateResponse(res) {
		res.send = function (text) {
			if (!res.statusCode) {
				res.writeHead(200, {'Content-Type': 'text/html'});
			}
			res.write(text);
			res.end();
		};
	}

	function callHandlers(req, res, handlers, index, urlMatch) {
		var handler = handlers[index];

		function next() {
			if (handlers.length > ++index) {
				callHandlers(req, res, handlers, index, urlMatch);
			}
		}

		handler(req, res, next, urlMatch);
	}

	function findHandler(routes, method, pathname) {
		if (!routes[method]) {
			return null;
		}

		var route = Object.keys(routes[method]).map(function(route) {
			var routeRegexp, matched;
			routeRegexp = route
					.replace(/\{num\}/g, '([\\d]+)')
					.replace(/\{word\}/g, '([\\w]+)');

			matched = pathname.match(new RegExp(routeRegexp));

			if (matched !== null) {
				return {
					match: matched,
					handler: routes[method][route]
				};
			}

			return null;
		}).filter(function (route) {
			return route !== null;
		});

		if (route.length > 0) {
			return route[0];
		}

		return null;
	}

	createRoutes();

	return {
		getRoutes: function () {
			return routes;
		},
		emptyRoutes: createRoutes,
		get: curry(handleRoute, 'get'),
		post: curry(handleRoute, 'post'),
		route: function (req, res) {
			var reqUrl = url.parse(req.url, true),
				method = req.method.toLowerCase(),
				handlers;

			req.url = reqUrl;

			handlers = findHandler(routes, method, req.url.pathname);

			decorateResponse(res);

			if (!handlers) {
				res.writeHead(404, {'Content-Type': 'plain/html'});
				res.end('Not found');
				return;
			}

			callHandlers(req, res, handlers.handler, 0, handlers.match);
		}
	};
};

module.exports = router;
