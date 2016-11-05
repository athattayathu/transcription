class SlideController {

	constructor(slideContainer,window){

		this.slidesIframe;

		this.currentSlide = 1;

		this.slideDeckOrigin = "";
		
		this.window = window;

		this.slideDeckUrl = "";

		this.slideSpecificUrl = "";

		this.slideContainer = slideContainer;

		this.reg = /http(s)?:\/\/speakerdeck.com\/realm\//;

		this.pingInterval = null;

		this._slideChangeList = [];
		
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

		this.window.removeEventListener('message', this.receiver(this));
		this.window.addEventListener('message', this.receiver(this), false);

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
			if((status !== "notmodified" && status !== "success") || (null == data.responseJSON.query.results)){
				if (onErrorFunc) {
					onErrorFunc();
				}
				return;
			}

			console.log(data);
			//replace contents to have the iframe
			var res = JSON.parse(data.responseJSON.query.results.body);
			var matches = res.html.match(/\/\/speakerdeck.com\/player\/(\S*)(?:")/);
			var slideId = matches[1];

			var script = document.createElement("script");
	      script.type = "text/javascript";
	      script.async = true;
	      script.src = "http://speakerdeck.com/assets/embed.js";
	      script.setAttribute("class", "speakerdeck-embed");
	      script.setAttribute("data-id", slideId);

	      $('#'+container)[0].appendChild(script);			

			this.pingInterval = setInterval((function(self){
					return function() {
						var frame = $("iframe.speakerdeck-iframe");
							if (frame.length > 0 && frame[0].contentWindow) {
								self.slidesIframe = frame[0];
								clearInterval(self.pingInterval); 
								return frame[0].contentWindow.postMessage(JSON.stringify(["ping"]), "*");
							}
			        }
			     })(self), 500);
			
			var specUrl = 'https://' + matches[0].substr(matches[0].indexOf('speakerdeck.com'));
			self.slideSpecificUrl = specUrl;
			if (onSuccessFunc) {
				onSuccessFunc();
			}
		}
	}


	next(){

		this.slidesIframe.contentWindow.postMessage(
		JSON.stringify(["goToSlide", this.currentSlide + 1]), "*");
	}

	previous(){
		if(this.currentSlide > 1){

			this.slidesIframe.contentWindow.postMessage(
				JSON.stringify(["goToSlide", this.currentSlide - 1]), "*");
		}
	}

	goToSlide(currentSlide){
		if(currentSlide > 0){
			this.currentSlide = currentSlide;

			this.slidesIframe.contentWindow.postMessage(
				JSON.stringify(["goToSlide", this.currentSlide]), "*");
		}
	}

	receiver(self) {
		return function(event){
		   if (!event.origin.startsWith('https://speakerdeck.com')) {
		   	console.log("got response from wrong site"+event.origin);
		     	return;
		   }

		   self.slideDeckOrigin = event.origin;

		   var data = JSON.parse(event.data);

		   if (data[0] === "change") {
		   	console.log("current" + self.currentSlide);
		   	self.currentSlide = data[1].number;
		   	for( callback in self._slideChangeList)
		   	{
		   		callback(data[1].number);
		   	}
		   }
		};
	}

	onSlideChange(fun){
		this._slideChangeList.push(fun);
	}

	getCurrentSlide(){
		return this.currentSlide;
	}
}

