/* settings */
var dateTimeInputFormat = "YYYY-MM-DD[T]HH:mm:ss[Z]";
var timezone = "Europe/Stockholm";
var scheduleContainerSelector = "#schedule-output-container";

var fallbackEventsURL = "/static/js/events.json";

var defaultEventsURL = fallbackEventsURL; /* until the events backend is up */
var apiKey = "";

/* used to add Font Awesome icons for each event tag */
var eventTagIcons = {
	"excursion": "bus",
	"food": "cutlery",
	"meet_and_greet": "handshake-o",
	"panel": "comments-o",
	"theme": "snowflake-o",
	"music": "music",
	"guest_of_honor": "star",
	"northern_light": "star",
	"shopping": "shopping-bag",
	"charity": "ambulance",
	"photo": "camera-retro",
	"art": "picture-o",
	"fursuit": "paw"
}

var iconPrefix = '<span class="label label-primary" aria-hidden="true">';
var iconSuffix = '</span>';

var currentSearch = "";
var selectedDay = "all";
var selectedCategory = "all";

moment.tz.setDefault(timezone);

function renderSchedule(events) {
	/* sort by start time */
	events.sort(function(a,b){return Date.parse(a.startTime) - Date.parse(b.startTime)});
	var currentTable = "";
	var previousStartDay = "";
	/* render each element */
	for (var i = 0; i < events.length; i++) {
		var event = events[i];
		var currentStartDay = moment(event.startTime).tz(timezone).format("dddd");
		
		if (currentStartDay != previousStartDay) {
			$(scheduleContainerSelector).append(currentTable);
			$(scheduleContainerSelector).append("<h3 class='day-title day-" + currentStartDay.toLowerCase() +"'>" + moment(event.startTime).tz(timezone).format("dddd[, ]MMMM Do") + "</h3>");
			var currentTable = $("<table class='table table-hover table-striped day-table day-" + currentStartDay.toLowerCase() + "'></table>");
			previousStartDay = currentStartDay;
		}

		var eventElement = $(eventToHtml(event));
		eventElement.addClass(renderTagsToClassList(event.eventTags));
		eventElement.addClass(getEventClasses(event));

		eventElement.click(event, function(e){
			var event = e.data;
			if (event.title == "Registration") {
				event.description = "";
			}
			var dialogContents = "" + 
			"<h4>Start time</h4><p>" + moment(event.startTime).tz(timezone).format("dddd[, ]HH:mm")  + "</p>" +
			"<h4>End time</h4><p>" + moment(event.endTime).tz(timezone).format("dddd[, ]HH:mm")  + "</p>" + 
			"<h4>Location</h4><p>" + event.location  + "</p>";
			if (event.description != "" && event.description.length > 5) {
				dialogContents += "<h4>Description</h4><p style='white-space: pre-wrap;'>" + event.description  + "</p>";
			}
			showDialog(event.title, dialogContents);
		});

		currentTable.append(eventElement);
	}
	$(scheduleContainerSelector).append(currentTable);
	initializeFiltering(events);
	$("#schedule-loader").addClass("hidden");
	$(scheduleContainerSelector).removeClass("hidden");
}

function getAllTags(events) {
	var tagList = [];
	for (var i = 0; i < events.length; i++) {
		for (var j = 0; j < events[i].eventTags.length; j++) {
			if (tagList.indexOf(events[i].eventTags[j]) == -1) {
				tagList.push(events[i].eventTags[j]);
			}
		}
	}
	return tagList.sort();
}

function getAllDays(events) {
	var dayList = [];
	for (var i = 0; i < events.length; i++) {
		var day = moment(events[i].startTime).tz(timezone).format("dddd");
		if (dayList.indexOf(day) == -1) {
			dayList.push(day);
		}
	}
	return dayList;
}

