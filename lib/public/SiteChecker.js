"use strict";
const getRobotsTxt   = require("../internal/getRobotsTxt");
const matchUrl       = require("../internal/matchUrl");
const parseOptions   = require("../internal/parseOptions");
const reasons        = require("../internal/messages").reasons;
const transitiveAuth = require("../internal/transitiveAuth");

const HtmlUrlChecker = require("./HtmlUrlChecker");

const maybeCallback = require("maybe-callback");
const RequestQueue = require("limited-request-queue");
const specurl = require("specurl");
const UrlCache = require("urlcache");



class SiteChecker
{
	constructor(options, handlers={})
	{
		reset(this);
		
		this.handlers = handlers;
		this.options = options = parseOptions(options);
		
		this.sitePagesChecked = new UrlCache({ expiryTime: this.options.cacheExpiryTime });
		
		this.siteUrlQueue = new RequestQueue(
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
				this.currentSiteUrl = input.url;  // TODO :: strip after hostname?
				
				// Support checking sites multiple times
				this.sitePagesChecked.clear();
				
				if (this.options.honorRobotExclusions === true)
				{
					getRobotsTxt(this.currentSiteUrl/*, this.currentAuth*/, this.options).then(robots =>
					{
						// This receives an instance even if no robots.txt was found
						this.currentRobotsTxt = robots;
						
						maybeCallback(this.handlers.robots)(robots, this.currentCustomData);
						
						enqueuePage(this, this.currentSiteUrl, this.currentCustomData, this.currentAuth);
					})
					.catch(error =>
					{
						// If could not connect to server -- let `HtmlUrlChecker` catch it
						enqueuePage(this, this.currentSiteUrl, this.currentCustomData, this.currentAuth);
					});
				}
				else
				{
					enqueuePage(this, this.currentSiteUrl, this.currentCustomData, this.currentAuth);
				}
			},
			end: () =>
			{
				// Reduce memory usage
				this.sitePagesChecked.clear();
				
				// Clear references for garbage collection
				reset(this);
				
				maybeCallback(this.handlers.end)();
			}
		});
		
		this.htmlUrlChecker = new HtmlUrlChecker(this.options,
		{
			html: (tree, robots, response, pageUrl, customData) =>
			{
				// If was redirected
				if (response.url !== pageUrl)
				{
					this.sitePagesChecked.set(response.url, true);
					
					for (let i=0; i<response.redirects.length; i++)
					{
						// Avoid rechecking any redirected pages
						this.sitePagesChecked.set( response.redirects[i].url, true );
					}
				}
				
				maybeCallback(this.handlers.html)(tree, robots, response, pageUrl, customData);
			},
			_filter: result =>  // undocumented handler
			{
				// Additional filters for excluding links
				return maybeCheckLink(this, result);
			},
			junk: (result, customData) =>
			{
				maybeCallback(this.handlers.junk)(result, customData);
				
				maybeEnqueuePage(this, result, customData, this.currentAuth);
			},
			link: (result, customData) =>
			{
				maybeCallback(this.handlers.link)(result, customData);
				
				maybeEnqueuePage(this, result, customData, this.currentAuth);
			},
			page: (error, pageUrl, customData) =>
			{
				maybeCallback(this.handlers.page)(error, pageUrl, customData);
				
				// Only the first page should supply an error to "site" handler
				if (this.sitePagesChecked.length() <= 1)
				{
					this.currentPageError = error;
				}
			},
			end: () =>
			{
				maybeCallback(this.handlers.site)(this.currentPageError, this.currentSiteUrl, this.currentCustomData);
				
				// Auto-starts next site, if any
				// If not, fires "end"
				this.currentDone();
			}
		});
	}
	
	
	
	clearCache()
	{
		// Does not clear `sitePagesChecked` because it would mess up any current scans
		return this.htmlUrlChecker.clearCache();
	}
	
	
	
	dequeue(id)
	{
		return this.siteUrlQueue.dequeue(id);
	}
	
	
	
	enqueue(firstPageUrl, customData)
	{
		const transitive = transitiveAuth(firstPageUrl);
		
		return this.siteUrlQueue.enqueue(
		{
			url: transitive.url,
			data: { auth:transitive.auth, customData }
		});
	}
	
	
	
	numActiveLinks()
	{
		return this.htmlUrlChecker.numActiveLinks();
	}
	
	
	
	numQueuedLinks()
	{
		return this.htmlUrlChecker.numQueuedLinks();
	}
	
	
	
	numPages()
	{
		return this.htmlUrlChecker.numPages();
	}
	
	
	
	numSites()
	{
		return this.siteUrlQueue.length();
	}
	
	
	
	pause()
	{
		this.htmlUrlChecker.pause();
		return this.siteUrlQueue.pause();
	}
	
	
	
	resume()
	{
		this.htmlUrlChecker.resume();
		return this.siteUrlQueue.resume();
	}
	
	
	
	/*__getCache()
	{
		return this.htmlUrlChecker.__getCache();
	}*/
}



//::: PRIVATE FUNCTIONS



function enqueuePage(instance, url, customData, auth)
{
	// Avoid links to self within page
	instance.sitePagesChecked.set(url, true);
	
	instance.htmlUrlChecker.enqueue(url, customData, auth);
}



function isAllowed(instance, link)
{
	if (instance.options.honorRobotExclusions === true)
	{
		// TODO :: remove condition when/if `Link.invalidate()` is used in `HtmlChecker`
		if (link.url.rebased !== null)
		{
			return instance.currentRobotsTxt.isAllowed(instance.options.userAgent, link.url.rebased.pathname);
		}
	}
	
	return true;
}



function maybeCheckLink(instance, link)
{
	if (link.internal===true && isAllowed(instance, link)===false)
	{
		return "BLC_ROBOTS";
	}
}



function maybeEnqueuePage(instance, link, customData)
{
	// Skip specific links that were excluded from checks
	if (link.excluded === true)
	{
		switch (link.excludedReason)
		{
			case "BLC_KEYWORD":
			case "BLC_ROBOTS":  // TODO :: catches rel=nofollow links but will also catch meta/header excluded links -- fine?
			case "BLC_SCHEME":
			{
				return false;
			}
		}
	}
	
	let tagGroup = instance.options.tags.recursive[instance.options.filterLevel][link.html.tagName];
	
	let attrSupported;
	
	if (tagGroup != null)
	{
		attrSupported = tagGroup[link.html.attrName];
	}
	
	if (
	   	(attrSupported !== true) || 
	   	(link.broken === true) || 
	   	(link.internal !== true) || 
	   	(instance.sitePagesChecked.get(link.url.rebased) === true) || 
	   	(isAllowed(instance, link) === false)
	   )
	{
		return false;
	}
	
	if (link.url.redirected!=null && instance.sitePagesChecked.get(link.url.redirected)===true)
	{
		let redirects = link.http.response.redirects;
		
		for (let i=0; i<redirects.length; i++)
		{
			// Because the final redirected page has already been [recursively] checked,
			// all redirects are stored as pages that have been checked
			instance.sitePagesChecked.set(redirects[i].url, true);
		}
		
		return false;
	}
	
	enqueuePage(instance, link.url.rebased, customData);
	
	return true;
}



function reset(instance)
{
	instance.currentCustomData = null;
	instance.currentDone = null;
	instance.currentPageError = null;
	instance.currentRobotsTxt = null;
	instance.currentSiteUrl = null;
}



module.exports = SiteChecker;
