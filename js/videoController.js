class VideoController {
	
	constructor(videoDomId,window){

		this._videoId = videoDomId;
		this.videoUrl = "";
		this.window = window;

		

		this.video;// the wistia video that we must invoke functions on
		this.duration;

		this.reg = /http(s)?:\/\/realm.wistia.com/


		var ogClass = this;
		window._wq = window._wq || [];
		_wq.push({ id: "_all", onReady: function(videoReturn) {
			ogClass.video = videoReturn;
			ogClass.duration = Math.trunc(videoReturn.duration());
		}});



	}

	getVideoUrl(){
		return this.videoUrl;
	}

	changeVideo(url, onErrorFunc, onSuccessFunc){
		if (typeof url !== 'string'){
			throw new TypeError("Need a string as the url");
		}
		if (!this.reg.exec(url)) {
			throw new ControllerError("The video url needs to be from https://realm.wistia.com");
		}
		if (url === this.videoUrl){
			return;
		}

		this._getVideo(url, onErrorFunc, onSuccessFunc);
		this.videoUrl = url;
	}



	_getVideo(url, onErrorFunc, onSuccessFunc){
		try {
			$.ajax({
				type:"GET",
			  	url:'http://fast.wistia.com/oembed?url='+Utility.fixedEncodeURI(url),
			  	dataType:'jsonp',
			  	timeout: 5000,
			  	complete: this._replaceVideoFrame(onErrorFunc, onSuccessFunc),
			  	error: function(xhr, status, error) {
			  		console.log("Got the error result");
			  	}
			});
		} catch (e){
			console.log("OMG GOT ERROR ON TRY CACTH");
		}

		//$.getJSON('http://fast.wistia.com/oembed?url='+Utility.fixedEncodeURI(url)+"&format=json&callback=?", this._replaceVideoFrame(onErrorFunc, onSuccessFunc));
	}

	_replaceVideoFrame(onErrorFunc, onSuccessFunc){
		var videoId = this._videoId;
		return function(data, status){
			//if its an error execute error callback
			if(status !== "notmodified" && status !== "success"){
				if (onErrorFunc) {
					onErrorFunc();
				}
				return;
			}

			$('#' + videoId).html(data.responseJSON.html);
			console.log(data);
			$('#' + videoId).html(data.html);
			if(onSuccessFunc){
				onSuccessFunc();
			}
		};
		//this.videoDiv.html(data.responseJSON.html);

	}

	getCurTime(){
		if (this.video){
			return this.video.time();
		} else {
			0;
		}
	}

	goToTime(val){
		if(typeof val !== "number"){
			throw new TypeError("Need a number for the time");
		}
		if(val < 0 || val > this.duration){
			throw new RangeError("Time needs to be between 0 and " + 
				this.duration + ". It was " + val + ".");
		}

		if(this.video)
			this.video.time(val);
	}

	play(){
		if(this.video)
			this.video.play();
	}

	pause(){
		if(this.video)
			this.video.pause();
		
	}

	togglePlay(){
		if(this.isPaused()){
			this.play();
		} else {
			this.pause();
		}
	}

	isPaused(){
		if(this.video){
			return this.video.state() !== 'playing';
		}
	}


	getTotalDuration(){
		return this.duration;
	}

	isReady(){
		return (this.video !== undefined && this.video.hasData());
	}

}
