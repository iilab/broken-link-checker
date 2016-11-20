"use strict";
const helpers    = require("./helpers");
const requestUrl = require("../lib/internal/requestUrl");

const expect = require("chai").expect;
const URL = require("whatwg-url").URL;



describe("INTERNAL -- requestUrl", function()
{
	before(() => helpers.startServer("http://blc/"));
	after(helpers.stopServers);
	
	
	
	it("resolves a promise", function(done)
	{
		const auth = {};
		const options = helpers.options();
		const url = new URL("http://blc/normal/index.html");
		
		requestUrl(url, auth, "get", options).then(result => done());
	});
	
	
	
	it("receives a GET stream", function()
	{
		const auth = {};
		const options = helpers.options();
		const url = new URL("http://blc/normal/index.html");
		
		return requestUrl(url, auth, "get", options).then(result =>
		{
			expect(result.response).to.be.like(
			{
				headers: { "content-type": "text/html" },
				status: 200,
				statusText: null,
				//url:  { href:"http://blc:80/normal/index.html" },
				redirects: [],
			});
			
			expect(result.stream).to.be.an.instanceOf(Object);
		});
	});
	
	
	
	it("does not receive a HEAD stream", function()
	{
		const auth = {};
		const options = helpers.options();
		const url = new URL("http://blc/normal/index.html");
		
		return requestUrl(url, auth, "head", options).then(result =>
		{
			expect(result.response).to.be.like(
			{
				headers: { "content-type": "text/html" },
				status: 200,
				statusText: null,
				//url:  { href:"http://blc:80/normal/index.html" },
				redirects: [],
			});
			
			expect(result).to.not.have.property("stream");
		});
	});
	
	
	
	// TODO :: results in "socket hang up" econnreset error
	it.skip("does not receive a PSEUDO-HEAD stream", function()
	{
		const auth = {};
		const options = helpers.options();
		const url = new URL("http://blc/normal/index.html");
		
		return requestUrl(url, auth, "pseudo-head", options).then(result =>
		{
			expect(result.response).to.be.like(
			{
				headers: { "content-type": "text/html" },
				status: 200,
				statusText: null,
				//url:  { href:"http://blc:80/normal/index.html" },
				redirects: [],
			});
			
			expect(result).to.not.have.property("stream");
		});
	});
	
	
	
	it("supports a redirect", function()
	{
		const auth = {};
		const options = helpers.options();
		const url = new URL("http://blc/redirect/redirect.html");
		//const url = new URL("http://blc/normal/index.html");
		
		return requestUrl(url, auth, "get", options).then(result =>
		{
			expect(result.response).to.be.like(
			{
				headers: { "content-type": "text/html" },
				status: 200,
				statusText: null,
				url: { href:"http://blc/redirect/redirected.html" },
				redirects:
				[
					{
						headers: { location:"/redirect/redirect2.html" },
						status: 302,
						statusText: null,
						url: { href:"http://blc/redirect/redirect.html" }
					},
					{
						headers: { location:"/redirect/redirected.html" },
						status: 301,
						statusText: null,
						url: { href:"http://blc/redirect/redirect2.html" }
					}
				],
			});
			
			expect(result.stream).to.be.an.instanceOf(Object);
		});
	});
});
