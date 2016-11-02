class SlideController {

	constructor(slideContrainer,slidesIframe, window){

		this.slidesIframe = slidesIframe;

		this.currentSlide = 1;

		this.slideDeckOrigin = "";
		
		this.window = window;

		this.slideDeckUrl = "";

		this.slideContrainer = slideContrainer
		
	}

	init(slideDeckUrl) {
		this.changeDeck(slideDeckUrl);
		
	}

	changeDeck(slideDeckUrl){
		this._getSlideData(slideDeckUrl);
		this.slideDeckUrl = slideDeckUrl;
		this.currentSlide = 1;
		this.slideDeckOrigin = "";

		_getSlideData(slideDeckUrl);

		//this.slidesIframe.setAttribute("src", 'https://speakerdeck.com/player/'+slideDeckUrl);

		//this.window.removeEventListener('message', this.receiver);
		//this.window.addEventListener('message', this.receiver, false);
		//this.slidesIframe.contentWindow.postMessage(JSON.stringify(["ping"]), "*");

	}

	_getSlideData(slideDeckUrl){
				$.ajax({
			type:"GET",
		  	url:"https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D'" 
		  		+ Utility.fixedEncodeURI("https://speakerdeck.com/oembed.json?url=" 
		  			+ Utility.fixedEncodeURI("https://speakerdeck.com/realm/scott-gardner-reactive-programming-with-rxswift")
		  		)
		  		+ "'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
		  	dataType:'jsonp',
		  	complete: this._slideCallback()
		});
	}

	_slideCallback(){
		var container = this.slideContrainer;
		return function(data){
        	var res = JSON.parse(data.responseJSON.query.results.body);
          $('#'+container).html(res.html);
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

	/*receiver(event) {

	   if (!event.origin.startsWith('https:speakerdeck.com/player/')) {
	   	console.log(event);
	   	console.log("got response from wrong site");
	   	console.log(event.data);
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

	}*/

	getCurrentSlide(){
		return this.currentSlide;
	}
}

