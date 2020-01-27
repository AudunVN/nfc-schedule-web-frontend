function renderCardToHtml(title, content, footer, icon) {
    return '' +
        '<div class="col-lg-6">' +
        '<div class="card text-center text-white bg-dark mb-3 border-0">' +
        '<div class="card-body">' +
        '<h5 class="card-title text-white">' + title + ' <i class="ml-1 ' + icon + ' text-white" aria-hidden="true"></i></h5>' +
        '<p></p>' +
        '<p class="text-white card-text">' + content + '</p>' +
        '</div>' +
        '<div class="card-footer pb-0 bg-transparent border-top-0">' +
        footer +
        '</div>' +
        '</div>' +
        '</div>';
}

function renderMenuTemplate(template) {
    $("#main-menu-modal .modal-body").html(template);
}

function renderSiteLinks(menudata) {
    var currentRow = "";

    var data = menudata.MenuGroups.sort(function (a, b) {
        return parseFloat(a.SortOrder) - parseFloat(b.SortOrder);
    });

    for (var i = 0; i < data.length; i++) {
        if (data[i].MenuItems.length == 0) {
            data.splice(i, 1);
        }
    }

    $.each(data, function (index, category) {
        var categoryNameRegex = /([^{}]+){([^{}]+)}/g;
        var matches = categoryNameRegex.exec(category.GroupName);
        var categoryName = category.GroupName;
        var categoryIcon = "d-none";

        try {
            var categoryName = matches[1];
            var categoryIcon = matches[2];
        }
        catch(error) {
            /* all good, handled in the default case */
            console.log(error);
        }

        if (category.MustBeLoggedInToSee && !menudata.isLoggedIn) {
            return;
        }

        if (category.MustNotBeLoggedInToSee && menudata.isLoggedIn) {
            return;
        }

        if (index % 2 == 0) {
            currentRow = $("<div/>", {
                "class": "equal-height-cards row mb-0 site-link-card",
                html: ""
            }).appendTo("#main-menu-modal .modal-body .links-container");
        }

        linkListHtml = "";

        var sortedMenuItems = category.MenuItems.sort(function (a, b) {
            return parseFloat(a.SortOrder) - parseFloat(b.SortOrder);
        });

        $.each(sortedMenuItems, function (linkIndex, object) {
            if (object.MustBeLoggedInToSee && !menudata.isLoggedIn) {
                return;
            }

            if (object.MustNotBeLoggedInToSee && menudata.isLoggedIn) {
                return;
            }

            linkListHtml += $("<a/>", {
                "class": "site-link btn btn-link btn-sm mb-2 mr-2",
                "id": "link-" + linkIndex,
                "href": (object.ForwardUrl ? object.ForwardUrl : object.UrlPath),
                html: object.MenuName
            }).clone().wrap('<p>').parent().html() + "<span class='sep'> - </span>";
        });

        var linkListId = "card-" + index + "-linklist";

        var linkList = $("<div/>", {
            "class": "site-links collapse d-lg-block",
            "id": linkListId,
            "data-parent": "#main-menu-modal",
            html: linkListHtml
        }).clone().wrap('<p>').parent().html();

        var collapseButton = '<button class="btn btn-outline-info mb-3 d-lg-none" type="button" data-toggle="collapse" data-target="#' + linkListId + '" aria-expanded="false" aria-controls="' + linkListId + '"><h5 class="card-title text-white pull-left mb-0">' + categoryName + ' <i class="ml-1 ' + categoryIcon + ' text-white" aria-hidden="true"></i></h5><span class="toggle-menu pull-right"><i class="fa fa-chevron-down" aria-hidden="true"></i><span class="sr-only"> Toggle</span></span></button>';

        $(renderCardToHtml(categoryName, category.description, collapseButton + linkList, categoryIcon)).appendTo(currentRow);
    });
}

function renderWebsiteMessage(websiteSettings) {
    if (websiteSettings.websiteMessage) {
        $("#main-menu-modal .modal-body .message-container").html('' +
            '<div class="alert alert-primary" role="alert">' +
            websiteSettings.websiteMessage +
            '</div>'
        );
    }
}

function renderUserSection(userPanelHtml) {
    $("#main-menu-modal .modal-body .user-container").html(userPanelHtml);
}

