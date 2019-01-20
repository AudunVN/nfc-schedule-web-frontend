(function(){var _ShortUniqueId=function _ShortUniqueId(options){var self=this;this.DEFAULT_RANDOM_ID_LEN=6;this.DICT_RANGES={digits:[48,58],lowerCase:[97,123],upperCase:[65,91]};this.dict=[];this.log=function log(){var args=[],len=arguments.length;while(len--)args[len]=arguments[len];args[0]="[short-unique-id] "+args[0];if(this.debug===true){if(typeof console!=="undefined"&&console!==null){return console.log.apply(console,args)}}return undefined};this.getDict=function getDict(){return this.dict};this.sequentialUUID=function sequentialUUID(){var counterDiv;var counterRem;var id;id="";counterDiv=this.counter;while(true){counterRem=counterDiv%self.dictLength;counterDiv=parseInt(counterDiv/self.dictLength,10);id+=self.dict[counterRem];if(counterDiv===0){break}}this.counter+=1;return id};this.randomUUID=function randomUUID(uuidLength){var id;var randomPartIdx;var _j;if(uuidLength===null||typeof uuidLength==="undefined"){uuidLength=this.DEFAULT_RANDOM_ID_LEN}if(uuidLength===null||typeof uuidLength==="undefined"||uuidLength<1){throw new Error("Invalid UUID Length Provided")}var idIndex;id="";for(idIndex=_j=0;0<=uuidLength?_j<uuidLength:_j>uuidLength;idIndex=0<=uuidLength?++_j:--_j){randomPartIdx=parseInt(Math.random()*self.dictLength)%self.dictLength;id+=self.dict[randomPartIdx]}return id};this.dictIndex=this._i=0;var rangeType;for(rangeType in self.DICT_RANGES){self.dictRange=self.DICT_RANGES[rangeType];self.lowerBound=self.dictRange[0],self.upperBound=self.dictRange[1];for(this.dictIndex=this._i=this.lowerBound;this.lowerBound<=this.upperBound?this._i<this.upperBound:this._i>this.upperBound;this.dictIndex=this.lowerBound<=this.upperBound?++this._i:--this._i){self.dict.push(String.fromCharCode(self.dictIndex))}}this.dict=this.dict.sort(function(){return Math.random()<=.5});this.dictLength=this.dict.length;if(options===null||typeof options==="undefined"){options={}}this.counter=0;this.debug=options.debug;this.log("Generator created with Dictionary Size "+this.dictLength)};if(typeof module!=="undefined"&&typeof module.exports!=="undefined"){module.exports=_ShortUniqueId}else if(typeof define==="function"&&define.amd){define([],function(){return _ShortUniqueId})}else{window.ShortUniqueId=_ShortUniqueId}})();
(function(){var _ShortUniqueId=function _ShortUniqueId(options){var self=this;this.DEFAULT_RANDOM_ID_LEN=6;this.DICT_RANGES={digits:[48,58],lowerCase:[97,123],upperCase:[65,91]};this.dict=[];this.log=function log(){var args=[],len=arguments.length;while(len--)args[len]=arguments[len];args[0]="[short-unique-id] "+args[0];if(this.debug===true){if(typeof console!=="undefined"&&console!==null){return console.log.apply(console,args)}}return undefined};this.getDict=function getDict(){return this.dict};this.sequentialUUID=function sequentialUUID(){var counterDiv;var counterRem;var id;id="";counterDiv=this.counter;while(true){counterRem=counterDiv%self.dictLength;counterDiv=parseInt(counterDiv/self.dictLength,10);id+=self.dict[counterRem];if(counterDiv===0){break}}this.counter+=1;return id};this.randomUUID=function randomUUID(uuidLength){var id;var randomPartIdx;var _j;if(uuidLength===null||typeof uuidLength==="undefined"){uuidLength=this.DEFAULT_RANDOM_ID_LEN}if(uuidLength===null||typeof uuidLength==="undefined"||uuidLength<1){throw new Error("Invalid UUID Length Provided")}var idIndex;id="";for(idIndex=_j=0;0<=uuidLength?_j<uuidLength:_j>uuidLength;idIndex=0<=uuidLength?++_j:--_j){randomPartIdx=parseInt(Math.random()*self.dictLength)%self.dictLength;id+=self.dict[randomPartIdx]}return id};this.dictIndex=this._i=0;var rangeType;for(rangeType in self.DICT_RANGES){self.dictRange=self.DICT_RANGES[rangeType];self.lowerBound=self.dictRange[0],self.upperBound=self.dictRange[1];for(this.dictIndex=this._i=this.lowerBound;this.lowerBound<=this.upperBound?this._i<this.upperBound:this._i>this.upperBound;this.dictIndex=this.lowerBound<=this.upperBound?++this._i:--this._i){self.dict.push(String.fromCharCode(self.dictIndex))}}this.dict=this.dict.sort(function(){return Math.random()<=.5});this.dictLength=this.dict.length;if(options===null||typeof options==="undefined"){options={}}this.counter=0;this.debug=options.debug;this.log("Generator created with Dictionary Size "+this.dictLength)};if(typeof module!=="undefined"&&typeof module.exports!=="undefined"){module.exports=_ShortUniqueId}else if(typeof define==="function"&&define.amd){define([],function(){return _ShortUniqueId})}else{window.ShortUniqueId=_ShortUniqueId}})();
(function($){$.fn.scrollbox=function(config){var defConfig={linear:false,startDelay:2,delay:3,step:5,speed:32,switchItems:1,direction:"vertical",distance:"auto",autoPlay:true,onMouseOverPause:true,paused:false,queue:null,listElement:"ul",listItemElement:"li",infiniteLoop:true,switchAmount:0,afterForward:null,afterBackward:null,triggerStackable:false};config=$.extend(defConfig,config);config.scrollOffset=config.direction==="vertical"?"scrollTop":"scrollLeft";if(config.queue){config.queue=$("#"+config.queue)}return this.each(function(){var container=$(this),containerUL,scrollingId=null,nextScrollId=null,paused=false,releaseStack,backward,forward,resetClock,scrollForward,scrollBackward,forwardHover,pauseHover,switchCount=0,stackedTriggerIndex=0;if(config.onMouseOverPause){container.bind("mouseover",function(){paused=true});container.bind("mouseout",function(){paused=false})}containerUL=container.children(config.listElement+":first-child");if(config.infiniteLoop===false&&config.switchAmount===0){config.switchAmount=containerUL.children().length}scrollForward=function(){if(paused){return}var curLi,i,newScrollOffset,scrollDistance,theStep;curLi=containerUL.children(config.listItemElement+":first-child");scrollDistance=config.distance!=="auto"?config.distance:config.direction==="vertical"?curLi.outerHeight(true):curLi.outerWidth(true);if(!config.linear){theStep=Math.max(3,parseInt((scrollDistance-container[0][config.scrollOffset])*.3,10));newScrollOffset=Math.min(container[0][config.scrollOffset]+theStep,scrollDistance)}else{newScrollOffset=Math.min(container[0][config.scrollOffset]+config.step,scrollDistance)}container[0][config.scrollOffset]=newScrollOffset;if(newScrollOffset>=scrollDistance){for(i=0;i<config.switchItems;i++){if(config.queue&&config.queue.find(config.listItemElement).length>0){containerUL.append(config.queue.find(config.listItemElement)[0]);containerUL.children(config.listItemElement+":first-child").remove()}else{containerUL.append(containerUL.children(config.listItemElement+":first-child"))}++switchCount}container[0][config.scrollOffset]=0;clearInterval(scrollingId);scrollingId=null;if($.isFunction(config.afterForward)){config.afterForward.call(container,{switchCount:switchCount,currentFirstChild:containerUL.children(config.listItemElement+":first-child")})}if(config.triggerStackable&&stackedTriggerIndex!==0){releaseStack();return}if(config.infiniteLoop===false&&switchCount>=config.switchAmount){return}if(config.autoPlay){nextScrollId=setTimeout(forward,config.delay*1e3)}}};scrollBackward=function(){if(paused){return}var curLi,i,newScrollOffset,scrollDistance,theStep;if(container[0][config.scrollOffset]===0){for(i=0;i<config.switchItems;i++){containerUL.children(config.listItemElement+":last-child").insertBefore(containerUL.children(config.listItemElement+":first-child"))}curLi=containerUL.children(config.listItemElement+":first-child");scrollDistance=config.distance!=="auto"?config.distance:config.direction==="vertical"?curLi.height():curLi.width();container[0][config.scrollOffset]=scrollDistance}if(!config.linear){theStep=Math.max(3,parseInt(container[0][config.scrollOffset]*.3,10));newScrollOffset=Math.max(container[0][config.scrollOffset]-theStep,0)}else{newScrollOffset=Math.max(container[0][config.scrollOffset]-config.step,0)}container[0][config.scrollOffset]=newScrollOffset;if(newScrollOffset===0){--switchCount;clearInterval(scrollingId);scrollingId=null;if($.isFunction(config.afterBackward)){config.afterBackward.call(container,{switchCount:switchCount,currentFirstChild:containerUL.children(config.listItemElement+":first-child")})}if(config.triggerStackable&&stackedTriggerIndex!==0){releaseStack();return}if(config.autoPlay){nextScrollId=setTimeout(forward,config.delay*1e3)}}};releaseStack=function(){if(stackedTriggerIndex===0){return}if(stackedTriggerIndex>0){stackedTriggerIndex--;nextScrollId=setTimeout(forward,0)}else{stackedTriggerIndex++;nextScrollId=setTimeout(backward,0)}};forward=function(){clearInterval(scrollingId);scrollingId=setInterval(scrollForward,config.speed)};backward=function(){clearInterval(scrollingId);scrollingId=setInterval(scrollBackward,config.speed)};forwardHover=function(){config.autoPlay=true;paused=false;clearInterval(scrollingId);scrollingId=setInterval(scrollForward,config.speed)};pauseHover=function(){paused=true};resetClock=function(delay){config.delay=delay||config.delay;clearTimeout(nextScrollId);if(config.autoPlay){nextScrollId=setTimeout(forward,config.delay*1e3)}};if(config.autoPlay){nextScrollId=setTimeout(forward,config.startDelay*1e3)}container.bind("resetClock",function(delay){resetClock(delay)});container.bind("forward",function(){if(config.triggerStackable){if(scrollingId!==null){stackedTriggerIndex++}else{forward()}}else{clearTimeout(nextScrollId);forward()}});container.bind("backward",function(){if(config.triggerStackable){if(scrollingId!==null){stackedTriggerIndex--}else{backward()}}else{clearTimeout(nextScrollId);backward()}});container.bind("pauseHover",function(){pauseHover()});container.bind("forwardHover",function(){forwardHover()});container.bind("speedUp",function(event,speed){if(speed==="undefined"){speed=Math.max(1,parseInt(config.speed/2,10))}config.speed=speed});container.bind("speedDown",function(event,speed){if(speed==="undefined"){speed=config.speed*2}config.speed=speed});container.bind("updateConfig",function(event,options){config=$.extend(config,options)})})}})(jQuery);

