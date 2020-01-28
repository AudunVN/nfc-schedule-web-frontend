/* settings */
var dateTimeInputFormat = "YYYY-MM-DD[T]HH:mm:ss[Z]";
var timezone = "Europe/Stockholm";
var scheduleContainerSelector = "#schedule-output-container";

var fallbackEventsURL = "/static/js/events.json";

var defaultEventsURL = "https://games-api-staging.nordicfuzzcon.org/schedule/v1/events";
var apiKey = "staging-read";

if (window.location.href.indexOf("www.nordicfuzzcon.org") == -1) {
	/* switch to production */
	defaultEventsURL = "https://games-api.nordicfuzzcon.org/schedule/v1/events";
	apiKey = "f18f8411-42ba-4587-aed0-90d55bcb3b49";
}

/* used to add Font Awesome icons for each event tag */
var eventTagIcons = {
	"excursion": "fa fa-bus",
	"food": "fa fa-cutlery",
	"meet_and_greet": "fa fa-handshake-o",
	"panel": "fa fa-comments-o",
	"theme": "fa fa-snowflake-o",
	"music": "fa fa-music",
	"guest_of_honor": "fa fa-star",
	"northern_light": "fa fa-star",
	"shopping": "fa fa-shopping-bag",
	"charity": "icons8-cat",
	"photo": "fa fa-camera-retro",
	"art": "fa fa-picture-o",
	"fursuit": "icons8-cat-head",
	"dance": "icons8-dancing",
	"photography": "fa fa-camera",
	"gaming": "icons8-dice",
	"performance": "icons8-dynamic-microphone",
	"competition": "icons8-game-position",
	"party": "icons8-party-balloons",
	"operations": "icons8-clipboard-checklist",
	"open_house": "fa fa-home",
	"event_details_updated": "fa fa-exclamation-triangle",
	"super_sponsor_queue": "icons8-queue",
	"healthcare": "fa fa-heart-o",
	"physical_activity": "icons8-exercise"
}

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

		if (event.hasOwnProperty("changedFrom")) {
			if (event.startTime != event.changedFrom.startTime || event.endTime != event.changedFrom.endTime || event.location != event.changedFrom.location) {
				event.eventTags.push("event_details_updated");
			}
		}

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
			var dialogContents = "<div class='row'>" + 
			"<div class='col-sm-6'><h4>Start time</h4><p>" + moment(event.startTime).tz(timezone).format("dddd[, ]HH:mm")  + "</p></div>" +
			"<div class='col-sm-6'><h4>End time</h4><p>" + moment(event.endTime).tz(timezone).format("dddd[, ]HH:mm")  + "</p></div></div>" + 
			"<div class='row'><div class='col-sm-6'><h4>Location</h4><p>" + event.location  + "</p></div>";
			if (event.eventTags && event.eventTags.length > 0) {
				
				dialogContents += "<div class='col-sm-6'><h4>Categories</h4><p>" + renderTagsToLabels(event.eventTags, true)  + "</p></div>";
			}
			dialogContents += "</div>";
			if (event.description != "" && event.description.length > 5) {
				dialogContents += "<h4>Description</h4><p style='white-space: pre-wrap;'>" + event.description  + "</p>";
			}
			showDialog(event.title, dialogContents);
		});

		currentTable.append(eventElement);
	}
	$(scheduleContainerSelector).append(currentTable);
	initializeFiltering(events);

	$(".day-table.table-striped").removeClass("table-striped");

	$(".day-table tr").each(function(index) {
		$(this).toggleClass("striped", !!(index & 1));
	});

	$(".event-tag-container .badge").each(function(index) {
		$(this).attr("data-toggle", "tooltip");
		$(this).attr("title", $(this).text());
		$(this).tooltip({
			placement: 'top',
		});
	});

	$('[data-toggle="tooltip"]') 

	$("#schedule-loader").addClass("d-none");
	$(scheduleContainerSelector).removeClass("d-none");
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
			'<div class="input-group-prepend">' +
				'<span class="input-group-text"><i class="fa fa-search"></i></span>' +
			'</div>' +
			'<input class="form-control" type="text" id="event-search-input" name="Search" placeholder="Search..." maxlength="30">' +
			'<span class="input-group-append">' +
				'<button class="btn btn-warning clear-search" type="button">Reset</button>' +
			'</span>' +
		'</div>' +
	'</div>';
	

	var tagArray = getAllTags(events);
	var tagFilter = '' +
	'<div class="form-group">' +
		'<label class="control-label" for="event-filter-input">Category </label>' +
		'<div class="btn-container category-options-container btn-group-toggle" data-toggle="buttons">' +
		'<label class="btn btn-primary no-fullwidth-btn btn-sm active">' +
			'<input type="radio" name="filter-options" id="category_all" autocomplete="off" checked> All categories' +
		'</label> ';
		for (var i = 0; i < tagArray.length; i++) {
			if (tagArray[i] != "main" ) {
				var tagIcon = "";
				if (eventTagIcons.hasOwnProperty(tagArray[i])) {
					tagIcon = '<i class="' + eventTagIcons[tagArray[i]] + '" aria-hidden="true"></i> ';
				}
				var tag = tagArray[i].charAt(0).toUpperCase() + tagArray[i].slice(1);
				tagFilter += '' +
				'<label class="btn btn-primary no-fullwidth-btn btn-sm">' +
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
		'<div class="btn-container day-options-container btn-group-toggle" data-toggle="buttons">' +
		'<label class="btn btn-primary no-fullwidth-btn btn-sm active">' +
			'<input type="radio" name="filter-day" id="day_all" autocomplete="off" checked> All days' +
		'</label> ';
		for (var i = 0; i < dayArray.length; i++) {
			dayFilter += '' +
			'<label class="btn btn-primary no-fullwidth-btn btn-sm">' +
				'<input type="radio" name="filter-day" id="day_' + dayArray[i].toLowerCase() + '" autocomplete="off">' +
				dayArray[i] + 
			'</label> ';
		}
		dayFilter += '' +
		'</div>' +
	'</div>';
	
	$(scheduleContainerSelector).prepend("<div class='card border-light mb-3'><div class='card-body pb-1 pt-3'>" + searchInput  + dayFilter + tagFilter + "</div></div>"); /* tag filter */
	$(scheduleContainerSelector).append('<div class="text-center d-none" id="no-results-msg"><h4>No events found</h4><button class="btn btn-warning clear-search" type="button">Reset search</button></div>');

	var currentUrl = window.location.href;

	var urlSearch = getUrlParameter(currentUrl, "search");
	var urlDay = getUrlParameter(currentUrl, "day");
	var urlCategory = getUrlParameter(currentUrl, "category");

	if (urlSearch || urlDay || urlCategory) {
		if (urlSearch) {
			$('#event-search-input').val(urlSearch);
			currentSearch = urlSearch;
		}
		if (urlDay) {
			$(".day-options-container label #day_" + urlDay).click();
			selectedDay = urlDay;
		}
		if (urlCategory) {
			$(".category-options-container label #category_" + urlCategory).click();
			selectedCategory = urlCategory;
		}
		search(currentSearch, selectedDay, selectedCategory);
	}

	$(".category-options-container label").click(function(e){
		selectedCategory = $(this).find("input").attr("id").split("category_")[1];
		search(currentSearch, selectedDay, selectedCategory);
	});
	$(".day-options-container label").click(function(e){
		selectedDay = $(this).find("input").attr("id").split("day_")[1];
		search(currentSearch, selectedDay, selectedCategory);
	});
	$(scheduleContainerSelector + " .clear-search").click(function(e){
		$("#day_all").click();
		$("#category_all").click();
		$('#event-search-input').val("");

		currentSearch = "";
		selectedDay = "all";
		selectedCategory = "all";

		search(currentSearch, selectedDay, selectedCategory);
	});
	$('#event-search-input').on('input', function() {
		currentSearch = $(this).val().trim().replace(/\'/g, "");
		search(currentSearch, selectedDay, selectedCategory);
	});
}

function search(input, day, category) {
	if (day != "all") {
		$(".day-table").not(".day-" + day).addClass("d-none hidden_day");
		$(".day-" + day).removeClass("d-none hidden_day");
		window.history.replaceState({}, document.title, setUrlParameter(window.location.href, "day", day));
	} else {
		$(".day-table.hidden_day").removeClass("d-none hidden_day");
		window.history.replaceState({}, document.title, setUrlParameter(window.location.href, "day", ""));
	}

	if (category != "all") {
		$(".day-table tr").not(".event_" + category).addClass("d-none hidden_category");
		$(".day-table tr.event_" + category).removeClass("d-none hidden_category");
		window.history.replaceState({}, document.title, setUrlParameter(window.location.href, "category", category));
	} else {
		$(".day-table tr.hidden_category").removeClass("d-none hidden_category");
		window.history.replaceState({}, document.title, setUrlParameter(window.location.href, "category", ""));
	}

	if (input != "") {
		$(".day-table tr").not("tr:icontains('" + input + "')").addClass("d-none hidden_search");
		$(".day-table tr:icontains('" + input + "')").not(".hidden_category").removeClass("d-none hidden_search");
		window.history.replaceState({}, document.title, setUrlParameter(window.location.href, "search", input));
	} else {
		$(".day-table tr.hidden_search").not(".hidden_category").removeClass("d-none hidden_search");
		window.history.replaceState({}, document.title, setUrlParameter(window.location.href, "search", ""));
	}

	$(".day-title").each(function(index, title) {
		if ($(title).next(".day-table:not(.hidden_day)").find("tr:not(.hidden_category,.hidden_search)").length == 0) {
			$(title).addClass("d-none");
			$(title).next(".day-table").addClass("d-none");
		} else {
			$(title).removeClass("d-none");
			$(title).next(".day-table").removeClass("d-none");
		}
	});

	if ($(".day-table tr:visible").length == 0) {
		$("#no-results-msg").removeClass("d-none");
	} else {
		$("#no-results-msg").addClass("d-none");
	}

	setTimeout(function() {
		$(".day-title").each(function(index, title) {
			if ($(title).next(".day-table:not(.hidden_day)").find("tr:not(.hidden_category,.hidden_search)").length == 0) {
				$(title).addClass("d-none");
				$(title).next(".day-table").addClass("d-none");
			} else {
				$(title).removeClass("d-none");
				$(title).next(".day-table").removeClass("d-none");
			}
		});

		if ($(".day-table tr:visible").length == 0) {
			$("#no-results-msg").removeClass("d-none");
		} else {
			$("#no-results-msg").addClass("d-none");
		}

		$(".day-table.table-striped").removeClass("table-striped");

		$(".day-table tr:visible").each(function(index) {
			$(this).toggleClass("striped", !!(index & 1));
		});
	}, 0);
}

function getEventClasses(event) {
	var classString = "";
	if (event.title == "ConOps") {
		classString = "conOpsEvent bg-info";
	} else if (event.title == "Registration") {
		classString = "registrationEvent bg-success";
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

function renderTagsToLabels(tagArray, showLabels) {
    if (tagArray) {
        var tagsString = "";
        for (var i = 0; i < tagArray.length; i++) {
			var tag = tagArray[i].charAt(0).toUpperCase() + tagArray[i].slice(1);
			var classString = tagArray[i];
			var textClassString = "";
			var iconString = "";

			/* add custom icons for each event category */
			if (eventTagIcons.hasOwnProperty(tagArray[i])) {
				iconString = '<i class="' + eventTagIcons[tagArray[i]] + '" aria-hidden="true"></i> ';
				if (!showLabels) {
					textClassString += " sr-only";
				}
			}
			var labelClass = "badge-primary";
			if (tagArray[i] == "event_details_updated") {
				labelClass = "badge-warning";
			}
			
            tagsString += "<span class='badge " + labelClass + " text-capitalize tag_" + classString + "'>" + iconString + "<span class='category-text-label" + textClassString + "'>" + tag.replace(/_/g, " ") + "</span></span> ";
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
	"<td>" + moment(event.startTime).tz(timezone).format("HH:mm") + "<span class='separator-desktop'> - </span><span class='separator-mobile'><br></span>" + moment(event.endTime).tz(timezone).format("HH:mm") + " " + renderTagsToLabels(event.eventTags) +  "</td>" +
	"<td>" + locationString + "</td>";
	return eventHTML;
}

jQuery.expr[':'].icontains = function(a, i, m) {
	return jQuery(a).text().toUpperCase()
		.indexOf(m[3].toUpperCase()) >= 0;
  };

$(document).ready(function() {
	if (document.querySelector(scheduleContainerSelector)) {
		$.ajax({
			url: defaultEventsURL,
			type: 'GET',
			dataType: 'json',
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-API-KEY', apiKey);
			},
			success: function(data) {
				console.log("Got events!");
				renderSchedule(data);
			},
			error: function() {
				$.getJSON(fallbackEventsURL, function(data) {
					renderSchedule(data);
				}).fail(function() {
					console.warn("Unable to load events data!");
				});
			}
		});
	}
});