function renderAdminSection(menuData) {
    $("#main-menu-modal .modal-body .admin-container").html(menuData.adminPanel);
    if (document.querySelector("[data-section-id]")
        && document.querySelector("#main-menu-modal .admin-container .site-links")
        && menuData.roles.indexOf("Admin:Sys") != -1) {
        $('' +
            '<a class="site-link btn btn-link btn-md mb-2 mr-2" target="_BLANK" href="' + menuData.adminUrl + '/Website/UpdateSection/' +
            $("[data-section-id]").attr("data-section-id") +
            '">Edit page settings</a><a class="site-link btn btn-link btn-md mb-2 mr-2" target="_BLANK" href="' + menuData.adminUrl + '/Website/SectionBoxes/' +
            $("[data-section-id]").attr("data-section-id") + '">Edit page sections</a>'
        ).appendTo("#main-menu-modal .admin-container .site-links");
    }
}

function renderMenu() {
    $.ajax({
        xhrFields: {
            withCredentials: true
        },
        type: "GET",
        url: menuDataURL + "?t=" + Date.now()
    }).done(function (rawData) {
        var menuData = JSON.parse(rawData.Data);
        renderMenuTemplate(menuData.template);
        renderUserSection(menuData.userPanel);
        renderWebsiteMessage(menuData.websiteSettings);
        renderAdminSection(menuData);
        renderSiteLinks(menuData.links);
    }).fail(function (jqXHR, textStatus, error) {
        console.log("Menu loading error:")
        console.log(jqXHR);
        console.log(textStatus);
        console.log(error);
        $("#main-menu-modal .modal-body #menu-errors").remove();
        $("#main-menu-modal .modal-body").append("<div class='text-center' id='modal-errors'><p>Sorry, something went wrong here - attempting to load the menu again in a few seconds.</p><p>Error message: " + textStatus + " - " + error + "</p></div>");
        setTimeout(function () { renderMenu(); }, 10000);
    });
}

$(function () {
    renderMenu();
    glc();
});

//showing a dialog
function showDialog(title, content, isModal, closeCallback) {
    if ($('.modal').is(':visible')) {
        $(".modal").one("hidden.bs.modal", function () {
            doShowDialog(title, content, isModal, closeCallback);
        });
        $('.modal').modal('hide');
    } else {
        doShowDialog(title, content, isModal, closeCallback);
    }
}

function doShowDialog(title, content, isModal, closeCallback) {
    if (title && content) {
        $("#showdialog-modal").remove();
        $('.modal').modal('hide');
        var modal_html = '<div class="modal fade" id="showdialog-modal" tabindex="-1" role="dialog" aria-labelledby="showdialog-modal-label">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<h4 class="modal-title" id="showdialog-modal-label">' + title + '</h4>' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '</div>' +
            '<div class="modal-body">' +
            content +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-primary" id="confirm-btn" data-dismiss="modal">Close</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $("body").append(modal_html);
        $('#showdialog-modal').modal();
        if (typeof closeCallback !== "undefined" && typeof closeCallback === "function") {
            $("#showdialog-modal").on("hidden.bs.modal", function () { closeCallback(); });
        }
    }
}

/**
 *  shows a confirm dialog with yes and cancel buttons, and executes a function with provided params
 *  
 *  @param title - the title of the popup
 *  @param content the content of the popup (typically, the message it wil display)
 *  @param isModal - self explanatory
 *  @param dcallback (optional) - the function we're going to execute after clicking a button
 *  @param dcallback_args - a json object with the keys being the name the button, and as the value, a json object with the argument names as the keys 
 *                               This means the dialog_callback function must expect a json object for use as arguments. This is not mandatory.
 */
function showConfirmYesNo(title, content, isModal, dcallback, dcallback_args) {
    if ($('.modal').is(':visible')) {
        $(".modal").one("hidden.bs.modal", function () {
            doShowConfirmYesNo(title, content, isModal, dcallback, dcallback_args);
        });
        $('.modal').modal('hide');
    } else {
        doShowConfirmYesNo(title, content, isModal, dcallback, dcallback_args);
    }
}

