class SlideController {

	constructor(slideContainer,window){

		this.slidesIframe;

		this.currentSlide = 1;

		this.slideDeckOrigin = "";
		
		this.window = window;

		this.slideDeckUrl = "";

		this.slideSpecificUrl = "";

		this.slideContainer = slideContainer

		this.reg = /http(s)?:\/\/speakerdeck.com\/realm\//
		
	}

	init(slideDeckUrl) {
		this.changeDeck(slideDeckUrl);
	}

	getSlideDeckUrl(){
		return this.slideDeckUrl;
	}

	getSlideSpecificUrl() {
		return this.slideSpecificUrl;
	}

	/**
	* This function changes the slide Deck to the given Url
	* @param slideDeckUrl string from https://speakerdeck.com/realm/
	*/
	changeDeck(slideDeckUrl, onErrorFunc, onSuccessFunc){

		if (typeof slideDeckUrl !== 'string'){
			throw new TypeError("Need a string as the url");
		}
		if(!this.reg.exec(slideDeckUrl)){
			throw new ControllerError("The slides need to be from https://speakerdeck.com/realm/");
		}

		if(this.slideDeckUrl === slideDeckUrl){
			return;
		}

		this._getSlideData(slideDeckUrl, onErrorFunc, onSuccessFunc);
		this.slideDeckUrl = slideDeckUrl;
		this.currentSlide = 1;
		this.slideDeckOrigin = "";

		//this.slidesIframe.setAttribute("src", 'https://speakerdeck.com/player/'+slideDeckUrl);

		this.window.removeEventListener('message', this.receiver);
		this.window.addEventListener('message', this.receiver, false);

	}

	_getSlideData(slideDeckUrl, onErrorFunc, onSuccessFunc){
		$.ajax({
			type:"GET",
		  	url:"https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D'" 
		  		+ Utility.fixedEncodeURI("https://speakerdeck.com/oembed.json?url=" 
		  			+ Utility.fixedEncodeURI(slideDeckUrl)
		  		)
		  		+ "'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
		  	dataType:'jsonp',
		  	complete: this._slideCallback(onErrorFunc, onSuccessFunc)
		});
	}

	_slideCallback(onErrorFunc, onSuccessFunc){
		var container = this.slideContainer;
		var self = this;
		return function(data, status) {
			//if its an error execute error callback
			if(status !== "notmodified" && status !== "success"){
				if (onErrorFunc) {
					onErrorFunc();
				}
				return;
			}

			//replace contents to have the iframe
			var res = JSON.parse(data.responseJSON.query.results.body);
			$('#'+container).html(res.html);
			self.slidesIframe = $('#' + container + '>iframe')[0];

			//get the slide specific url
			var specUrl = self.slidesIframe.getAttribute("src");
			specUrl = 'https://' + specUrl.substr(specUrl.indexOf('speakerdeck.com'));
			self.slideSpecificUrl = specUrl;

			//get hold of details of slides
			self.slidesIframe.contentWindow.postMessage(JSON.stringify(["ping"]), "*");
			if (onSuccessFunc) {
				onSuccessFunc();
			}
		}
	}


	next(){
		this.currentSlide++;

		this.slidesIframe.contentWindow.postMessage(
		JSON.stringify(["goToSlide", this.currentSlide]), "*");
	}

	previous(){
		if(this.currentSlide > 1){
			this.currentSlide--;

			this.slidesIframe.contentWindow.postMessage(
				JSON.stringify(["goToSlide", this.currentSlide]), "*");
		}
	}

	goToSlide(currentSlide){
		if(currentSlide > 0){
			this.currentSlide = currentSlide;

			this.slidesIframe.contentWindow.postMessage(
				JSON.stringify(["goToSlide", this.currentSlide]), "*");
		}
	}

	receiver(event) {

	   if (!event.origin.startsWith('https://speakerdeck.com/player/')) {
	   	console.log("got response from wrong site"+event.origin);
	     	return;
	   } 

	   console.log("ok we got a response");

	   this.slideDeckOrigin = event.origin;
	   console.log(this.slideDeckOrigin);

	   var data = JSON.parse(event.data);
	   console.log(data);
	   if (data[0] == "change") {
	   	this.currentSlide = data[1].number;
	   }

	}

	getCurrentSlide(){
		return this.currentSlide;
	}
}

