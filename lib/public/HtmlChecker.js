"use strict";
const Link           = require("../internal/Link");
const matchUrl       = require("../internal/matchUrl");
const parseHtml      = require("../internal/parseHtml");
const parseOptions   = require("../internal/parseOptions");
const scrapeHtml     = require("../internal/scrapeHtml");
const transitiveAuth = require("../internal/transitiveAuth");

const UrlChecker = require("./UrlChecker");

const isString = require("is-string");
const linkTypes = require("link-types").map;
const maybeCallback = require("maybe-callback");
const RobotDirectives = require("robot-directives");



class HtmlChecker
{
	constructor(options, handlers={})
	{
		reset(this);
		
		this.handlers = handlers;
		this.options = options = parseOptions(options);
		
		this.urlChecker = new UrlChecker(this.options,
		{
			link: result => maybeCallback(this.handlers.link)(result),
			end: () => 
			{
				// If stream finished
				if (this.parsed === true)
				{
					complete(this);
				}
			}
		});
	}
	
	
	
	clearCache()
	{
		return this.urlChecker.clearCache();
	}
	
	
	
	numActiveLinks()
	{
		return this.urlChecker.numActiveLinks();
	}
	
	
	
	numQueuedLinks()
	{
		return this.urlChecker.numQueuedLinks();
	}
	
	
	
	pause()
	{
		return this.urlChecker.pause();
	}
	
	
	
	resume()
	{
		return this.urlChecker.resume();
	}
	
	
	
	// `auth` is undocumented and for internal use only
	scan(html, baseUrl, robots, auth)
	{
		if (this.active === true)
		{
			return false;
		}
		
		// Prevent user error with missing undocumented arugment
		if (robots instanceof RobotDirectives === false)
		{
			robots = new RobotDirectives({ userAgent: this.options.userAgent });
		}
		
		const transitive = transitiveAuth(baseUrl, auth);
		
		this.active = true;
		this.auth = transitive.auth;
		this.baseUrl = transitive.url;  // TODO :: remove hash (and store somewhere?)
		this.robots = robots;
		
		let tree;
		
		parseHtml(html).then(document => 
		{
			tree = document;
			return scrapeHtml(document, this.baseUrl, this.robots);  // TODO :: add auth?
		})
		.then(links => 
		{
			maybeCallback(this.handlers.html)(tree, this.robots);
			
			for (let i=0, numLinks=links.length; i<numLinks; i++)
			{
				maybeEnqueueLink(links[i], this);
			}
			
			this.parsed = true;
			
			// If no links found or all links already checked
			if (this.urlChecker.numActiveLinks()===0 && this.urlChecker.numQueuedLinks()===0)
			{
				complete(this);
			}
		});
		
		return true;
	}
	
	
	
	__getCache()
	{
		return this.urlChecker.__getCache();
	}
}



//::: PRIVATE FUNCTIONS



function complete(instance)
{
	reset(instance);
	
	maybeCallback(instance.handlers.complete)();
}



function maybeEnqueueLink(link, instance)
{
	const excludedReason = maybeExcludeLink(link, instance);
	
	if (excludedReason !== false)
	{
		link.html.offsetIndex = instance.excludedLinks++;
		link.excluded = true;
		link.excludedReason = excludedReason;
		
		maybeCallback(instance.handlers.junk)(link);
		
		return;
	}
	
	link.html.offsetIndex = link.html.index - instance.excludedLinks;
	link.excluded = false;
	
	instance.linkEnqueued = instance.urlChecker.enqueue(link, null, instance.auth);
	
	// TODO :: is this redundant? maybe use `Link.invalidate()` in `maybeExcludeLink()` ?
	if (instance.linkEnqueued instanceof Error)
	{
		link.broken = true;
		link.brokenReason = instance.linkEnqueued.message==="Invalid URL" ? "BLC_INVALID" : "BLC_UNKNOWN";
		
		maybeCallback(instance.handlers.link)(link);
	}
}



function maybeExcludeLink(link, instance)
{
	let attrSupported,externalFilter;
	const attrName = link.html.attrName;
	const tagName = link.html.tagName;
	const tagGroup = instance.options.tags[instance.options.filterLevel][tagName];
	
	if (tagGroup != null)
	{
		attrSupported = tagGroup[attrName];
	}
	
	if (attrSupported !== true) return "BLC_HTML";
	if (instance.options.excludeExternalLinks===true   && link.internal===false) return "BLC_EXTERNAL";
	if (instance.options.excludeInternalLinks===true   && link.internal===true)  return "BLC_INTERNAL";
	if (instance.options.excludeLinksToSamePage===true && link.samePage===true)  return "BLC_SAMEPAGE";
	if (instance.options.excludedSchemes[link.url.rebased.protocol] === true) return "BLC_SCHEME";
	
	if (instance.options.honorRobotExclusions === true)
	{
		if (instance.robots.oneIs([ RobotDirectives.NOFOLLOW, RobotDirectives.NOINDEX ]) === true)
		{
			return "BLC_ROBOTS";
		}
		
		if (instance.robots.is(RobotDirectives.NOIMAGEINDEX) === true)
		{
			if (
			    (tagName==="img"      && attrName==="src"   ) || 
			    (tagName==="input"    && attrName==="src"   ) || 
			    (tagName==="menuitem" && attrName==="icon"  ) || 
			    (tagName==="video"    && attrName==="poster")
			   )
			{
				return "BLC_ROBOTS";
			}
		}
		
		if (link.html.attrs!=null && link.html.attrs.rel!=null && linkTypes(link.html.attrs.rel).nofollow===true)
		{
			return "BLC_ROBOTS";
		}
	}
	
	if (matchUrl(link.url.rebased.href, instance.options.excludedKeywords) === true) return "BLC_KEYWORD";
	
	// Undocumented handler for custom constraints
	externalFilter = maybeCallback(instance.handlers._filter)(link);
	
	if (isString(externalFilter) === true)
	{
		return externalFilter;
	}
	/*else if (externalFilter === false)
	{
		return "BLC_CUSTOM";
	}*/
	
	return false;
}



function reset(instance)
{
	instance.active = false;
	instance.auth = null;
	instance.baseUrl = undefined;
	instance.excludedLinks = 0;
	instance.linkEnqueued = null;
	instance.parsed = false;
	instance.robots = null;
}



module.exports = HtmlChecker;
