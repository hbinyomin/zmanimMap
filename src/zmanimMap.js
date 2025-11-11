/*global google*/
// import $ from 'jquery';
// import './css/style.css';
// import './css/sidebarAccordian.css';
import getSunCalcTimes from './suncalc.js';
import updateDirectionToYerushalayim from './yerushalayim.js';
import { openWeatherKey, geoNamesKey, locationSelector, dateInput, currentLocZmanimDisp, modalDiv, currentLocInfoWrapper, currentLocInfoDisp } from './constants.js';
import { currentLocNameDisp, currentLocLatLngDisp, currentLocAltitudeDisp, currentLocWeatherDisp, sidebarRcntMrkrLocNameDisp, sidebarRcntMrkrLatLngDisp, sidebarRcntMrkrWeatherDisp, sidebarRcntMrkrAltitudeDisp, sidebarRcntMrkrZmanimDisp } from './constants.js';
import { currentLocationCanvas1, currentLocationCanvas2, markerCanvas1, markerCanvas2, infoWindowCanvas1, infoWindowCanvas2, sidebarRcntMrkrYerushDirectionDisp } from './constants.js';
import { infoWindowLocationName, infoWindowLatLng, infoWindowAltitude, infoWindowWeather, infoWindowZmanim, infoWindowYerushDirection, infoWindowWrapper } from './constants.js';
import { america, placesArray, currentLocationZoom, zmanSelectForm } from './constants.js';
import { initializeAccordians, initializeInstructions } from './instructions.js'

let map;
let currentLocation;
let locationToLoad = america; // this will  load  if currentLocation is not available

let dateObjectToCheck;
let currentLocationGmtOffset, recentMarkerGmtOffset;
let currentLat, currentLng, recentMarkerLat, recentMarkerLng;
let currentLocSunCalcZmanim, rcntMrkrSunCalcZmanim;

let zmanimToDisplayIndicies = [];
const blankZman = getZmanimPackage({ sunrise: 0, sunset: 0, lat: 0, lng: 0, dateObject: new Date() });
const theInfoWindow = new google.maps.InfoWindow();


////////////////////   Initialize     ///////////////////////
initializeApp();

////////// Current Location,  Invoke Load Map()  ////////////
const currentLocationPromise = new Promise((resolve) => {
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
         (geolocationPositionInstance) => { resolve(geolocationPositionInstance); }, () => resolve());
   }
   else {
      resolve();
   }
});

currentLocationPromise.then(
   (positionInstance) => {
      if (positionInstance) {

         currentLat = positionInstance.coords.latitude;
         currentLng = positionInstance.coords.longitude;
         currentLocation = { name: "Your Current Location", position: { lat: currentLat, lng: currentLng }, zoom: currentLocationZoom };
         locationToLoad = currentLocation;
         addCurrentLocToMapFocusSelect();
         loadMap();
         addMarkerCurrentLocation();

         updateCurrentLocationDisplay();
      }
      else {
         loadMap();
         currentLocInfoWrapper.empty();
         currentLocInfoDisp.append('<div id="locUnavailMessage" class="collapsableTitle sidebar">Your current location is not  available - we cannot provide information specific to your location.</div>');
      }
   });  // end of .then()

////////////  Update Current Location Display  /////////////
async function updateCurrentLocationDisplay() {
   if (currentLat && currentLng) {
      currentLocLatLngDisp.append(`<span class="subtitle infoWindowOnly">Coordinates:</span>  Lat: ${currentLat.toFixed(4)}, Lng: ${currentLng.toFixed(4)}`);
      updateDirectionToYerushalayim(currentLocationCanvas1, currentLocationCanvas2, currentLat, currentLng);
      updateWeather(currentLat, currentLng, currentLocWeatherDisp, currentLocNameDisp);
      updateAltitude(currentLat, currentLng, currentLocAltitudeDisp);
      currentLocationGmtOffset = await getGmtOffset(currentLat, currentLng);
      currentLocSunCalcZmanim = await updateZmanim(currentLat, currentLng, currentLocationGmtOffset, currentLocZmanimDisp);
   }
   else {
      currentLocInfoDisp.empty().append('<div id="locUnavailMessage" class="collapsableTitle sidebar">Current latitude and longitue is not available  - we cannot provide any information specific to your location.</div>');
   }
}

