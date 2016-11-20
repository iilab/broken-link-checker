"use strict";
const specurl = require("specurl");

const defaultAuth = { username:"", password:"" };



/*
	Possibly override `auth` with that from `url`.
*/
function transitiveAuth(url, auth=defaultAuth)
{
	if (specurl.isURL(url) === false)
	{
		url = specurl.parse(url);
	}
	else if (url.username!=="" || url.password!=="")
	{
		// Only clone if necessary
		url = specurl.clone(url);
	}
	
	if (url !== null)
	{
		if (url.username!=="" || url.password!=="")
		{
			auth =
			{
				password: url.password,
				username: url.username
			};
			
			// TODO :: is this the kind of result we want, with auth stored in `http` ? ask joepie91
			url.password = "";
			url.username = "";
		}
	}
	
	return { url, auth };
}



module.exports = transitiveAuth;
