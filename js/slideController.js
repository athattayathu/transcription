class SlideController {

	constructor(slidesIframe, window){

		this.slidesIframe = slidesIframe;

		this.currentSlide = 1;

		this.slideDeckOrigin = "";
		
		this.window = window;

		this.slideDeckUrl = "";
		
	}

	init(slideDeckUrl) {
		this.changeDeck(slideDeckUrl);
	}

	changeDeck(slideDeckUrl){
		this._getSlideData(slideDeckUrl);
		this.slideDeckUrl = slideDeckUrl;
		this.currentSlide = 1;
		this.slideDeckOrigin = "";

		this.slidesIframe.setAttribute("src", 'https://speakerdeck.com/player/'+slideDeckUrl);

		//this.window.removeEventListener('message', this.receiver);
		//this.window.addEventListener('message', this.receiver, false);
		this.slidesIframe.contentWindow.postMessage(JSON.stringify(["ping"]), "*");

	}

	_getSlideData(slideDeckUrl){
		var url = "http://speakerdeck.com/oembed.json?url=" + Utility.fixedEncodeURI(slideDeckUrl);
		/*console.log(url);
		var xhr = new XMLHttpRequest();

		xhr.open("GET", url, true);

		xhr.onload = function (e) {
			console.log(xhr);
		  if (xhr.readyState === 4) {
		    if (xhr.status === 200) {
		      console.log(xhr.responseText);
		    } else {
		      console.error(xhr.statusText);
		    }
		  }
		};
		xhr.onerror = function (e) {
		  console.error(xhr.statusText);
		};

		xhr.send(null);*/

		 $.get(url, function (response) {
                var resp = JSON.parse(response);
                alert(resp.status);
            },function (xhr, status) {
                console.log(xhr);
                console.log(status);
            }
        );
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

