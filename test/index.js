var routerFactory = require('../index');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('router', function () {
	var router;
	setup(function () {
		router = routerFactory();
	});
	teardown(function () {
		router.emptyRoutes();
		router = null;
	});

	describe('object', function () {
		it('should be object', function () {
			assert.isObject(router);
		});

		it('should have a get method', function () {
			assert.isFunction(router.get);
		});

		it('should have a post method', function () {
			assert.isFunction(router.post);
		});

		it('should have a route method', function () {
			assert.isFunction(router.route);
		});
	});

	describe('get', function () {
		it('should add something to routes', function () {
			router.get('/foo', function () {});
			assert.isArray(router.getRoutes().get['/foo']);
		});
		it('should add my function to routes', function () {
			var f = sinon.spy();
			router.get('/foo', f);
			assert.equal(router.getRoutes().get['/foo'][0], f);
		});
	});

	describe('post', function () {
		it('should add something to routes', function () {
			router.post('/foo', function () {});
			assert.isArray(router.getRoutes().post['/foo']);
		});
		it('should add my function to routes', function () {
			var f = sinon.spy();
			router.post('/foo', f);
			assert.equal(router.getRoutes().post['/foo'][0], f);
		});
	});

	describe('route', function () {
		var req, res, reqMock, resMock;

		setup(function () {

			req = {
				method: 'GET',
				url: '/foo?bar=baz'
			};

			res = {
				writeHead: function () {},
				write: function () {},
				end: function () {}
			}
			reqMock = sinon.mock(req);
			resMock = sinon.mock(res);
		});
		teardown(function () {
			reqMock.restore();
			resMock.restore();
			req = null;
			res = null;
		});

		describe('req.url', function () {
			it('be changed to a object', function () {
				router.route(req, res);
				assert.isObject(req.url);
			});

			it('should have path string', function () {
				router.route(req, res);
				assert.isString(req.url.pathname);
				assert.equal(req.url.pathname, '/foo');
			});

		});

		describe('res', function () {
			it('should have a send function', function () {
				router.route(req, res);
				assert.isFunction(res.send);
			});

			describe('send', function () {
				it('should call write and end', function () {
					router.route(req, res);
					var text = String(Math.random());
					resMock.expects('write').calledWith(text);
					resMock.expects('end').once();
					res.send(text);
					resMock.verify();
				});
			});
		});

		it('should call first handler, with req and res', function () {
			var spy = sinon.spy();
			router.get('/foo', spy);

			router.route(req, res);

			sinon.assert.calledOnce(spy, req, res);
		});

		it('should call second handler, if third argument called', function () {
			var stub1 = sinon.stub().callsArg(2),
				stub2 = sinon.stub().callsArg(2);

			router.get('/foo', stub1);
			router.get('/foo', stub2);

			router.route(req, res);

			sinon.assert.calledOnce(stub1);
			sinon.assert.calledOnce(stub2);
		});

		it('should not call second handler, res.send was called before', function () {
			var stub1 = sinon.stub().yieldsTo('send', 'foo'),
				stub2 = sinon.stub().callsArg(2);

			resMock.expects('write').once();
			router.get('/foo', stub1);
			router.get('/foo', stub2);

			router.route(req, res);

			resMock.verify();

			sinon.assert.calledOnce(stub1);
			sinon.assert.notCalled(stub2);
		});

	});
});
