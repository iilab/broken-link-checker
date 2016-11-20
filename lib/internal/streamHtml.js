"use strict";
const errors     = require("./messages").errors;
const requestUrl = require("./requestUrl");

const specurl = require("specurl");



function checkErrors(response)
{
	if (response.status<200 || response.status>299)
	{
		let error = new Error(errors.HTML_RETRIEVAL);
		error.code = response.status;
		return error;
	}
	
	let type = response.headers["content-type"];
	
	// Content-type is not mandatory in HTTP spec
	if (type==null || type.indexOf("text/html")!==0)
	{
		let error = new Error(errors.EXPECTED_HTML(type));
		error.code = response.status;
		return error;
	}
}



/*
	Request a URL for its HTML contents and return a stream.
*/
function streamHtml(url, auth, cache, options)
{
	let output;
	
	const request = requestUrl(url, auth, "get", options).then( function(result)
	{
		output = checkErrors(result.response);
		
		if (output === undefined)
		{
			output = result;
			
			// Send response of redirected URL to cache
			// TODO :: use specurl.relation()
			if (options.cacheResponses===true && result.response.url!==url.href)
			{
				// Will always overwrite previous value
				cache.set(result.response.url, result.response);
			}
		}
		
		return result;
	})
	.catch(error => error);  // will be stored as a response
	
	// TODO :: this stores invalid urls too -- should avoid that?
	// Send response to cache -- it will be available to `cache.get()` before being resolved
	if (options.cacheResponses === true)
	{
		// Will always overwrite previous value
		cache.set(url, request);
	}
	
	// Send result to caller
	return request.then( function(result)
	{
		if (result instanceof Error === true) throw result;
		if (output instanceof Error === true) throw output;
		
		return output;
	});
}



module.exports = streamHtml;
