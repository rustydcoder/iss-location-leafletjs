const icon_url = 'iss-image.png'
const mymap = L.map('map').setView([0, 0], 1);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   maxZoom: 18,
   id: 'mapbox/dark-v10',
   tileSize: 512,
   zoomOffset: -1,
   accessToken: 'pk.eyJ1IjoicnVzdHlkY29kZXIiLCJhIjoiY2tiOWY4d2EyMGRvdjMxbzEyNzRsNWFiaCJ9.2BC2UYTDVtxXygK54S-6Sg'
}).addTo(mymap);

let myIcon = L.icon({
   iconUrl: icon_url,
   iconSize: [50, 85]
});

let marker = L.marker([0, 0], { icon: myIcon }).addTo(mymap);
mymap.on('zoomend', function () {
   const zoom = mymap.getZoom() + 1;
   const w = 50 * zoom;
   const h = 32 * zoom;
   myIcon.options.iconSize = [w, h];
   myIcon.options.iconAnchor = [w / 2, h / 2];
   mymap.removeLayer(marker);
   let latlng = marker.getLatLng();
   marker = L.marker([0, 0], { icon: myIcon }).addTo(mymap);
   marker.setLatLng(latlng);
});

// TODO: By reading the leaflet doc you'll understand all what the code above does

let $flag = true; // To render the map for the firstTime

async function fetchIss() {
   const url = "https://api.wheretheiss.at/v1/satellites/25544"
   const getIssApi = await fetch(url)
   const response = await getIssApi.json()
   const { latitude, longitude, altitude, timestamp } = response
   return { latitude, longitude, altitude, timestamp };
}

async function initMap() {
   const iss = await fetchIss()
   marker.setLatLng([iss.latitude, iss.longitude]);
   if ($flag) {
      mymap.setView([iss.latitude, iss.longitude], 2);
      $flag = false;
   }

   insertToDom(iss)
}
initMap()
setInterval(initMap, 1000)

function insertToDom({ latitude, longitude, altitude, timestamp }) {
   const container = document.querySelector('.container'),
      date = container.querySelector('#date'),
      time = container.querySelector('#time'),
      lng = container.querySelector('#lng'),
      lat = container.querySelector('#lat'),
      alt = container.querySelector('#alt');

   let today = new Date(timestamp * 1000),
      hour = today.getHours(),
      min = today.getMinutes(),
      sec = today.getSeconds();
   hour = hour % 12 || 12;
   const amPm = hour > 12 ? "PM" : "AM";

   date.innerText = `Date: ${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
   time.innerText = `Time: ${hour}:${addZero(min)}:${addZero(sec)}${amPm}`
   lng.innerText = "Longitude: " + longitude.toFixed(2)
   lat.innerText = "Latitude: " + latitude.toFixed(2)
   alt.innerText = "Altitude: " + altitude.toFixed(2)
}

function addZero(num) {
   return (parseInt(num, 10) < 10 ? "0" : " ") + num;
}