var eventData = [];

var defaultBaseAPIURL = "https://games-api-staging.nordicfuzzcon.org/schedule/v1";

var defaultScheduleData = {
		settings: {
			zoom: 1.3,
			sliderInterval: 10000,
			sliderTransition: 500,
			baseApiUrl: defaultBaseAPIURL,
			getEventsURL: defaultBaseAPIURL + "/events",
		},
		messages: [
			"<h3>Welcome to <a href='https://twitter.com/intent/tweet?button_hashtag=NFC2019'>#NFC2019</a>!</h3>",
		],
		sliderImgs: [
			{
				url: "https://www.nordicfuzzcon.org/Content/themes/2019/img/placeholder_1.jpg",
				caption: ""
			},
			{
				url: "https://www.nordicfuzzcon.org/Content/themes/2019/img/background/nfc-banner_md.jpg",
				caption: ""
			},
			{
				url: "https://www.nordicfuzzcon.org/Content/themes/2019/img/background/Background_cmp_2000px.jpg",
				caption: ""
			}
		]
	};

var scheduleData = defaultScheduleData;

$('#clock').fitText(1.3);

function updateClock() {
  $('#clock').html(moment().format('D. MMMM YYYY H:mm:ss'));
}

var currentImgIndex = 0;

function updateSliders() {
	var availableHeight = $(".row > :first-child .panel-content-wrapper").outerHeight() - $(".row > :first-child .list-group-item:nth-child(1)").outerHeight() - $(".row > :first-child .list-group-item:nth-child(2)").outerHeight();
	console.log(availableHeight);
	var imgSrc = scheduleData.sliderImgs[currentImgIndex].url;
	currentImgIndex++;
	if (currentImgIndex > scheduleData.sliderImgs.length - 1) {
		currentImgIndex = 0;
	}
	if (availableHeight > 0) {
		$("#image-display").height(availableHeight);
		$("#image-display .next-img").css("background-image", "url('" + imgSrc + "')");
		$(".slide-img").toggleClass("current-img");
		$(".slide-img").toggleClass("next-img");
	}
	$('#scroller').slick('next');
}

function renderMessages() {
	$("#scroller").html("");
	for (i = 0; i < scheduleData.messages.length; i++) {
		$("#scroller").append('<div class="scroll-content">' + scheduleData.messages[i] + '</div>');
	}
}

function loadSettings() {
	if (scheduleData.settings.zoom) {
		$(".schedule").css("zoom", scheduleData.settings.zoom);
	}
}

setInterval(updateClock, 1000);

loadSettings();

renderMessages();

function getScheduleData() {
	
}

function populateLocalData(scheduleData) {
	
}

function renderLocalData() {
	
}

function updateSchedule() {
	var firstEvent = $(".table tr:first");
	firstEvent.fadeOut(500, function(){
		firstEvent.removeClass("success");
		firstEvent.parent().append(firstEvent);
		firstEvent.show();
		setTimeout(function(){
			$(".table tr").not(".success").first().addClass("success");
		}, 5000+(Math.random()-0.5)*4000);
	});
}

$('#scroller').slick({
  vertical: true,
  autoplay: false,
  speed: 500,
  arrows: false
});

updateSliders();

setInterval(updateSchedule, 10000);

setInterval(updateSliders, scheduleData.settings.sliderInterval);