function doShowConfirmYesNo(title, content, isModal, dcallback, dcallback_args) {
    if (title && content) {
        $("#yesno-modal").remove();
        $('.modal').modal('hide');
        var modal_html = '<div class="modal fade" id="yesno-modal" tabindex="-1" role="dialog" aria-labelledby="yesno-modal-label">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<h5 class="modal-title" id="yesno-modal-label">' + title + '</h5>' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="fa fa-close"></i></span></button>' +
            '</div>' +
            '<div class="modal-body">' +
            content +
            '</div>' +
            '<div class="modal-footer ignoreViewport">' +
            '<button type="button" class="btn btn-primary" id="confirm-btn">Yes</button>' +
            '<button type="button" class="btn btn-warning" id="cancel-btn">Cancel</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $("body").append(modal_html);
        $("#yesno-modal #confirm-btn").click(function () {
            $('#yesno-modal').modal('hide');
            if (typeof dcallback == 'function') {
                if (dcallback_args && dcallback_args.Yes) {
                    dcallback(dcallback_args.Yes);
                } else {
                    dcallback();
                }
            }
        });
        $("#yesno-modal #cancel-btn").click(function () {
            $('#yesno-modal').modal('hide');
            if (typeof dcallback == 'function') {
                if (dcallback_args && dcallback_args.Cancel) {
                    dcallback(dcallback_args.Cancel);
                } else {
                    dcallback();
                }
            }
        });
        $('#yesno-modal').modal();
    }
}

function displayErrorMsg(msg, code) {
    error = 'Error message missing!';
    if (msg) {
        error = msg;
        if (code) {
            error = msg + ' Error code: ' + code;
        }
        else {
            error = msg + ' - Error code missing';
        }
    }
    if ($('#status').length > 0) {
        $('#status').html(error);
        $('#status').show();
    }
    else {
        console.error(error);
    }
}

function getUrlParameter(url, parameter) {
    parameter = parameter.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?|&]' + parameter.toLowerCase() + '=([^&#]*)');
    var results = regex.exec('?' + url.toLowerCase().split('?')[1]);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function setUrlParameter(uri, key, value) {
    // remove the hash part before operating on the uri
    var i = uri.indexOf('#');
    var hash = i === -1 ? '' : uri.substr(i);
    uri = i === -1 ? uri : uri.substr(0, i);

    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";

    if (!value) {
        // remove key-value pair if value is empty
        uri = uri.replace(new RegExp("([?&]?)" + key + "=[^&]*", "i"), '');
        if (uri.slice(-1) === '?') {
            uri = uri.slice(0, -1);
        }
        // replace first occurrence of & by ? if no ? is present
        if (uri.indexOf('?') === -1) uri = uri.replace(/&/, '?');
    } else if (uri.match(re)) {
        uri = uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        uri = uri + separator + key + "=" + value;
    }
    return uri + hash;
}

/**
* console.image
* Dubiously created by Adrian Cooney
* http://adriancooney.github.io
*/
(function (console) {
    "use strict";

	/**
	 * Since the console.log doesn't respond to the `display` style,
	 * setting a width and height has no effect. In fact, the only styles
	 * I've found it responds to is font-size, background-image and color.
	 * To combat the image repeating, we have to get a create a font bounding
	 * box so to speak with the unicode box characters. EDIT: See Readme.md
	 *
	 * @param  {int} width  The height of the box
	 * @param  {int} height The width of the box
	 * @return {object}     {string, css}
	 */
    function getBox(width, height) {
        return {
            string: "+",
            style: "font-size: 1px; padding: 0 " + Math.floor(width / 2) + "px; line-height: " + height + "px;"
        }
    }

	/**
	 * Display an image in the console.
	 * @param  {string} url The url of the image.
	 * @param  {int} scale Scale factor on the image
	 * @return {null}
	 */
    console.image = function (url, scale) {
        scale = scale || 1;
        var img = new Image();

        img.onload = function () {
            var dim = getBox(this.width * scale, this.height * scale);
            console.log("%c" + dim.string, dim.style + "background: url(" + url + "); background-size: " + (this.width * scale) + "px " + (this.height * scale) + "px; color: transparent;");
        };

        img.src = url;
    };
})(console);












































































































/* Why yes, I did add a few hundred bytes to get this on line 471. */

function glc() {
    console.log('%c *GLACEON NOISES*', 'font-family: sans-serif; font-style: italic; font-size: 25px; color: #30F3F4; text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; padding-right: 0.5em; padding-left: 0.1em;');
    console.image("https://portal.nordicfuzzcon.org/Shared/471_195px.jpg");
    setTimeout(function () {
        console.log("...");
    }, 2471);
    setTimeout(function () {
        console.log("hi there - hope you're having a nice day!");
    }, 4471);
    setTimeout(function () {
        console.log("hope to see you again when registration is open;");
    }, 6471);
    setTimeout(function () {
        console.log("as you can see, it's still being worked on.");
    }, 8471);
    setTimeout(function () {
        console.log("~space");
        console.image("https://portal.nordicfuzzcon.org/Shared/glace_sleep.gif");
    }, 10471);
}