"use strict";
const checkUrl = require("../lib/internal/checkUrl");
const helpers  = require("./helpers");
const Link     = require("../lib/internal/Link");

const expect = require("chai").expect;
const UrlCache = require("urlcache");



describe("INTERNAL -- checkUrl", function()
{
	before( function()
	{
		helpers.startServers("http://blc/", "https://blc:81/");
		helpers.startDeadServer("http://blc:82/");
	});
	
	
	
	after(helpers.stopServers);
	
	
	
	it("resolves a promise", function(done)
	{
		const auth = {};
		const cache = new UrlCache();
		const options = helpers.options();
		const link = Link.resolve(Link.create(),
			"http://blc/normal/no-links.html",
			"http://blc/"
		);
		
		checkUrl(link, auth, cache, options).then(result => done());
	});
	
	
	
	describe("shall not be broken with a REAL HOST and REAL PATH from", function()
	{
		it("an absolute url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc/normal/no-links.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "http://blc/normal/no-links.html",
						resolved:   { href:"http://blc/normal/no-links.html" },
						rebased:    { href:"http://blc/normal/no-links.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" }
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc/normal/no-links.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:               "//blc/normal/no-links.html",
						resolved:   { href:"http://blc/normal/no-links.html" },
						rebased:    { href:"http://blc/normal/no-links.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" } 
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/normal/no-links.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                    "/normal/no-links.html",
						resolved:   { href:"http://blc/normal/no-links.html" },
						rebased:    { href:"http://blc/normal/no-links.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" } 
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"normal/no-links.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                     "normal/no-links.html",
						resolved:   { href:"http://blc/normal/no-links.html" },
						rebased:    { href:"http://blc/normal/no-links.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" } 
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc/normal/no-links.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                                         "?query",
						resolved:   { href:"http://blc/normal/no-links.html?query" },
						rebased:    { href:"http://blc/normal/no-links.html?query" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/normal/no-links.html" },
						rebased:  { href:"http://blc/normal/no-links.html" } 
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc/normal/no-links.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                                         "#hash",
						resolved:   { href:"http://blc/normal/no-links.html#hash" },
						rebased:    { href:"http://blc/normal/no-links.html#hash" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/normal/no-links.html" },
						rebased:  { href:"http://blc/normal/no-links.html" } 
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("an empty url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc/normal/no-links.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "",
						resolved:   { href:"http://blc/normal/no-links.html" },
						rebased:    { href:"http://blc/normal/no-links.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/normal/no-links.html" },
						rebased:  { href:"http://blc/normal/no-links.html" } 
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
	});
	
	
	
	describe("shall be broken with a REAL HOST and FAKE PATH from", function()
	{
		it("an absolute url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc/normal/fake.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "http://blc/normal/fake.html",
						resolved:   { href:"http://blc/normal/fake.html" },
						rebased:    { href:"http://blc/normal/fake.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" } 
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc/normal/fake.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:               "//blc/normal/fake.html",
						resolved:   { href:"http://blc/normal/fake.html" },
						rebased:    { href:"http://blc/normal/fake.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" } 
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/normal/fake.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                    "/normal/fake.html",
						resolved:   { href:"http://blc/normal/fake.html" },
						rebased:    { href:"http://blc/normal/fake.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" } 
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"normal/fake.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                     "normal/fake.html",
						resolved:   { href:"http://blc/normal/fake.html" },
						rebased:    { href:"http://blc/normal/fake.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" } 
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc/normal/fake.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                                     "?query",
						resolved:   { href:"http://blc/normal/fake.html?query" },
						rebased:    { href:"http://blc/normal/fake.html?query" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/normal/fake.html" },
						rebased:  { href:"http://blc/normal/fake.html" } 
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc/normal/fake.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                                     "#hash",
						resolved:   { href:"http://blc/normal/fake.html#hash" },
						rebased:    { href:"http://blc/normal/fake.html#hash" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/normal/fake.html" },
						rebased:  { href:"http://blc/normal/fake.html" } 
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("an empty url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc/normal/fake.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "",
						resolved:   { href:"http://blc/normal/fake.html" },
						rebased:    { href:"http://blc/normal/fake.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc/normal/fake.html" },
						rebased:  { href:"http://blc/normal/fake.html" } 
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
	});
	
	
	
	// Technically it's a real host with a fake port, but same goal
	// and faster than testing a remote http://asdf1234.asdf1234
	describe("shall be broken with a FAKE HOST from", function()
	{
		it("an absolute url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc:82/path/to/resource.html",
				"http://blc:82/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "http://blc:82/path/to/resource.html",
						resolved:   { href:"http://blc:82/path/to/resource.html" },
						rebased:    { href:"http://blc:82/path/to/resource.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc:82/" },
						rebased:  { href:"http://blc:82/" } 
					},
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc:82/path/to/resource.html",
				"http://blc:82/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:               "//blc:82/path/to/resource.html",
						resolved:   { href:"http://blc:82/path/to/resource.html" },
						rebased:    { href:"http://blc:82/path/to/resource.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc:82/" },
						rebased:  { href:"http://blc:82/" } 
					},
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/path/to/resource.html",
				"http://blc:82/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                       "/path/to/resource.html",
						resolved:   { href:"http://blc:82/path/to/resource.html" },
						rebased:    { href:"http://blc:82/path/to/resource.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc:82/" },
						rebased:  { href:"http://blc:82/" } 
					},
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"path/to/resource.html",
				"http://blc:82/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                        "path/to/resource.html",
						resolved:   { href:"http://blc:82/path/to/resource.html" },
						rebased:    { href:"http://blc:82/path/to/resource.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc:82/" },
						rebased:  { href:"http://blc:82/" } 
					},
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc:82/path/to/resource.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                                             "?query",
						resolved:   { href:"http://blc:82/path/to/resource.html?query" },
						rebased:    { href:"http://blc:82/path/to/resource.html?query" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc:82/path/to/resource.html" },
						rebased:  { href:"http://blc:82/path/to/resource.html" } 
					},
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc:82/path/to/resource.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:                                             "#hash",
						resolved:   { href:"http://blc:82/path/to/resource.html#hash" },
						rebased:    { href:"http://blc:82/path/to/resource.html#hash" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc:82/path/to/resource.html" },
						rebased:  { href:"http://blc:82/path/to/resource.html" } 
					},
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
			});
		});
		
		
		
		it("an empty url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc:82/path/to/resource.html"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "",
						resolved:   { href:"http://blc:82/path/to/resource.html" },
						rebased:    { href:"http://blc:82/path/to/resource.html" },
						redirected:        null
					},
					base:
					{
						resolved: { href:"http://blc:82/path/to/resource.html" },
						rebased:  { href:"http://blc:82/path/to/resource.html" } 
					},
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
			});
		});
	});
	
	
	
	describe("shall be broken with NO HOST from", function()
	{
		it("an absolute url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "http://",
						resolved: null,
						rebased: null,
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null 
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc/normal/no-links.html",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "//blc/normal/no-links.html",
						resolved: null,
						rebased: null,
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/normal/no-links.html",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "/normal/no-links.html",
						resolved: null,
						rebased: null,
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"normal/no-links.html",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "normal/no-links.html",
						resolved: null,
						rebased: null,
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "?query",
						resolved: null,
						rebased: null,
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "#hash",
						resolved: null,
						rebased: null,
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("an empty url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "",
						resolved: null,
						rebased: null,
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
	});
	
	
	
	describe("shall be broken from", function()
	{
		it("a data uri", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
						resolved: {},
						rebased: {},
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a tel uri", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"tel:+5-555-555-5555",
				null
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "tel:+5-555-555-5555",
						resolved: {},
						rebased: {},
						redirected: null
					},
					base:
					{
						resolved: null,
						rebased: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
	});
	
	
	
	describe("shall not be broken with a REDIRECTED url", function()
	{
		it("containing no query or hash", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc/redirect/redirect.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "http://blc/redirect/redirect.html",
						resolved:   { href:"http://blc/redirect/redirect.html" },
						rebased:    { href:"http://blc/redirect/redirect.html" },
						redirected: { href:"http://blc/redirect/redirected.html" }
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" }
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(2);
			});
		});
		
		
		
		it("containing a query", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc/redirect/redirect.html?query",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "http://blc/redirect/redirect.html?query",
						resolved:   { href:"http://blc/redirect/redirect.html?query" },
						rebased:    { href:"http://blc/redirect/redirect.html?query" },
						redirected: { href:"http://blc/redirect/redirected.html" },
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" }
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(2);
			});
		});
		
		
		
		it("containing a hash", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc/redirect/redirect.html#hash",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:          "http://blc/redirect/redirect.html#hash",
						resolved:   { href:"http://blc/redirect/redirect.html#hash" },
						rebased:    { href:"http://blc/redirect/redirect.html#hash" },
						redirected: { href:"http://blc/redirect/redirected.html" }
					},
					base:
					{
						resolved: { href:"http://blc/" },
						rebased:  { href:"http://blc/" }
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(2);
			});
		});
	});
		
	
	
	describe("caching", function()
	{
		it("stores the response", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ cacheResponses:true });
			const link = Link.resolve(Link.create(),
				"http://blc/normal/no-links.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options)
			.then(result => cache.get("http://blc/normal/no-links.html"))
			.then(response => expect(response).to.be.an("object"));
		});
		
		
		
		it("stores the response of a redirected url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ cacheResponses:true });
			const link = Link.resolve(Link.create(),
				"http://blc/redirect/redirect.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options)
			.then(result => cache.get("http://blc/redirect/redirect.html"))
			.then(response => expect(response).to.be.an("object"))
			.then(() => cache.get("http://blc/redirect/redirected.html"))
			.then(response => expect(response).to.be.an("object"));
		});
		
		
		
		it("does not store the error from an erroneous url", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ cacheResponses:true });
			const link = Link.resolve(Link.create(),
				"/normal/fake.html",
				null
			);
			
			return checkUrl(link, auth, cache, options)
			.then(result => cache.get("/normal/fake.html"))
			.then(response => expect(response).to.be.undefined);
		});
		
		
		
		it("requests a unique url only once", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ cacheResponses:true });
			let link = Link.resolve(Link.create(),
				"http://blc/normal/no-links.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options)
			.then(result => cache.get("http://blc/normal/no-links.html"))
			.then(response => response._cached = true)
			.then(() =>
			{
				// Check URL again
				link = Link.resolve(Link.create(),
					"http://blc/normal/no-links.html",
					"http://blc/"
				);
				
				return checkUrl(link, auth, cache, options);
			})
			.then(() => cache.get("http://blc/normal/no-links.html"))
			.then(response => expect(response._cached).to.be.true);
		});
	});
	
	
	
	describe("options", function()
	{
		it("acceptedSchemes = []", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ acceptedSchemes:[] });
			const link = Link.resolve(Link.create(),
				"http://blc/normal/no-links.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null
				});
			});
		});
		
		
		
		it('acceptedSchemes = ["http:","https:"]', function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ acceptedSchemes:["http:","https:"] });
			
			function link(url)
			{
				return Link.resolve(Link.create(), url);
			}
			
			return checkUrl(link("http://blc/normal/no-links.html"), auth, cache, options)
			.then(result => expect(result).to.be.like(
			{
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null
			}))
			.then(() => checkUrl(link("https://blc:81/normal/no-links.html"), auth, cache, options))
			.then(result => expect(result).to.be.like(
			{
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null
			}));
		});
		
		
		
		it("retry405Head = false", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc/method-not-allowed/head.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					broken: true,
					brokenReason: "HTTP_405",
					excluded: null,
					excludedReason: null
				});
			});
		});
		
		
		
		it("retry405Head = false (#2)", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ requestMethod:"get" });
			const link = Link.resolve(Link.create(),
				"http://blc/method-not-allowed/any.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					broken: true,
					brokenReason: "HTTP_405",
					excluded: null,
					excludedReason: null
				});
			});
		});
		
		
		
		it("retry405Head = true", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ retry405Head:true });
			const link = Link.resolve(Link.create(),
				"http://blc/method-not-allowed/head.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null
				});
			});
		});
		
		
		
		it("retry405Head = true (#2)", function()
		{
			const auth = {};
			const cache = new UrlCache();
			const options = helpers.options({ retry405Head:true });
			const link = Link.resolve(Link.create(),
				"http://blc/method-not-allowed/any.html",
				"http://blc/"
			);
			
			return checkUrl(link, auth, cache, options).then(result =>
			{
				expect(result).to.be.like(
				{
					broken: true,
					brokenReason: "HTTP_405",
					excluded: null,
					excludedReason: null
				});
			});
		});
	});
});
