class VideoController {
	controller(videoId,window){
		this.videoUrl = "";
		this.window = window;
		this.videoDiv = $('#'+videoId);
		this.video={};
		window._wq = window._wq || [];
	}

	getCurVideo(){
		return this.videoUrl;
	}

	changeVideo(url){
		this._getVideo(url);
		videoUrl = url;
	}



	_getVideo(url){
		$.ajax({
			type:"GET",
		  	url:'http://fast.wistia.com/oembed?url='+Utility.fixedEncodeURI(url),
		  	dataType:'jsonp',
		  	jsonpCallback:'callback',
		  	success: this._replaceVideoFrame
		});
	}

	_replaceVideoFrame(json){
		videoDiv.html(json.html);
		_wq.push({ id: "_all", onReady: function(videoReturn) {
			this.video = videoReturn;
		  console.log("I got a handle to the video!", videoReturn);
		}});
	}

	getCurTime(){
		return this.video.time();
	}

	goToTime(val){
		return this.video.time(val);
	}
}