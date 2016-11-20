"use strict";
const parseOptions   = require("../internal/parseOptions");
const streamHtml     = require("../internal/streamHtml");
const transitiveAuth = require("../internal/transitiveAuth");

const HtmlChecker = require("./HtmlChecker");

const maybeCallback = require("maybe-callback");
const RequestQueue = require("limited-request-queue");
const RobotDirectives = require("robot-directives");
const specurl = require("specurl");



class HtmlUrlChecker
{
	constructor(options, handlers={})
	{
		reset(this);
		
		this.handlers = handlers;
		this.options = options = parseOptions(options);
		
		this.htmlUrlQueue = new RequestQueue(
		{
			maxSockets: 1,
			rateLimit: this.options.rateLimit
		},
		{
			item: (input, done) =>
			{
				reset(this);
				
				this.currentAuth = input.data.auth;
				this.currentCustomData = input.data.customData;
				this.currentDone = done;
				this.currentPageUrl = input.url;  // TODO :: remove hash ?
				
				streamHtml(this.currentPageUrl, this.currentAuth, this.__getCache(), this.options).then(result =>
				{
					this.currentResponse = result.response;
					
					this.currentRobots = new RobotDirectives({ userAgent: this.options.userAgent });
					
					robotHeaders(this);
					
					// Passes robots instance so that headers are included in robot exclusion checks
					this.htmlChecker.scan(result.stream, result.response.url, this.currentRobots, this.currentAuth);
				})
				.catch(error => completedPage(this, error));
			},
			end: () =>
			{
				// Clear references for garbage collection
				reset(this);
				
				maybeCallback(this.handlers.end)();
			}
		});
		
		this.htmlChecker = new HtmlChecker(this.options,
		{
			html: (tree, robots) =>
			{
				maybeCallback(this.handlers.html)(tree, robots, this.currentResponse, this.currentPageUrl, this.currentCustomData);
			},
			
			// Undocumented handler for excluding links via custom constraints
			_filter: result => maybeCallback(this.handlers._filter)(result),
			
			junk: result => maybeCallback(this.handlers.junk)(result, this.currentCustomData),
			link: result => maybeCallback(this.handlers.link)(result, this.currentCustomData),
			
			complete: () => completedPage(this, null)
		});
	}
	
	
	
	clearCache()
	{
		return this.htmlChecker.clearCache();
	}
	
	
	
	dequeue(id)
	{
		return this.htmlUrlQueue.dequeue(id);
	}
	
	
	
	// `auth` is undocumented and for internal use only
	enqueue(pageUrl, customData, auth)
	{
		const transitive = transitiveAuth(pageUrl, auth);
		
		return this.htmlUrlQueue.enqueue(
		{
			url: transitive.url,
			data: { auth:transitive.auth, customData }
		});
	}
	
	
	
	numActiveLinks()
	{
		return this.htmlChecker.numActiveLinks();
	}
	
	
	
	numPages()
	{
		return this.htmlUrlQueue.length();
	}
	
	
	
	numQueuedLinks()
	{
		return this.htmlChecker.numQueuedLinks();
	}
	
	
	
	pause()
	{
		this.htmlChecker.pause();
		return this.htmlUrlQueue.pause();
	}
	
	
	
	resume()
	{
		this.htmlChecker.resume();
		return this.htmlUrlQueue.resume();
	}
	
	
	
	__getCache()
	{
		return this.htmlChecker.__getCache();
	}
}



//::: PRIVATE FUNCTIONS



function completedPage(instance, error)
{
	maybeCallback(instance.handlers.page)(error, instance.currentPageUrl, instance.currentCustomData);
	
	// Auto-starts next queue item, if any
	// If not, fires "end"
	instance.currentDone();
}



function reset(instance)
{
	instance.currentAuth = null;
	instance.currentCustomData = null;
	instance.currentDone = null;
	instance.currentPageUrl = null;
	instance.currentResponse = null;
	instance.currentRobots = null;
}



function robotHeaders(instance)
{
	// TODO :: https://github.com/joepie91/node-bhttp/issues/20
	// TODO :: https://github.com/nodejs/node/issues/3591
	if (instance.currentResponse.headers["x-robots-tag"] != null)
	{
		instance.currentRobots.header( instance.currentResponse.headers["x-robots-tag"] );
	}
}



module.exports = HtmlUrlChecker;
