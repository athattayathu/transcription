class SyncStruct {
	constructor (){

		this.obj = {
				  "title": "untitled",
				  "chapters": [
					   {
					      "title": "untitled",
					      "duration": 0,
					      "video": {
					        "url": "don't have url"
					      },
					      "slides": [
					      ]
					   }
		   		]
		   	};

		this.slidesArr = [];
	}

	setTitle(title){
		if (typeof title !== "string"){
			throw new TypeError ()
		}

		title = (title) ? title : "untitled" ;
		this.obj.title = title;
		this.obj.chapters[0].title = title;
	}

	setVideoUrl(url){
		if (typeof url !== "string"){
			throw new TypeError ()
		}
		this.obj.chapters[0].video.url = (url) ? url : "don't have url";
	}

	setVideoDuration(duration){
		if (typeof url !== "number"){
			throw new TypeError ()
		}
		this.obj.chapters[0].duration = duration;
	}


	generateSlideJSON(){

		var storeArr = [];
		for(slide of this.slidesArr){
			var object = {
				"time" : slide.time,
				"url" :  url + "#" + slide.slideNum
			}
			storeArr.push(object);
		}
		
		this.obj.chapters[0].slides = storeArr;

		return this.obj;
	}

	addSlideObj(time){

		if(slidesArr.length > 0){
			slideNum = slidesArr[slidesArr.length - 1].slideNum + 1;
		} else {
			slideNum = 1;
		}

	    var source = {
					"time" : time,
					"slideNum" : slideNum
				 };

		slidesArr.push(source);
	}

	getslideArray(){
		return this.slidesArr;
	}

	updateStruct(jsObj){
		this.setTitle(jsObj.chapters[0].title);
		this.setVideoDuration(jsObj.chapters[0].duration);
		this.setVideoUrl(jsObj.chapters[0].video.url);

		_deconstructSlides(jsObj.chapters[0].slides);
	}

	_deconstructSlides(slides){
		var returnArr = [];
		var numLoc = 0;
		if(slides[0]){
			numLoc = slides[0].url.search(/#\d+/i);
			numLoc++;
		}

		for (slide of slides){
			
			var val = {
					"time" : slide.time,
					"slideNum" : parseInt(slide.url.slice(numLoc),10)
				};

			returnArr.push(val);
		}
		return returnArr;
	}

}
