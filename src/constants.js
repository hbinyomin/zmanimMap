import $ from 'jquery';
export const openWeatherKey = '0e403d86301a5a25ffbf6ff460391326';
export const geoNamesKey = 'hitherefromb';

export const locationSelector = $('#locSelect');
export const dateInput = $('#dateInput');
export const modalDiv = $('#modalDiv');


export const currentLocNameDisp = $('#currentLocationName');
export const currentLocInfoWrapper = $('#currentLocWrapper');
export const currentLocInfoDisp = $('#currentLocationInfo');
export const currentLocLatLngDisp = $('#currentLatLngDisp');
export const currentLocAltitudeDisp = $('#currentAltitude');
export const currentLocWeatherDisp = $('#currentWeather');
export const currentLocZmanimDisp = $('#currentLocationZmanim');

export const sidebarRcntMrkrLocNameDisp = $('#markerLocationName');
export const sidebarRcntMrkrLatLngDisp = $('#latLngDisp');
export const sidebarRcntMrkrWeatherDisp = $('#markerWeather');
export const sidebarRcntMrkrAltitudeDisp = $('#markerAltitude');
export const sidebarRcntMrkrZmanimDisp = $('#markerZmanim');
export const sidebarRcntMrkrYerushDirectionDisp = $('#markerYerushDirection');


export const america = { name: "America", position: { lat: 38.174832969478295, lng: -98.64470995507432 }, zoom: 4 };
const world = { name: "World", position: { lat: 25, lng: -30 }, zoom: 2.1 };
const eretzYisrael = { name: "Eretz Yisrael", position: { lat: 31.5, lng: 35.2 }, zoom: 7 };
const yerushalayim = { name: "Yerushalayim", position: { lat: 31.779341401425537, lng: 35.19419302982651 }, zoom: 11 };
const lakewood = { name: "Lakewood", position: { lat: 40.095613, lng: -74.222084 }, zoom: 14 };
const chicago = { name: "Chicago", position: { lat: 42.012285, lng: -87.704732 }, zoom: 11 };
const newYork = { name: "New York", position: { lat: 40.703942, lng: -73.897266 }, zoom: 11 };
const miami = { name: "Miami", position: { lat: 25.863195, lng: -80.193362 }, zoom: 11 };
const phoenix = { name: "Phoenix", position: { lat: 33.443263, lng: -112.08209 }, zoom: 10 };
const losAngeles = { name: "Los Angeles", position: { lat: 33.91724, lng: -118.096468 }, zoom: 10 };
const houston = { name: "Houston", position: { lat: 29.6462, lng: -95.368458 }, zoom: 10 };
const stLouis = { name: "St. Louis", position: { lat: 38.62947, lng: -90.227932 }, zoom: 11 };
const toronto = { name: "Toronto", position: { lat: 43.696969, lng: -79.426079 }, zoom: 11 };
const beitShemesh = { name: "Beit Shemesh", position: { lat: 31.746076, lng: 34.989766 }, zoom: 14 };
const tzefas = { name: "Tzefas", position: { lat: 32.967195, lng: 35.503338 }, zoom: 14 };
const bnaiBrak = { name: "Bnai Brak", position: { lat: 32.086065, lng: 34.832329 }, zoom: 14 };
const europe = { name: "Europe", position: { lat: 45, lng: 15 }, zoom: 4 };

export const placesArray = [eretzYisrael, yerushalayim, tzefas, bnaiBrak, beitShemesh, newYork, lakewood, losAngeles, chicago, phoenix, houston, stLouis, miami, toronto, world, america, europe];
export const currentLocationZoom = 20;

export const currentLocationCanvas1 = document.getElementById('currentLocationCanvas1');
export const currentLocationCanvas2 = document.getElementById('currentLocationCanvas2');
export const markerCanvas1 = document.getElementById('markerCanvas1');
export const markerCanvas2 = document.getElementById('markerCanvas2');
export const infoWindowCanvas1 = document.getElementById('infoWindowCanvas1');
export const infoWindowCanvas2 = document.getElementById('infoWindowCanvas2');

export const zmanSelectForm = $('#zmanSelectForm');
export const instructions = $('#instructions');



export const infoWindowLocationName = $('#infoWindowLocationName');
export const infoWindowLatLng = $('#infoWindowLatLng');
export const infoWindowAltitude = $('#infoWindowAltitude');
export const infoWindowWeather = $('#infoWindowWeather');
export const infoWindowZmanim = $('#infoWindowZmanim');
export const infoWindowYerushDirection = $('#infoWindowYerushDirection');
export const infoWindowWrapper = $('#infoWindowWrapper');

