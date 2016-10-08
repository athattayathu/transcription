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
			ogClass.duration = videoReturn.duration();
		}});



	}

	getVideoUrl(){
		return this.videoUrl;
	}

	changeVideo(url){
		if (typeof url !== 'string'){
			throw new TypeError("Need a string as the url");
		}
		if (!this.reg.exec(url)) {
			throw new ControllerError("The video url needs to be from https://realm.wistia.com");
		}
		if (url === this.videoUrl){
			return;
		}

		this._getVideo(url);
		this.videoUrl = url;
	}



	_getVideo(url){
		$.ajax({
			type:"GET",
		  	url:'http://fast.wistia.com/oembed?url='+Utility.fixedEncodeURI(url),
		  	dataType:'jsonp',
		  	complete: this._replaceVideoFrame()
		});
	}

	_replaceVideoFrame(){
		var videoId = this._videoId;
		return function(data){
			$('#' + videoId).html(data.responseJSON.html);
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

	isPaused(){
		if(this.video){
			return this.video.state() !== 'playing';
		}
	}


	getTotalDuration(){
		return this.duration;
	}

	isReady(){
		return (this.video !== undefined && video.hasData());
	}

}