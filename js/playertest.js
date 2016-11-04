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

var FTU = true;

function generateSlideJSON(){

	var storeArr = [];
	var speakerUrl = $('#slideId').val()
	var url = slideController.getSlideSpecificUrl();
	for(var i = 0; i < slidesArr.length; i++){
		var object = {
			"time" : slidesArr[i].time,
			"url" :  url + "#" + slidesArr[i].slideNum
		}
		storeArr.push(object);
	}

	obj.chapters[0].slides = storeArr;
	obj.chapters[0].duration = videoController.getTotalDuration();

	var title = $("#title").val();
	title = (title) ? title : "untitled" ;
	obj.title = title;
	obj.chapters[0].title = title;

	var ogUrl = $('#ogURL').val();
	obj.chapters[0].video.url = (ogUrl) ? ogUrl : "don't have url";
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

function uploadData(){
	//parse data
	var jsonData = '';
	try{
		jsonData = JSON.parse($('#uploadVal').val());
	} catch(e){
		console.error(e.message);
		return;
	}

	var arr;
	var slideId;
	try {

		arr = _deconstructSlides(jsonData.chapters[0].slides);

		var chapterOne = jsonData.chapters[0];
		if(chapterOne){
			$('#ogURL').val(chapterOne.video.url);
			$('#title').val(chapterOne.title);

		}
	} catch (e){
		console.error(e.message);
		return;
	}

	//update Backend data
	obj = jsonData;
	slidesArr = arr;

	// update UI Metadata
	$("#videoUrl").val($("#uploadSyncUrl").val());
	$("#slideId").val($("#uploadSlideUrl").val());
	//update UI slides

	try{
		changeVideo();
	} catch (e){
		if(e instanceof ControllerError) {
			console.log(e.message);
		}
		else{
			console.error(e.message);
		}

	}
	changeSlide();
	changeName();
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


	$("#table tbody tr").remove();

	var specUrl = slideController.getSlideSpecificUrl();
	specUrl = "https://speakerd.s3.amazonaws.com/presentations/" + specUrl.substr(specUrl.indexOf("player/") + 7);
	console.error("specUrl :"+ specUrl);
	for (var i = 0; i < slidesArr.length; i++) {
	
		var time = Utility.timeToStr(slidesArr[i].time);

		var zIndex = slidesArr[i].slideNum - 1;
		$('#table').append(
			"<tr><td><img onclick='goToView(" + slidesArr[i].time + ", " + slidesArr[i].slideNum + ");' src='" 
				+ specUrl + "/thumb_slide_" + zIndex
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

function updateMetadata(){
	try{
		changeVideo();
		changeSlide();
		changeName();
		$('#vidInfoModal').modal('hide');
	} catch (e) {
		if(e instanceof ControllerError) {
			console.log(e.message);
		}
		else{
			console.error(e.message);
		}
	}
}

function updateSlideUI(){

	var vals = $("#values");
	vals.val(JSON.stringify(obj, null, "   "));
	var textarea = document.getElementById("values");
	textarea.scrollTop = textarea.scrollHeight;

}

function changeName(){

	var title = $("#title").val();

	obj.title = title;
	obj.chapters[0].title = title;

}

function changeVideo(){
	var jqUrl = $("#videoUrl");
	var newUrl;
	if(! jqUrl.val()){
		jqUrl = $("#ogURL");
	}
	
	newUrl = Utility.prependHttps(jqUrl.val());

	jqUrl.val(newUrl);
	try{
		videoController.changeVideo(newUrl);
		jqUrl.parent().removeClass("has-error", "has-feedback");
	} catch (e){
		jqUrl.parent().addClass("has-error", "has-feedback");
		throw e;
	}
}

function changeSlide(){
	var jqUrl = $('#slideId');
	var slideUrl = Utility.prependHttps(jqUrl.val());
	
	try{
		slideController.changeDeck(slideUrl);
		jqUrl.parent().removeClass("has-error", "has-feedback");
	} catch (e){
		jqUrl.parent().addClass("has-error", "has-feedback");
		throw e;
	}

   $('#slideNum').text(slideController.getCurrentSlide());

}


function goToView(videoTime, slideNum){
	videoController.goToTime(videoTime);
	slideController.goToSlide(slideNum);
	$('#slideNum').text(slideController.getCurrentSlide());
}

function recordTime(){
	if(videoController.isReady()){
	   	addSlideObj();
	   	updateSlideUI();
	   	refreshSlideTable();
	}
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
   	recordTime();

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

   	videoController.goToTime(videoController.getCurTime() - 2);

   } else if(keycode === keyConfig.forward){
   	videoController.goToTime(videoController.getCurTime() + 2);

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


function init()
{
   var video = document.getElementById("video");
   if (FTU){
   	$('#vidInfoModal').modal('show');
   	FTU = false;
   }
   $(document).unbind('keydown');//removes any previous handlers left over after refresh
   $(document).keydown(keypressed);
   clipbrd = new Clipboard('.cp');

   videoController = new VideoController('video', window);
   slideController = new SlideController("slideSet", window);
 
}

