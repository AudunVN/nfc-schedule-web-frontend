/* settings */
var dateTimeInputFormat = "YYYY-MM-DD[T]HH:mm:ss[Z]";
var timezone = "Europe/Stockholm";
var scheduleContainerSelector = "#schedule-output-container";

var fallbackEventsURL = "/static/js/events.json";

var defaultEventsURL = fallbackEventsURL; /* until the events backend is up */
var apiKey = "";

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
			$(scheduleContainerSelector).append("<h3>" + currentStartDay + "</h3>");
			var currentTable = $("<table class='table table-hover'></table>");
			previousStartDay = currentStartDay;
		}

		var eventElement = $(eventToHtml(event));
		eventElement.addClass(renderTagsToClassList(event.eventTags));

		eventElement.click(event, function(e){
			var event = e.data;
			var dialogContents = "" + 
			"<h4>Start time</h4><p>" + moment(event.startTime).tz(timezone).format("dddd[, ]HH:mm")  + "</p>" +
			"<h4>End time</h4><p>" + moment(event.endTime).tz(timezone).format("dddd[, ]HH:mm")  + "</p>" + 
			"<h4>Location</h4><p>" + event.location  + "</p>" +
			"<h4>Description</h4><p style='white-space: pre-wrap;'>" + event.description  + "</p>";
			showDialog(event.title, dialogContents);
		});

		currentTable.append(eventElement);
	}
	$(scheduleContainerSelector).append(currentTable);
}

function initializeFiltering(events) {

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
			var iconPrefix = '<span class="label label-info" aria-hidden="true">';
			var iconSuffix = '</span>';
			if (tagArray[i] == "excursion") {
				tagsString += iconPrefix + '<i class="fa fa-bus" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "food") {
				tagsString += iconPrefix + '<i class="fa fa-cutlery" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "meet_and_greet") {
				tagsString += iconPrefix + '<i class="fa fa-handshake-o" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "panel") {
				tagsString += iconPrefix + '<i class="fa fa-comments-o" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "theme") {
				tagsString += iconPrefix + '<i class="fa fa-snowflake-o" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "music") {
				tagsString += iconPrefix + '<i class="fa fa-music" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "guest_of_honor" || tagArray[i] == "northern_light") {
				tagsString += iconPrefix + '<i class="fa fa-music" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "shopping") {
				tagsString += iconPrefix + '<i class="fa fa-shopping-bag" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			} else if (tagArray[i] == "charity") {
				tagsString += iconPrefix + '<i class="fa fa-paw" aria-hidden="true"></i>' + iconSuffix;
				classString += " sr-only";
			}
			
            tagsString += "<span class='label label-default text-capitalize tag_" + classString + "'>" + tag.replace(/_/g, " ") + "</span> ";
        }
        return tagsString;
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