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

	/**
	 * Create a string of the format hh:mm:ss or mm:ss from time in seconds passed in
	 **/
	static timeToStr(time){

		const MINUTE_TO_SECOND = 60;
		const HOUR_TO_SECOND = 3600;

		var hour = Math.trunc(time /HOUR_TO_SECOND);

		var minute = Math.trunc(time / MINUTE_TO_SECOND);
		var seconds = time % MINUTE_TO_SECOND;
		seconds = (seconds < 10)? '0' + seconds : seconds;

		var res =  minute + ':' + seconds ;
		res = (hour) ? (hour+":"+res) : res;
	        console.log(time);
		console.log(res);
		return res;
	}
}