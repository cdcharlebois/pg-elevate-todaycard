cordova.define("uk.co.workingedge.phonegap.plugin.launchnavigator.LaunchNavigator", function(require, exports, module) {
/*
 * Copyright (c) 2014 Dave Alden  (http://github.com/dpa99c)
 * Copyright (c) 2014 Working Edge Ltd. (http://www.workingedge.co.uk)
 *  
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *  
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *  
 */
    
var launchnavigator = {};

/**
 * Opens navigator app to navigate to given destination, specified by either place name or lat/lon.
 * If a start location is not also specified, current location will be used for the start.
 *
 * @param {Mixed} destination (required) - destination location to use for navigation.
 * Either:
 * - a {String} containing the place name. e.g. "London"
 * - an {Array}, where the first element is the latitude and the second element is a longitude, as decimal numbers. e.g. [50.1, -4.0]
 * @param {Mixed} start (optional) - start location to use for navigation. If not specified, the current location of the device will be used.
 * Either:
 * - a {String} containing the place name. e.g. "London"
 * - an {Array}, where the first element is the latitude and the second element is a longitude, as decimal numbers. e.g. [50.1, -4.0]
 * @param {Function} successCallback (optional) - A callback which will be called when plugin call is successful.
 * @param {Function} errorCallback (optional) - A callback which will be called when plugin encounters an error.
 * This callback function have a string param with the error.     
 * @param {Object} options (optional) - platform-specific options:
 * {Boolean} preferGoogleMaps - if true, plugin will attempt to launch Google Maps instead of Apple Maps. If Google Maps is not available, it will fall back to Apple Maps.
 * {Boolean} disableAutoGeolocation - if TRUE, the plugin will NOT attempt to use the geolocation plugin to determine the current device position when the start location parameter is omitted. Defaults to FALSE.
 * {String} transportMode - transportation mode for navigation.
 * For Apple Maps, valid options are "driving" or "walking".
 * For Google Maps, valid options are "driving", "walking", "bicycling" or "transit".
 * Defaults to "driving" if not specified.
 * {String} urlScheme - if using Google Maps and the app has a URL scheme, passing this to Google Maps will display a button which returns to the app
 * {String} backButtonText - if using Google Maps with a URL scheme, this specifies the text of the button in Google Maps which returns to the app. Defaults to "Back" if not specified.
 * {Boolean} enableDebug - if true, debug log output will be generated by the plugin. Defaults to false.
 */
launchnavigator.navigate = function(destination, start, successCallback, errorCallback, options) {
    options = options ? options : {};
    options.preferGoogleMaps = options.preferGoogleMaps ? options.preferGoogleMaps : false;
    options.enableDebug = options.enableDebug ? options.enableDebug : false;

    var exec = require('cordova/exec');

    if(typeof(destination) == "object"){
        destination = destination[0]+","+destination[1];
        options.destType = "coords";
    }else{
        options.destType = "name";
    }

    function doNavigate(start){
        if(start === null){
            options.startType = "none";
        }else if(typeof(start) == "object"){
            start = start[0]+","+start[1];
            options.startType = "coords";
        }else{
            options.startType = "name";
        }

        if(options.preferGoogleMaps){
            options.backButtonText = options.backButtonText ? options.backButtonText : "Back";
        }
        exec(successCallback, errorCallback, 'LaunchNavigator', 'navigate', [
            destination,
            start,
            options.enableDebug,
            options.preferGoogleMaps,
            options.transportMode,
            options.startType,
            options.destType,
            options.urlScheme,
            options.backButtonText
        ]);
    }

    if(start){
        doNavigate(start);
    }else if(!options.disableAutoGeolocation && navigator.geolocation){ // if cordova-plugin-geolocation is available/enabled
        navigator.geolocation.getCurrentPosition(function(position){ // attempt to use current location as start position
            doNavigate([position.coords.latitude, position.coords.longitude]);
        },function(error){
            options.startType = "none";
            doNavigate(null); // Fallback to native current location on error
        },{
            maxAge: 60000,
            timeout: 500
        });
    }else{
        options.startType = "none";
        doNavigate(null); // Fallback to native current location if geolocation plugin not found/disabled
    }
};

/**
 * Checks if the Google Maps app is installed and available on an iOS device.
 *
 * @return {boolean} true if Google Maps is installed on the current device
 */
launchnavigator.isGoogleMapsAvailable = function(successCallback) {
    var exec = require('cordova/exec');
    exec(successCallback, null, 'LaunchNavigator', 'googleMapsAvailable', []);
};

module.exports = launchnavigator;
});
