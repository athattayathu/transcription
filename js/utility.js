class Utility{
	//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
	static fixedEncodeURI (str) {
		return encodeURIComponent(str)
	}

	static prependHttps(url){
		var httpreg = /https?:\/\//;
		if(!httpreg.exec(url)){
			url = "https://" + url;
		}
		return url;
	}
}