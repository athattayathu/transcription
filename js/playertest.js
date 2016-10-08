//oembed: because holy shit


var obj = {
		  "title": "",
		  "chapters": [
			   {
			      "title": "",
			      "duration": "",
			      "video": {
			        "url": ""
			      },
			      "slides": [
			      ]
			   }
   		]
   	};

var keyConfig = {
			"recordTime" : 16,//shift
			"removeLast" : 27,//escape
			"playPause" : 32, //space
			"rewind" : 37,//left arrow
			"forward" : 39,//right arrow
			"recordModifier" : 18,//alt
			"slideAdvance" : 68,//a
			"slideReverse" : 65//d
	};

var slidesArr = [];

var slideController;

var videoController;

var clipbrd;

function generateSlideJSON(){

	var storeArr = [];
	for(var i = 0; i < slidesArr.length; i++){
		var object = {
			"time" : slidesArr[i].time,
			"url" : "https://speakerdeck.com/" + $('#slideId').val() + "#" + slidesArr[i].slideNum
		}
		storeArr.push(object);
	}

	obj.chapters[0].slides = storeArr;
}

function updateMetadata(){
	changeName();
	changeVideo();
	changeSlide();
	$('#myModal').modal('hide');
}

function addSlideObj(){
	var slideNum = 1;
	if(slidesArr.length > 0){
		slideNum = slidesArr[slidesArr.length - 1].slideNum + 1;
	}

   var source = {
				"time" : Math.round(videoController.getCurTime()),
				"slideNum" : slideNum
			 };
	slidesArr.push(source);

}

function updateData(){
	//parse data
	var jsonData = '';
	try{
		jsonData = JSON.parse($('#uploadVal').val());
	} catch(e){
		console.log(e);
		return;
	}

	var arr;
	var slideId;
	try {
		arr = _deconstructSlides(jsonData.chapters[0].slides);
		if(jsonData.chapters[0].slides[0]){
			var url = jsonData.chapters[0].slides[0].url;
			url = url.replace("https://speakerdeck.com/","");
			slideId = url.replace(/#\d+/i, "");
			$('#slideId').val(slideId);
		}
	} catch (e){
		console.log(e);
		return;
	}

	//update Backend data
	obj = jsonData;
	slidesArr = arr;

	// update UI Metadata
	//update UI slides

	updateMetadata();
	updateSlideUI();
	refreshSlideTable();
}

function _deconstructSlides(slides){
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

function refreshSlideTable(){

	const MINUTE_TO_SECOND = 60;
	const HOUR_TO_SECOND = 3600;

	$("#table tbody tr").remove();

	for (var i = 0; i < slidesArr.length; i++) {
		var hour = Math.trunc(slidesArr[i].time/HOUR_TO_SECOND);

		var minute = Math.trunc(slidesArr[i].time / MINUTE_TO_SECOND);
		var seconds = slidesArr[i].time % MINUTE_TO_SECOND;
		seconds = (seconds < 10)? '0' + seconds : seconds;

		var time =  minute + ':' + seconds ;
		time = (hour) ? (hour+":"+time) : time;
		console.log(time);
		var zIndex = slidesArr[i].slideNum - 1;
		$('#table').append(
			"<tr><td><img onclick='goToView(" + slidesArr[i].time + ", " + slidesArr[i].slideNum + ");' src='https://speakerd.s3.amazonaws.com/presentations/" 
				+ $('#slideId').val() + "/thumb_slide_" + zIndex
				+ ".jpg' onerror=\"this.src=''\"><td><td><button type='button' class='btn btn-info btn-sm highlight glyphicon glyphicon-link cp'  data-clipboard-text='[(" + time 
				+ ")](javascript:presentz.changeChapter(0," + zIndex 
				+ ",true);)'></button></td><td><div class='right-inner-addon'><i class='icon-search hidden_edit'></i><input data-index="
				+ zIndex + " pattern= '[0-9]' class='simplebox' value='" 
				+ slidesArr[i].slideNum + "'/></div></td><td>" + time + "</td></tr>"
	   );
	};
	$('input').change(function(e){
		var target = $(e.target);
		var index = target.data("index");
		slidesArr[index].slideNum = parseInt(target.val());
	});
	$('#scrollPane').scrollTop($('#scrollPane').prop("scrollHeight"));

}

function updateSlideUI(){

	var vals = $("#values");
	vals.val(JSON.stringify(obj, null, "   "));
	var textarea = document.getElementById("values");
	textarea.scrollTop = textarea.scrollHeight;

}

function changeName(){

	obj.title = 
		obj.chapters[0].title = 
		$('#title').val();

}

function changeVideo(){
	
	var newUrl = $("#videoUrl").val();
	/*if(newUrl !== obj.chapters[0].video.url){

		obj.chapters[0].video.url = newUrl;
		document.getElementById("dasource").setAttribute('src', newUrl);
   	
   	video.addEventListener('durationchange', function() {
		    obj.chapters[0].duration = Math.trunc(video.duration);
		});

   	video.load();

	}*/

	videoController.changeVideo(newUrl);
}

function changeSlide(){

	slideController.init($('#slideId').val());

   $('#slideNum').text(slideController.getCurrentSlide());

}


function goToView(videoTime, slideNum){
	videoController.goToTime(videoTime);
	slideController.goToSlide(slideNum);
	$('#slideNum').text(slideController.getCurrentSlide());
}

function keypressed(event){

	if ($(event.target).is('input, textarea')) {
	// check to make sure the keypresses are not originating from a text area
     	return;   
   }


	var keycode;
   
   if (window.event)
        keycode = window.event.keyCode;
   else if (event)
        keycode = event.which;

   if(keycode === keyConfig.recordTime){
   	if(videoController.isReady()){
	   	addSlideObj();
	   	updateSlideUI();
	   	refreshSlideTable();
	   }

   } else if(keycode === keyConfig.removeLast){

   	slidesArr.pop();
   	refreshSlideTable();

   } else if(keycode === keyConfig.playPause){

   	if(videoController.isPaused()){
   		videoController.play();
   	} else {
   		videoController.pause();
   	}
   	if(keycode === 32){
   		event.preventDefault();
   	}

   } else if(keycode === keyConfig.rewind){

   	videoController.goToTime(videoController.getCurTime() - 1);

   } else if(keycode === keyConfig.forward){
   	videoController.goToTime(videoController.getCurTime() + 1);

   } else if(keycode === keyConfig.slideAdvance){
   	if(slideController){
   		slideController.next();
   		$('#slideNum').text(slideController.getCurrentSlide());
   	}

   } else if(keycode === keyConfig.slideReverse){
		if(slideController){
   		slideController.previous();
   		$('#slideNum').text(slideController.getCurrentSlide());
   	}

   }
}

function slideLoadHandler() {

	var slideFrame = document.getElementById("slideSet");

   slideController = new SlideController(slideFrame, window);

}

function init()
{
	console.log(window);
   var video = document.getElementById("video");

   $(document).unbind('keydown');//removes any previous handlers left over after refresh
   $(document).keydown(keypressed);
   clipbrd = new Clipboard('.cp');

   videoController = new VideoController('video', window);
   
   console.log("video controller set");
}

