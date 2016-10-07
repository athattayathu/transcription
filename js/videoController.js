class VideoController {
	
	constructor(videoId,window){
		this.videoUrl = "";
		this.window = window;

		this.videoDiv = $('#'+ videoId);
		this.video;
		var ogClass = this;
		window._wq = window._wq || [];
		_wq.push({ id: "_all", onReady: function(videoReturn) {
			ogClass.video = videoReturn;
		  	console.log("I got a handle to the video!", videoReturn);
		  	console.log(ogClass.video);
		}});



	}

	getVideoUrl(){
		return this.videoUrl;
	}

	changeVideo(url){
		console.log("URL to change to" + url);
		this._getVideo(url);
		this.videoUrl = url;
	}



	_getVideo(url){
		$.ajax({
			type:"GET",
		  	url:'http://fast.wistia.com/oembed?url='+Utility.fixedEncodeURI(url),
		  	dataType:'jsonp',
		  	complete: this._replaceVideoFrame
		});
	}

	_replaceVideoFrame(data){
		$('#video').html(data.responseJSON.html);
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
		if(this.video)
			this.video.time(val);
	}

	play(){
		if(this.video )
			this.video.play();
	}

	pause(){
		if(this.video )
			this.video.pause();
		
	}

	isPaused(){
		if(this.video){
			return this.video.state() !== 'playing';
		}
	}

	isReady(){
		return this.video !== undefined;
	}
}