function initializeFiltering(events) {
	var searchInput = '' +
	'<div class="form-group">' +
		'<label class="control-label" for="event-search-input">Search </label>' +
		'<div class="input-group">' +
			'<div class="input-group-addon">' +
				'<i class="fa fa-search"></i>' +
			'</div>' +
			'<input class="form-control" type="text" id="event-search-input" name="Search" placeholder="Search..." maxlength="30">' +
		'</div>' +
	'</div>';
	

	var tagArray = getAllTags(events);
	var tagFilter = '' +
	'<div class="form-group">' +
		'<label class="control-label" for="event-filter-input">Category </label>' +
		'<div class="btn-container category-options-container" data-toggle="buttons">' +
		'<label class="btn btn-primary btn-sm active">' +
			'<input type="radio" name="filter-options" id="category_all" autocomplete="off" checked> All categories' +
		'</label> ';
		for (var i = 0; i < tagArray.length; i++) {
			if (tagArray[i] != "operations" && tagArray[i] != "main" ) {
				var tagIcon = "";
				if (eventTagIcons.hasOwnProperty(tagArray[i])) {
					tagIcon = '<i class="fa fa-' + eventTagIcons[tagArray[i]] + '" aria-hidden="true"></i> ';
				}
				var tag = tagArray[i].charAt(0).toUpperCase() + tagArray[i].slice(1);
				tagFilter += '' +
				'<label class="btn btn-primary btn-sm">' +
					tagIcon +
					'<input type="radio" name="filter-options" id="category_' + tagArray[i] + '" autocomplete="off">' +
					tag.replace(/_/g, " ") + 
				'</label> ';
			}
		}
		tagFilter += '' +
		'</div>' +
	'</div>';
	

	var dayArray = getAllDays(events);
	var dayFilter = '' +
	'<div class="form-group">' +
		'<label class="control-label" for="event-filter-input">Day </label>' +
		'<div class="btn-container day-options-container" data-toggle="buttons">' +
		'<label class="btn btn-primary btn-sm active">' +
			'<input type="radio" name="filter-day" id="day_all" autocomplete="off" checked> All days' +
		'</label> ';
		for (var i = 0; i < dayArray.length; i++) {
			dayFilter += '' +
			'<label class="btn btn-primary btn-sm">' +
				'<input type="radio" name="filter-day" id="day_' + dayArray[i].toLowerCase() + '" autocomplete="off">' +
				dayArray[i] + 
			'</label> ';
		}
		dayFilter += '' +
		'</div>' +
	'</div>';
	
	$(scheduleContainerSelector).prepend("<div class='well'>" + searchInput  + dayFilter + tagFilter + "</div>"); /* tag filter */


	$(".category-options-container label").click(function(e){
		selectedCategory = $(this).find("input").attr("id").split("category_")[1];
		search(currentSearch, selectedDay, selectedCategory);
	});
	$(".day-options-container label").click(function(e){
		selectedDay = $(this).find("input").attr("id").split("day_")[1];
		search(currentSearch, selectedDay, selectedCategory);
	});
	$('#event-search-input').on('input', function() {
		currentSearch = $(this).val().trim().replace(/\'/g, "");
		search(currentSearch, selectedDay, selectedCategory);
	});
}

function search(input, day, category) {
	if (day != "all") {
		$(".day-table").not(".day-" + day).addClass("hidden hidden_day");
		$(".day-" + day).removeClass("hidden hidden_day");
	} else {
		$(".day-table.hidden_day").removeClass("hidden hidden_day");
	}

	if (category != "all") {
		$(".day-table tr").not(".event_" + day).addClass("hidden hidden_category");
		$(".day-table tr.event_" + category).removeClass("hidden hidden_category");
	} else {
		$(".day-table tr.hidden_category").removeClass("hidden hidden_category");
	}

	if (input != "") {
		$(".day-table tr").not("tr:icontains('" + input + "')").addClass("hidden hidden_search");
		$(".day-table tr:icontains('" + input + "')").not(".hidden_category").removeClass("hidden hidden_search");
	} else {
		$(".day-table tr.hidden_search").not(".hidden_category").removeClass("hidden hidden_search");
	}

	$(".day-table.table-striped").removeClass("table-striped");

	$(".day-table tr:visible").each(function(index) {
		$(this).toggleClass("striped", !!(index & 1));
	});

	$(".day-title").each(function(index, title) {
		if ($(title).next(".day-table").find("tr:visible").size() == 0) {
			$(title).addClass("hidden");
		} else {
			$(title).removeClass("hidden");
		}
	});
}

function getEventClasses(event) {
	var classString = "";
	if (event.title == "ConOps") {
		classString = "conOpsEvent info";
	} else if (event.title == "Registration") {
		classString = "registrationEvent success";
	}
	return classString;
}

function renderTagsToClassList(tagArray) {
    if (tagArray) {
        var tagsString = "";
        for (var i = 0; i < tagArray.length; i++) {
			tagsString += "event_" + tagArray[i] + " ";
        }
        return tagsString;
    }
    return "";
}

function renderTagsToLabels(tagArray) {
    if (tagArray) {
        var tagsString = "";
        for (var i = 0; i < tagArray.length; i++) {
			var tag = tagArray[i].charAt(0).toUpperCase() + tagArray[i].slice(1);
			var classString = tagArray[i];

			/* add custom icons for each event category */
			if (eventTagIcons.hasOwnProperty(tagArray[i])) {
				tagsString += iconPrefix + '<i class="fa fa-' + eventTagIcons[tagArray[i]] + '" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			}
			
            tagsString += "<span class='label label-primary text-capitalize tag_" + classString + "'>" + tag.replace(/_/g, " ") + "</span> ";
        }
        return "<span class='event-tag-container'>" + tagsString + "</span>";
    }
    return "";
}

function eventToHtml(event) {
	var locationString = event.location;
	if (event.location.length > 25) {
		locationString = "See description";
	}
	
	var eventHTML = "<tr>" + 
	"<td>"  + event.title + " " + renderTagsToLabels(event.eventTags) + "</td>" +
	"<td>" + moment(event.startTime).tz(timezone).format("HH:mm") + " - " + moment(event.endTime).tz(timezone).format("HH:mm") + "</td>" +
	"<td>" + locationString + "</td>";
	return eventHTML;
}

jQuery.expr[':'].icontains = function(a, i, m) {
	return jQuery(a).text().toUpperCase()
		.indexOf(m[3].toUpperCase()) >= 0;
  };

$(document).ready(function() {
	if (document.querySelector(scheduleContainerSelector)) {
		$.getJSON(defaultEventsURL, function(data) {
			renderSchedule(data);
		}).fail(function() {
			/* load fallback data */
			//renderSchedule(eventData);
		});
	}
});