////////////////////// Update Zmanim   ////////////////////
async function updateZmanim(lat, lng, gmtOffset, display, newDate) {

   if (!gmtOffset) {
      gmtOffset = await getGmtOffset(lat, lng);
   }

   let sunCalcZmanim;
   if (gmtOffset || gmtOffset === 0) {
      sunCalcZmanim = getSunCalcZmanim(lat, lng, gmtOffset, newDate ? newDate : dateObjectToCheck);
      if (sunCalcZmanim) {
         refreshSidebarZmanimDispAccdToDispChoices(display, sunCalcZmanim);
      }
      else {
         sunCalcZmanim = undefined; // for clarity that if gmt offset is not avial, then sunCalcZmanim will return undefined
         display.text(`Zmanim data not available.`);
      }
   }// end of if(gmtOffset || gmtoffset === 0)
   else {
      display.text(`Unable to calculate zmanim - the local gmt offset is not available.  To change this, allow this site to know your location.`);
   }
   return sunCalcZmanim;
}

////////////////////// Altitude   ////////////////////////
async function updateAltitude(lat, lng, display) {
   display.empty();
   $(display).after(' <div class="collapsableContent sidebar loading">Looking up altitude...</div>')
   const altitude = await getAltitude(lat, lng);
   display.next('.loading').remove(); //remove the 'loading' message that is a div after the display (but not on info window- so we filter with .loading class loading)

   if (altitude) {
      display.append(`<span class="subtitle infoWindowOnly">Altitude:</span> ${altitude} feet`);
   }
   else {
      display.append(`<span class="subtitle infoWindowOnly">Altitude:</span> Altitude not available`);
   }

   return altitude;
}

async function getAltitude(lat, lng) {
   try {
      const r = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
      if (!r.ok) {
         console.log('response from getAltitude not successful');
         return undefined;
      }
      const dataObject = await r.json();
      return metersToFeet(dataObject.results[0].elevation);
   }
   catch (e) {
      console.log('Big error in fetching altitude:', e);
   }
}

////////////////////// Weather   ////////////////////////
async function updateWeather(lat, lng, weatherContentDisplay, placeNameDiv) {
   weatherContentDisplay.empty()
   const weatherData = await getWeather(lat, lng);
   if (weatherData) {
      weatherContentDisplay.append(
         `<span class="subtitle infoWindowOnly">Current Weather Conditions:</span>
            <div>${Math.floor(weatherData.main.temp)}°F, and ${weatherData.weather[0].description},
            <br> with wind at ${weatherData.wind.speed} mph, and ${weatherData.main.humidity}% humidity</div>`
      );
      placeNameDiv.empty().append(`<span class="subtitle infoWindowOnly">Place Name:</span> ${weatherData.name ? weatherData.name : 'Place name not available'}`);
   }
   else {
      weatherContentDisplay.text('Weather data is not available.');
   }
   return weatherData;
}

