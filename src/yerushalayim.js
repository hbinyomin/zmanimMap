/////////////// Direction to Face Yerushalayim  /////////////////
const mikdashLat = 31.778039;
const mikdashLng = 35.235382;
// import $ from 'jquery';

export default function (theCanvasRhumb, theCanvasGreatCircle, startLat, startLng) {

   const bearingRhumb = findBearingRhumb(startLat, startLng, mikdashLat, mikdashLng)
   const bearingGreatCircle = findGreatCircleInitialBearing(startLat, startLng, mikdashLat, mikdashLng);

   postInfoDirectionToYerushalayim(theCanvasRhumb, theCanvasGreatCircle, bearingRhumb, bearingGreatCircle);
}

function    postInfoDirectionToYerushalayim(theCanvasRhumb, theCanvasGreatCircle, bearingRhumb, bearingGreatCircle) {

   $(theCanvasRhumb).before($(`<span class="subtitle infoWindowOnly">Direction to Yerushalayim:</span>
      <div class="noSpace">Rhumb Line (constant compass direction): ${Math.round(bearingRhumb)}° </div>`));
   drawCircle(theCanvasRhumb, toRadians(bearingRhumb));

   $(theCanvasGreatCircle).before($(`<div>Great Circle (straight and shortest path): ${Math.round(bearingGreatCircle)}° </div>`))
   drawCircle(theCanvasGreatCircle, toRadians(bearingGreatCircle))
}

function drawCircle(theCanvas, radians) {
   const context = theCanvas.getContext('2d');
   context.clearRect(0, 0, theCanvas.width, theCanvas.height);
   const lineWidth = 2;
   const radius = theCanvas.height * 0.5 - lineWidth;
   const center = { x: radius + lineWidth, y: radius + lineWidth };

   context.strokeStyle = 'grey';
   context.lineWidth = lineWidth;
   context.beginPath();
   context.arc(center.x, center.y, radius, 0, Math.PI * 2, false);
   context.stroke();

   context.beginPath();
   // move to point along the circle, and adjust for 0 degress on compass pointing up vs right on math functions and also adjust for center not being (0,0)
   context.moveTo(radius * Math.cos(radians - Math.PI / 2) + center.x, radius * Math.sin(radians - Math.PI / 2) + center.y);
   context.lineWidth = 3;
   context.lineTo(center.x, center.y);
   context.stroke();
}

function toRadians(degrees) {
   return degrees * Math.PI / 180;
}

function toDegrees(radians) {
   return radians * 180 / Math.PI;
}

function findGreatCircleInitialBearing(startLat, startLng, destLat, destLng) {
   startLat = toRadians(startLat);
   startLng = toRadians(startLng);
   destLat = toRadians(destLat);
   destLng = toRadians(destLng);

   let y = Math.sin(destLng - startLng) * Math.cos(destLat);
   let x = Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
   let bearing = Math.atan2(y, x);
   bearing = toDegrees(bearing);
   return (bearing + 360) % 360;
}

function findBearingRhumb(lat, lng, endLat, endLng) {
   const startLatRadians = toRadians(lat);
   const lngRadians = toRadians(lng);
   const endLatRadians = toRadians(endLat);
   const endLngRadians = toRadians(endLng);

   let deltaLng = endLngRadians - lngRadians;
   const deltaLatOnProjection = Math.log(Math.tan(Math.PI / 4 + endLatRadians / 2) / Math.tan(Math.PI / 4 + startLatRadians / 2));

   // if dLon over 180° take shorter rhumb line across the anti-meridian:
   if (Math.abs(deltaLng) > Math.PI) deltaLng = deltaLng > 0 ? -(2 * Math.PI - deltaLng) : (2 * Math.PI + deltaLng);

   const rawBearing = Math.atan2(deltaLng, deltaLatOnProjection) * 180 / Math.PI;
   //use positive number over 180 instead of  a negative number
   const adjustedBearing = rawBearing >= 0 ? rawBearing : rawBearing + 360;

   return adjustedBearing;

}
