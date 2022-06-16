(function spotifySearchLiveApi() {
    var search;
    var nextUrl;
    var userInput;
    var firstLoad = true;
    var loadingRing = false;
    var responseItemsCount = 0;
    var artistOrAlbumOrPlaylist;
    var url = window.location.href;
    var newUrl = window.location.href + "?scroll=infinite";

    // set new url for infinite scroll check to work
    if (url.substr(url.length - 4) === "html") {
        history.pushState({}, null, newUrl);
    }

    // handling loading ring animation
    if (loadingRing) {
        $(".container-loading-ring").removeClass("displayNone");
    } else {
        $(".container-loading-ring").addClass("displayNone");
    }

    //  make a request to the Spotify search API
    function ajaxRequest() {
        search = true;
        firstLoad = true;
        userInput = $("input").val();
        artistOrAlbumOrPlaylist = $("select").val();

        $.ajax({
            method: "GET",
            url: "https://spicedify.herokuapp.com/spotify",
            data: {
                query: userInput,
                type: artistOrAlbumOrPlaylist,
            },
            beforeSend: function () {
                if (userInput === "") {
                    loadingRing = false;
                    responseItemsCount = 0;
                    $(".container-loading-ring").addClass("displayNone");
                }
            },
            complete: function () {
                if (
                    $("#results-container").hasClass("displayNone") &&
                    userInput !== ""
                ) {
                    $("#results-container").removeClass("displayNone");
                }
            },
            success: function (response) {
                response =
                    response.artists || response.albums || response.playlists;
                if (typeof response == "object") {
                    // sending API results to html
                    $("#results-container").html(
                        getResultsHtml(response.items)
                    );

                    // if next not null there are more results (limit for each request = 20)
                    setNextUrl(response.next);

                    // "?scroll=infinite" check
                    if (location.search.indexOf("scroll=infinite") > -1) {
                        checkScrollPosition();
                    }
                }
            },
            error: function (error) {
                search = false;
                $("#results-container").addClass("displayNone");
                console.log("error: ", error);
            },
        });
    }

    // trigger for live API request
    $(".target").change(function () {
        ajaxRequest();
    });
    $("input").on("keyup", function () {
        ajaxRequest();
    });

    // handling API results before adding to html
    function getResultsHtml(items) {
        var resultsHtml = "";
        var resultsArtists =
            '<div id="firstHtml">' +
            "All artists for " +
            "“" +
            userInput +
            "”" +
            "</div>";
        var resultsAlbums =
            '<div id="firstHtml">' +
            "All albums for " +
            "“" +
            userInput +
            "”" +
            "</div>";
        var resultsPlaylist =
            '<div id="firstHtml">' +
            "All playlists for " +
            "“" +
            userInput +
            "”" +
            "</div>";
        var noResults =
            '<div id="firstHtml">' +
            "No results found for " +
            '"' +
            userInput +
            '"' +
            "</div>";

        if (search) {
            if (firstLoad) {
                if (items.length > 0) {
                    responseItemsCount += Number(items.length);
                    if (items[0].type == "artist") {
                        resultsHtml += resultsArtists;
                    } else if (items[0].type == "album") {
                        resultsHtml += resultsAlbums;
                    } else if (items[0].type == "playlist") {
                        resultsHtml += resultsPlaylist;
                    }
                } else {
                    firstLoad = true;
                    loadingRing = false;
                    resultsHtml += noResults;

                    if (!$("#results-container").hasClass("displayNone")) {
                    }

                    $(".container-loading-ring").addClass("displayNone");
                }
            } else if (responseItemsCount <= 20) {
                if (items.length > 0) {
                    if (items[0].type == "artist") {
                        resultsHtml += resultsArtists;
                    } else if (items[0].type == "album") {
                        resultsHtml += resultsAlbums;
                    } else if (items[0].type == "playlist") {
                        resultsHtml += resultsPlaylist;
                    }
                } else {
                    firstLoad = true;
                    loadingRing = false;
                    resultsHtml += noResults;
                    $(".container-loading-ring").addClass("displayNone");
                }
            }

            // handling results without image
            for (var i = 0; i < items.length; i++) {
                var imageUrl;
                var links;

                if (items[i].images[0]) {
                    imageUrl = items[i].images[0].url;
                } else {
                    imageUrl = "images/album-cover-not-found.png";
                }
                // redirecting to listen to music directly on Spotify
                links = items[i].external_urls.spotify;

                resultsHtml +=
                    "<div class='cardContainer'>" +
                    "<div class='card'>" +
                    "<a id='imgslinks' href=" +
                    links +
                    ">" +
                    "<img id='albumImgs' src=" +
                    imageUrl +
                    ">" +
                    "</a>" +
                    "&nbsp; &nbsp;" +
                    "<a id='nameslinks' href=" +
                    links +
                    ">" +
                    items[i].name +
                    "</a>" +
                    "</div>" +
                    "</div>";
            }
        } else {
            if (!$("#results-container").hasClass("displayNone")) {
                loadingRing = false;
                $(".container-loading-ring").addClass("displayNone");
            }
            resultsHtml +=
                '<div id="results-container" class="displayNone">' + "</div>";
        }

        return resultsHtml;
    }

    // change url before making a new request to the Spotify search API
    function setNextUrl(next) {
        nextUrl =
            next &&
            next.replace(
                "https://api.spotify.com/v1/search",
                "https://spicedify.herokuapp.com/spotify"
            );
        // Spotify used to have a search API that didn't require
        // authentication and supported CORS. It now requires authentication
        // and therefore pretty much can't be used via ajax directly -
        // otherwise we would get a 401 / unauthorized.
        // By using https://spicedify.herokuapp.com/spotify instead, we can
        // pass to it all of the query string parameters that we would have passed
        // to the Spotify's endpoint.
    }

    //  make a new request to the Spotify search API if scrolling to bottom page
    function checkScrollPosition() {
        // if "?scroll=infinite" checker not active, we can use the more button
        setTimeout(function () {
            if (
                $(window).height() + $(document).scrollTop() >=
                    $(document).height() - 400 &&
                !loadingRing
            ) {
                $.ajax({
                    method: "GET",
                    url: nextUrl,
                    data: {
                        query: userInput,
                        type: artistOrAlbumOrPlaylist,
                    },
                    beforeSend: function () {
                        firstLoad = false;
                        if (
                            userInput === "" &&
                            !$("#results-container").hasClass("displayNone")
                        ) {
                            loadingRing = false;
                            $(".container-loading-ring").addClass(
                                "displayNone"
                            );
                        } else if (userInput !== "") {
                            loadingRing = true;
                            $(".container-loading-ring").removeClass(
                                "displayNone"
                            );
                        }
                    },
                    complete: function () {
                        loadingRing = false;
                        $(".container-loading-ring").addClass("displayNone");
                    },
                    success: function (response) {
                        if (
                            response != "undefined" &&
                            typeof response == "object" &&
                            response.hasOwnProperty(
                                "albums" || "artists" || "playlists"
                            )
                        ) {
                            response =
                                response.artists ||
                                response.albums ||
                                response.playlists;

                            $("#results-container").append(
                                getResultsHtml(response.items)
                            );
                            setNextUrl(response.next);

                            // "?scroll=infinite" check
                            if (
                                location.search.indexOf("scroll=infinite") > -1
                            ) {
                                checkScrollPosition();
                            }
                        } else {
                            loadingRing = false;
                            $(".container-loading-ring").addClass(
                                "displayNone"
                            );
                        }
                        $("body").css("overflow", "auto");
                    },
                    error: function (error) {
                        console.log("error: ", error);
                    },
                });
            } else {
                loadingRing = false;
                checkScrollPosition();
            }
        }, 500);
    }
})();