async function getWeather(lat, lng) {
   try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lng}&appid=${openWeatherKey}`);
      if (!response.ok) {
         console.log('response from getWeather is not ok');
         return undefined;
      }
      const weatherData = await response.json();
      return weatherData;
   }
   catch (e) {
      console.log('Big error in fetching weather', e);
   }
}

/////////////////////// zmanim calculations  ////////////////////////////
function getSunCalcZmanim(lat, lng, newPlaceGmtOffset, dateObject) {

   const sunCalcData = getSunCalcTimes(dateObject, lat, lng);

   // getSunCalcTimes() returns sun event times in format of a Date object in terms of user's local time. (Therefore we need user's gmtOffset)
   // The function invoked a few lines below- getZmanInMinutes() extracts the relevant data from the Date object and returns a 
   // single number that is the sun event in terms of minutes after 12 am
   const data = {
      lat: lat,
      lng: lng,
      dateObject: dateObject,
      alos_16_1: getZmanInMinutes(sunCalcData.alos_16_1, newPlaceGmtOffset),
      misheyakir_10_2: getZmanInMinutes(sunCalcData.misheyakir_10_2, newPlaceGmtOffset),
      misheyakir_11: getZmanInMinutes(sunCalcData.misheyakir_11, newPlaceGmtOffset),
      sunrise: getZmanInMinutes(sunCalcData.sunrise, newPlaceGmtOffset),
      sunset: getZmanInMinutes(sunCalcData.sunset, newPlaceGmtOffset),
      tzais_8_5: getZmanInMinutes(sunCalcData.tzais_8_5, newPlaceGmtOffset)
   };
   return getZmanimPackage(data);
}

function getZmanInMinutes(zmanAsDateObject, newPlaceGmtOffset) {

   if (currentLocationGmtOffset || currentLocationGmtOffset === 0) {//extra layer - this funct should only be called when this condition is true

      // undo the gmtAdjustment from currentLocation that sunCalc incorporates via Date() object, 
      //then apply the correct gmtOffset for newPlace
      const unadjustedZmanHour = zmanAsDateObject.getHours();
      let adjustedZmanHour = unadjustedZmanHour - currentLocationGmtOffset + newPlaceGmtOffset;
      if (adjustedZmanHour > 24) {
         adjustedZmanHour -= 24;
         console.log('sunCalc rise Hour was >24');
      }
      if (adjustedZmanHour < 0) {
         adjustedZmanHour += 24;
         console.log('sunCalc rise Hour was <0');
      }

      return adjustedZmanHour * 60 + zmanAsDateObject.getMinutes() + zmanAsDateObject.getSeconds() / 60;
   }
}

function getZmanimPackage(data) {

   // takes in a paramater called data, which is an object
   // with fields .dateObject, .lat, .lng, as well as fields of the sun events .sunrise and .sunset, and 8.5° 
   // etc that are the respective sun events given in minutes after 12 am 
   const sunrise_inMinutes = data.sunrise;
   const sunset_inMinutes = data.sunset;

   const dayLengthMinutesGra = sunset_inMinutes - sunrise_inMinutes;
   const zmaniosHourGra = dayLengthMinutesGra / 12;

   const alos_16_1 = data.alos_16_1;
   const alos72 = sunrise_inMinutes - 72;
   const misheyakir_11 = data.misheyakir_11;
   const misheyakir_10_2 = data.misheyakir_10_2;
   const misheyakir_36 = sunrise_inMinutes - 36;
   const shemaGra = zmaniosHourGra * 3 + sunrise_inMinutes;
   const tefillaGra = zmaniosHourGra * 4 + sunrise_inMinutes;
   const chatzos = zmaniosHourGra * 6 + sunrise_inMinutes;
   const minchaGedolaGra = (zmaniosHourGra / 2) > 30 ? zmaniosHourGra * 6.5 + sunrise_inMinutes : (zmaniosHourGra * 6) + 30 + sunrise_inMinutes;

   const minchaKetanaGra = zmaniosHourGra * 9.5 + sunrise_inMinutes;
   const samuchToMinchaKetanaGra = minchaKetanaGra - 30;

   const plagGra = zmaniosHourGra * (9.5 + 1.25) + sunrise_inMinutes;
   const samuchToKriasShemaArvis = sunset_inMinutes + 45 - 30;  // using  krias shema as 45 minutes see igros moshe e.h.
   const tzais_8_5 = data.tzais_8_5;
   const tzais50 = sunset_inMinutes + 50;
   const tzais72 = sunset_inMinutes + 72;

   const dayLengthMinutesMa = tzais72 - alos72;
   const zmaniosHourMa = dayLengthMinutesMa / 12;
   const shemaMa = zmaniosHourMa * 3 + alos72;
   const tefillaMa = zmaniosHourMa * 4 + alos72;
   const minchaGedolaMa = (zmaniosHourMa / 2) > 30 ? zmaniosHourMa * 6.5 + alos72 : (zmaniosHourMa * 6) + 30 + alos72;
   const minchaKetanaMa = zmaniosHourMa * 9.5 + alos72;
   const samuchToMinchaKetanaMa = minchaKetanaMa - 30;
   const plagMa = zmaniosHourMa * (9.5 + 1.25) + alos72;

   const zmanimPackage = {

      dateObject: data.dateObject,
      dateStrings: getDateStrings(data.dateObject),
      lat: data.lat,
      lng: data.lng,

      // the third paramater passed to getZmanObject is boolean if should be rounded earlier
      // true = earlier; false = later
      zmanim: [
         // getZmanObject() returns an object that has on it the integers of the clock-time hour,minute,and second of  the given zman,
         // as well as a string and compact string of the clock-time of the given zman 
         getZmanObject('Alos Hashachar 16.1°', alos_16_1, false),
         getZmanObject('Alos Hashachar 72 minutes fixed', alos72, false),
         getZmanObject('Misheyakir 11°', misheyakir_11, false),
         getZmanObject('Misheyakir 10.2°', misheyakir_10_2, false),
         getZmanObject('Misheyakir 36 minutes fixed', misheyakir_36, false),
         getZmanObject('Haneitz', sunrise_inMinutes, false),
         getZmanObject('Shema MA', shemaMa, true),
         getZmanObject('Shema Gra', shemaGra, true),
         getZmanObject('Tefilla MA', tefillaMa, true),
         getZmanObject('Tefilla Gra', tefillaGra, true),
         getZmanObject('Chatzos', chatzos, false),
         getZmanObject('Mincha Gedola Gra', minchaGedolaGra, false),
         getZmanObject('Mincha Gedola MA', minchaGedolaMa, false),
         getZmanObject('Samuch l\'Mincha Ketana Gra', samuchToMinchaKetanaGra, true),
         getZmanObject('Mincha Ketana Gra', minchaKetanaGra, true),
         getZmanObject('Samuch l\'Mincha Ketana MA', samuchToMinchaKetanaMa, true),
         getZmanObject('Mincha Ketana MA', minchaKetanaMa, true),
         getZmanObject('Plag HaMincha Gra', plagGra, false),
         getZmanObject('Plag HaMincha MA', plagMa, false),
         getZmanObject('Shkiah', sunset_inMinutes, true),
         getZmanObject('Samuch l\'Krias Shema Arvis', samuchToKriasShemaArvis, true),
         getZmanObject('Tzais 8.5°', tzais_8_5, false),
         getZmanObject('Tzais 50 minutes fixed', tzais50, false),
         getZmanObject('Tzais 72 minutes fixed', tzais72, false),
      ]
   };
   return zmanimPackage;
}

function getZmanObject(name, zmanMinutes, roundEarlier) {
   // getZmanObject() takes in "zmanMinutes"- the desired zman given in minutes after 12am, and
   // returns an object that has on it the integers of the clock-time hour,minute,and second of  the desired zman,
   // as well as a string of  the   clock-time of the desired zman 
   let hour = Math.floor(zmanMinutes / 60);
   const minutes = Math.floor((zmanMinutes % 60));
   const seconds = Math.floor(((zmanMinutes % 60) - minutes) * 60);
   let am = true;

   if (zmanMinutes > 12 * 60) {
      am = false;
      hour -= 12;
   }
   if (hour === 0) {
      hour = 12;
   }

   let roundingHour = hour;
   let roundingMinutes = minutes;
   if (!roundEarlier && seconds > 0) {
      roundingMinutes++;
      if (roundingMinutes === 60) {
         roundingHour++;
         roundingMinutes = 0;
      }
   }

   const fullString = `${hour}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${am ? ' A.M.' : ' P.M.'}`;
   const string = `${roundingHour}:${roundingMinutes.toString().padStart(2, '0')}${am ? ' A.M.' : ' P.M.'}`;
   const compactString = `${roundingHour}:${roundingMinutes.toString().padStart(2, '0')}`;

   const zmanObject = {
      name: name,
      compactString: compactString,
      fullString: fullString,
      string: string,
      hour: hour,
      minutes: minutes,
      seconds: seconds
   };
   return zmanObject;
}

function getDateStrings(dateObject) {
   const [dayOfWeekString, monthString, dayOfMonthString, yearString] = dateObject.toString().split(' ');

   return {
      dayOfWeek: dayOfWeekString,
      month: monthString,
      dayOfMonth: dayOfMonthString,
      year: yearString,
      printable: `${dayOfWeekString} ${monthString} ${dayOfMonthString}`,
      printableFull: `${dayOfWeekString} ${monthString} ${dayOfMonthString} ${yearString}`
   };
}

async function getGmtOffset(lat, lng) {
   try {
      const geonamesResponse = await fetch(`https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${geoNamesKey}`);
      if (!geonamesResponse.ok) {
         console.log('resopnse from getGmtOffset not ok');
         return undefined;
      }
      const geonamesData = await geonamesResponse.json();
      return geonamesData.gmtOffset;
   }
   catch (e) {
      console.log('Big error in getting gmt offset from geonames', e);
   }
}

/////////////////// Map and Map Listeners /////////////////////

function loadMap() {
   map = new google.maps.Map(document.getElementById('mapDiv'), {
      center: locationToLoad.position,
      zoom: locationToLoad.zoom,
      mapTypeId: locationToLoad === currentLocation ? google.maps.MapTypeId.SATELLITE : undefined
   });

   locationSelector.on("change", function () {
      map.setZoom(placesArray[this.value].zoom);
      map.setCenter(placesArray[this.value].position);
      if (placesArray[this.value].name === currentLocation.name) {
         map.setMapTypeId(google.maps.MapTypeId.SATELLITE)
      }
      else {
         if (map.getMapTypeId() !== 'roadmap') {
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP)
         }
      }
   });

   const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
         position: google.maps.ControlPosition.TOP_CENTER,
         drawingModes: [google.maps.drawing.OverlayType.MARKER],
      }
   });

   drawingManager.setMap(map);

   google.maps.event.addListener(drawingManager, "markercomplete", markerPlacedOnMapListener);
}

function addMarkerCurrentLocation() {
   if (currentLocation) {
      const currentLocMarker = new google.maps.Marker({
         position: { lat: currentLocation.position.lat, lng: currentLocation.position.lng },
         map: map,
         title: "Current Location"
      });
      currentLocMarker.setMap(map);
   }
}

async function markerPlacedOnMapListener(theMarker) {

   recentMarkerLat = theMarker.getPosition().lat();
   recentMarkerLng = theMarker.getPosition().lng();

   $('#markerInfoFiller').hide(); // needed for css reasons- see comment in css
   $('#markerInfoWrapper').show();

   // Lat/lng dispaly and yerushalyim direction  display
   updateSidebarYerushAndLatLng(recentMarkerLat.toFixed(4), recentMarkerLng.toFixed(4));

   //weather
   const weather = await updateWeather(recentMarkerLat, recentMarkerLng, sidebarRcntMrkrWeatherDisp, sidebarRcntMrkrLocNameDisp);

   //zmanim
   recentMarkerGmtOffset = await getGmtOffset(recentMarkerLat, recentMarkerLng);
   if ((recentMarkerGmtOffset || recentMarkerGmtOffset === 0) && (currentLocationGmtOffset || currentLocationGmtOffset === 0)) {
      rcntMrkrSunCalcZmanim = undefined; // undo previous setting of this variable in case current fetch fails
      const dateObjectClosure = dateObjectToCheck;  // to grab the date that was selected for the specific marker placed, create a closure, since dateObjToCheck is avail outside this function
      rcntMrkrSunCalcZmanim = await updateZmanim(recentMarkerLat, recentMarkerLng, recentMarkerGmtOffset, sidebarRcntMrkrZmanimDisp, dateObjectClosure);
   }
   else {
      sidebarRcntMrkrZmanimDisp.text("Unable to calculate zmanim - the local gmt offset is not available.  To change this, allow this site to know your location.")
      console.log("zmanim were not calculated since gmt offset not available.");
   }

   //info window code
   const latClosure = recentMarkerLat, lngClosure = recentMarkerLng, zmanimClosure = rcntMrkrSunCalcZmanim;
   let altitude, fluidDate = false;
   if (document.getElementById('fluid').checked) {  //user can choose if marker placed will fluctuate when dateSelect is changed
      fluidDate = true;
   }
   setTimeout(() => theMarker.addListener('click', () => {
      buildAndDisplayInfoWindow(theMarker, latClosure, lngClosure, altitude, weather,
         fluidDate ? rcntMrkrSunCalcZmanim : zmanimClosure); //use closure or global depending if user sets marker to be fluid date or statinary date
   }), 1050) // don't wait too long for the response from altitude api before setting the click listner - altitude api sometimes acts up 

   //altitude
   altitude = await updateAltitude(recentMarkerLat, recentMarkerLng, sidebarRcntMrkrAltitudeDisp);
}

function updateSidebarYerushAndLatLng(lat, lng) {
   if (lat && lng) {
      sidebarRcntMrkrLatLngDisp.empty().append(`<span class="subtitle infoWindowOnly">Coordinates:</span> Lat: ${lat}, Lng: ${lng}`);

      // $('#markerYerushDirection > :not(canvas)').remove();
      sidebarRcntMrkrYerushDirectionDisp.children().not('canvas').remove();
      updateDirectionToYerushalayim(markerCanvas1, markerCanvas2, lat, lng);
   }
   else {
      sidebarRcntMrkrZmanimDisp.empty().append(`<span class="subtitle infoWindowOnly">Coordinates:</span> Lat and Lng not available.`);
      sidebarRcntMrkrYerushDirectionDisp.append(`<span>Unable to calculate - latitue and longitude are not avialable</span>`);
   }
}

function buildAndDisplayInfoWindow(theMarker, lat, lng, altitude, weather, theMarkerSunCalcZmanim) {

   //zmanim
   infoWindowZmanim.empty();
   if (zmanimToDisplayIndicies.length === 0) {
      infoWindowZmanim.append(`<span class="subtitle">Zmanim:</span> To view zmanim, click the "Select Zmanim to Display" button and reopen this infoWindow.`)
   }
   if (zmanimToDisplayIndicies.length > 0 && theMarkerSunCalcZmanim && theMarkerSunCalcZmanim.dateStrings.printable) {
      infoWindowZmanim.append(`<span class="subtitle">Zmanim for ${theMarkerSunCalcZmanim.dateStrings.printable}:</span>`);
      zmanimToDisplayIndicies.forEach((zmanIndex) => {
         infoWindowZmanim.append(` <div class="noSpace" id="IW${zmanIndex}">${theMarkerSunCalcZmanim.zmanim[zmanIndex].name}: ${theMarkerSunCalcZmanim.zmanim[zmanIndex].string} `);
      })
   }
   if (zmanimToDisplayIndicies.length > 0 && !theMarkerSunCalcZmanim) {
      infoWindowZmanim.append(`<span class="subtitle">Zmanim:</span> Unable to calculate zmanim - the local gmt offset is not avialable.    To change this, allow this site to know your location.`)
   }

   // yerushalayim direction
   const savedCanvas1 = infoWindowCanvas1;
   const savedCanvas2 = infoWindowCanvas2;
   const latClosure = lat, lngClosure = lng;
   infoWindowYerushDirection.empty().append(savedCanvas1, savedCanvas2);
   updateDirectionToYerushalayim(infoWindowCanvas1, infoWindowCanvas2, latClosure, lngClosure);
   
   
   //altitude
   infoWindowLatLng.empty().append(`<span class = "subtitle">Coordinates:</span> Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);

   infoWindowAltitude.empty().append(`<span class="subtitle">Altitude:</span> ${altitude ? altitude + ' feet' : 'Altitude not available'}`);

   //weather
   infoWindowWeather.empty();
   if (weather) {
      infoWindowWeather.append(
         `<span class="subtitle">Current Weather:</span>
            ${Math.floor(weather.main.temp)}°F, and ${weather.weather[0].description}, with wind at ${weather.wind.speed} mph, and humidity of ${weather.main.humidity}%.  `
      );
      infoWindowLocationName.empty().append(`<span class="subtitle">Place Name:</span> ${weather.name}`);
   }
   else {
      infoWindowWeather.append(`<span class="subtitle">Current Weather:</span> Weather for this location not available `);
   }


   // finish build and display
   infoWindowWrapper.append(infoWindowZmanim, infoWindowYerushDirection, infoWindowLatLng, infoWindowAltitude, infoWindowWeather);
   theInfoWindow.setContent(infoWindowWrapper[0]);
   infoWindowWrapper.show();
   theInfoWindow.open(map, theMarker);
}

