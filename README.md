<div align="center">
  <img alt="logo" src="git/spotify-live.png">
</div>

# Spotify Search Live API

Live Spotify Search made during my Full-Stack Web Developer Bootcamp at [Spiced Academy](https://www.spiced-academy.com/en/program/full-stack-web-development/berlin) in Berlin. <br /><br />
Users can search their favorite artists, albums and playlists with a live response from the Spotify's API and listen to them directly on Spotify.

## Technologies

This project was created with the use of [jQuery](https://jquery.com).

## Main features

-   Live search by making asynchronous HTTP [AJAX](https://api.jquery.com/jquery.ajax/) calls to Spotify's API via a proxy
-   Loading ring animation while waiting for API response
-   By adding "_?scroll=infinite_" in the query string, when users scroll down to the bottom of the listed results, the next page of results will be automatically loaded and appended by making a new AJAX request
-   Clicking any search result will redirect the user to the related artist/album/playlist's Spotify page, thus allowing to directly listen to the desired music

## Preview

![](git/spotify-live.gif)
