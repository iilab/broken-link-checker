"use strict";
const Link       = require("./Link");
const reasons    = require("./messages").reasons;
const requestUrl = require("./requestUrl");

const extend = require("extend");
//const isPromise = require("is-promise");
//const joinPath = require("path").join;
const specurl = require("specurl");
//const stat = require("fs").stat;




/*function checkFileUrl(link, cache, options)
{
	return statFile(link.url.rebased.pathname).then( function(stats)
	{
		if (stats.isFile() !== true)
		{
			//throw new Error("ERRNOTFOUND");
		}
		
		link.broken = false;
	})
	.catch( function(error)
	{
		link.broken = true;
		link.brokenReason = reasons["ERRNO" + error.code];
	});
}*/



function checkHttpUrl(link, auth, cache, options)
{
	const request = requestUrl(link.url.rebased, auth, options.requestMethod, options).then( function(result)
	{
		const response = result.response;
		
		if (options.cacheResponses === true)
		{
			/*if (isPromise(cache.get(link.url.rebased)) === true)
			{
				// Exclude the stream from cache
				cache.set(link.url.rebased, response);
			}*/
			
			// TODO :: move cache logic to `redirectUrl` for use in `streamHtml`
			
			// TODO :: `specurl.relation(url,url,true)` since UrlCache doesn't deep-search queries for its keys
			if (response.url.href !== link.url.rebased.href)
			{
				cache.set(response.url, result.response);
			}
			
			// TODO :: this needs a test
			for (let i=0; i<response.redirects.length; i++)
			{
				let redirect = response.redirects[i];
				
				if (cache.get(redirect.url) === undefined)
				{
					cache.set(redirect.url, redirect);
				}
			}
		}
		
		return response;
	})
	.catch(error => error);  // will be stored as a response
	
	if (options.cacheResponses === true)
	{
		// Make future response available to `cache.get()` before completion
		cache.set(link.url.rebased, request);
	}
	
	// Send link to caller
	return request.then( function(response)
	{
		copyResponseData(response, link, options);
		
		link.http.cached = false;
		
		return link;
	});
}



/*
	Checks a URL to see if it's broken or not.
*/
// TODO :: rename to `checkLink`
function checkUrl(link, auth, cache, options)
{
	// TODO :: move out to a `Link.invalidate()` to share with `HtmlChecker()` ?
	if (link.url.rebased===null || options.acceptedSchemes[link.url.rebased.protocol]!==true)
	{
		link.broken = true;
		link.brokenReason = "BLC_INVALID";
		return Promise.resolve(link);
	}
	
	if (options.cacheResponses === true)
	{
		// TODO :: different auths can have different responses
		let cached = cache.get(link.url.rebased);
		
		if (cached !== undefined)
		{
			return Promise.resolve(cached).then( function(response)
			{
				copyResponseData(response, link, options);
				
				link.http.cached = true;
				
				return link;
			});
		}
	}
	
	/*switch (link.url.rebased.protocol)
	{
		"file:":  return checkFileUrl(link, cache, options);
		
		"http:":
		"https:":*/ return checkHttpUrl(link, auth, cache, options);
	//}
}



/*
	Copy data from a `simpleResponse` object—either from a request or cache—
	into a link object.
*/
function copyResponseData(response, link, options)
{
	if (response instanceof Error === false)
	{
		if (response.status<200 || response.status>299)
		{
			link.broken = true;
			link.brokenReason = "HTTP_" + response.status;
		}
		else
		{
			link.broken = false;
		}
		
		if (options.cacheResponses === true)
		{
			// Deep-cloned to avoid mutations to cache
			link.http.response = extend({}, response);
		}
		else
		{
			link.http.response = response;
		}
		
		// TODO :: would a string check be sufficient?
		if (specurl.relation(response.url, link.url.rebased) < specurl.relation.PATH)
		{
			// TODO :: this needs a test
			// TODO :: test if redirected to a different protocol
			Link.redirect(link, response.url);
		}
	}
	else
	{
		link.broken = true;
		
		if (reasons["ERRNO_"+response.code] != null)
		{
			link.brokenReason = "ERRNO_" + response.code;
		}
		else
		{
			link.brokenReason = "BLC_UNKNOWN";
		}
	}
}



/*function statFile(pathname)
{
	return new Promise( function(resolve, reject)
	{
		stat(pathname, function(error, stats)
		{
			if (error == null) return resolve(stats);
			
			reject(error);
		});
	});
}*/



module.exports = checkUrl;