function metersToFeet(meters) {
   return Math.round(meters * 3.280839895);
}

function initializeMapFocusSelect() {
   placesArray.forEach((e, index) => {
      locationSelector.append($(`<option value=${index}>${e.name}</option>`));
   });

   locationSelector.val(placesArray.findIndex((place) => { return place.name === locationToLoad.name; }));//end .findIndex() and .val()
}

function addCurrentLocToMapFocusSelect() {
   // this fucntion is only called if the position instance is defined, so this if() is extra layer
   if (currentLocation) {
      placesArray.push(currentLocation);
      locationSelector.append($(`<option value=${placesArray.length - 1}>${placesArray[placesArray.length - 1].name}</option>`));
      locationSelector.val(placesArray.findIndex((place) => { return place.name === locationToLoad.name; }));//end .findIndex() and .val()
   }
}

//////////////// handle zman selection form ////////////////////
function initializeZmanSelectForm() {

   let acceptedDisclaimer = false;  // can declare inside this function; this funct only called once
   const disclaimer = $('#disclaimer');

   $('#zmanSelectButton').on('click', () => {
      if (!acceptedDisclaimer) {
         modalDiv.show();
         disclaimer.show('fast');
      } else {
         zmanSelectForm.show('fast');
         modalDiv.show();
      }
   });

   $('#acceptDisclaimer').on("click", () => {
      acceptedDisclaimer = true;
      disclaimer.hide();
      zmanSelectForm.show('fast');
   });

   blankZman.zmanim.forEach((zman, index) => {
      $('#zmanSelectDisplay').append(
         `<input type="checkbox" id="${index}"><label for= ${index}> ${zman.name}</label><br>`
      );
   });

   $('#selectAll').on("click", () => {
      blankZman.zmanim.forEach((x, index) => {
         $(`#${index}`).prop("checked", true);
      });
   });

   $('#clearAll').on("click", () => {
      blankZman.zmanim.forEach((x, index) => {
         $(`#${index}`).prop("checked", false);
      });
   });

   $('#cancel').on("click", () => {
      zmanSelectForm.hide();
      modalDiv.hide();
   });

   initializeZmanSelectFormOnSubmit();
}

function initializeZmanSelectFormOnSubmit() {
   zmanSelectForm.on("submit", (e) => {
      e.preventDefault();
      updateZmanimToDisplayIndicies();
      if (currentLocSunCalcZmanim) {
         refreshSidebarZmanimDispAccdToDispChoices(currentLocZmanimDisp, currentLocSunCalcZmanim);
      }
      if (rcntMrkrSunCalcZmanim) {
         refreshSidebarZmanimDispAccdToDispChoices(sidebarRcntMrkrZmanimDisp, rcntMrkrSunCalcZmanim);
      }
      zmanSelectForm.hide();
      modalDiv.hide();
      currentLocZmanimDisp.show();
      if (rcntMrkrSunCalcZmanim) {// this means that at least one marker has been placed, and there is info in the sidebar rcnt MRker section
         sidebarRcntMrkrZmanimDisp.show();
      }
      // infoWindowZmanim.show();  // this is  here if later is decided to make accordian  on infowindow

      const currentLocZmanimTitle = $('#currentLocZmanimTitle');
      const markerZmanimTitle = $('#markerZmanimTitle')
      if (zmanimToDisplayIndicies.length > 0) {
         currentLocZmanimTitle.addClass('opened');
         if (rcntMrkrSunCalcZmanim) {
            markerZmanimTitle.addClass('opened');
         }
      }
      else {
         currentLocZmanimTitle.removeClass('opened');
         currentLocZmanimDisp.hide();
         markerZmanimTitle.removeClass('opened');
         sidebarRcntMrkrZmanimDisp.hide();
      }
   });//end zmanSelect.on(submit,...)
}

function refreshSidebarZmanimDispAccdToDispChoices(display, zmanimData) {
   if (zmanimData && zmanimData.dateStrings.printable) {
      display.empty();
      if (zmanimToDisplayIndicies.length !== 0) {
         display.append(
            `<span class="subtitle">For ${zmanimData.dateStrings.printable}:</span>`
         );
         zmanimToDisplayIndicies.forEach((index) => {
            display.append(
               `<br>${zmanimData.zmanim[index].name}: ${zmanimData.zmanim[index].string}`
            );
         });
      }
      else {
         display.append(`<span id=zmanimFiller>Click the "Select Zmanim to Display" button at the top of this page to display zmanim.</span>`)
      }
   }
}

function updateZmanimToDisplayIndicies() {
   zmanimToDisplayIndicies = [];
   blankZman.zmanim.forEach((x, index) => {
      if (document.getElementById(index).checked) {
         zmanimToDisplayIndicies.push(index);
      }
   });
}

///////////////////// handle date change  /////////////////////
dateInput.on('change', () => {
   const [yearToCheck, nonZeroMonthToCheck, dayOfMonthToCheck] = dateInput.val().split('-'); // break the string into parts
   dateObjectToCheck = new Date(yearToCheck, nonZeroMonthToCheck - 1, dayOfMonthToCheck);  // Date object's month is zero-based

   if (currentLat && currentLng && currentLocationGmtOffset) {
      updateZmanim(currentLat, currentLng, currentLocationGmtOffset, currentLocZmanimDisp);
   }

   if (recentMarkerLat && recentMarkerLng && (recentMarkerGmtOffset || recentMarkerGmtOffset === 0)
      && (currentLocationGmtOffset || currentLocationGmtOffset === 0)) {

      rcntMrkrSunCalcZmanim = getSunCalcZmanim(recentMarkerLat, recentMarkerLng, recentMarkerGmtOffset, dateObjectToCheck);
      updateZmanim(recentMarkerLat, recentMarkerLng, recentMarkerGmtOffset, sidebarRcntMrkrZmanimDisp, dateObjectToCheck);
   }
});

//////////////////// initialization  //////////////////////
function initializeApp() {
   initializeAccordians();
   initializeInstructions();
   initializeZmanSelectForm();
   initializeMapFocusSelect();
   initalizeCurrentDate();
   resizeCanvases();
}

function initalizeCurrentDate() {
   dateObjectToCheck = new Date();  // default is to check the current date // dateObjectToCheck is avial to all and is used by other functions
   let nonZeroMonth = (dateObjectToCheck.getMonth() + 1).toString();
   let dayOfMonth = dateObjectToCheck.getDate().toString();
   const currentHtmlDate = `${dateObjectToCheck.getFullYear()}-${nonZeroMonth.padStart(2, '0')}-${dayOfMonth.padStart(2, '0')}`;
   $('#dateInput').val(currentHtmlDate);
}

function resizeCanvases() {
   currentLocationCanvas1.width = document.getElementById("currentLocationInfo").clientWidth / 6.5;
   currentLocationCanvas1.height = document.getElementById("currentLocationInfo").clientWidth / 6.5;
   currentLocationCanvas2.width = currentLocationCanvas1.width;
   currentLocationCanvas2.height = currentLocationCanvas1.height;

   markerCanvas1.width = currentLocationCanvas1.width; //marker canvas may not be in dom
   markerCanvas1.height = currentLocationCanvas1.height;
   markerCanvas2.width = markerCanvas1.width;
   markerCanvas2.height = markerCanvas1.height;

   infoWindowCanvas1.width = markerCanvas1.width * .85  // give  this similar size as sidebar canvas (infoWindowWrapper html is not sized  yet so too large)
   infoWindowCanvas1.height = infoWindowCanvas1.width;
   infoWindowCanvas2.width = infoWindowCanvas1.height;
   infoWindowCanvas2.height = infoWindowCanvas1.width;
}

// window.addEventListener('resize', resizeCanvases);  // if add this function,  need to  redraw canvases after resize