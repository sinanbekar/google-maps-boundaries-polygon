/**
* @license
* Copyright 2022 Google LLC. All Rights Reserved.
* SPDX-License-Identifier: Apache-2.0
*/

/**
 * Modified by Sinan Bekar <sinanbekar.work@gmail.com>
 */

 let map: google.maps.Map;
 let searchInput: HTMLInputElement;
 let contentDiv: HTMLElement;
 let autoComplete: google.maps.places.Autocomplete;
 let placesService: google.maps.places.PlacesService;
 
 let allLayers;
 let countryLayer;
 let admin1Layer;
 let admin2Layer;
 let admin3Layer;
 let admin4Layer;
 let localityLayer;
 let subLocalityLayer;
 let neighborhoodLayer;
 let postalCodeLayer;
 
 function initMap() {
     map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
         center: { lat: 39.32, lng: -95 }, // Near the center of the contintental U.S.
         zoom: 6,
         mapTypeControl: false,
         streetViewControl: false,
         // In the cloud console, configure this Map ID with a style that enables 
         // ALL Data Driven Styling types.
         mapId: '1bf5295b744a394a',
     });
 
     contentDiv = document.getElementById('pac-content') as HTMLElement;
     searchInput = document.getElementById('pac-input') as HTMLInputElement;
 
     // Inject the UI HTML.
     const sidebar = document.getElementById('sidebar') as HTMLElement;
     map.controls[google.maps.ControlPosition.TOP_LEFT].push(sidebar);
 
     // Set up the Autocomplete widget.
     const autocompleteOptions = {
         fields: ['place_id', 'type'],
         strictBounds: false,
         types: ['(regions)'],
     };
 
     autoComplete = new google.maps.places.Autocomplete(searchInput, autocompleteOptions);
     placesService = new google.maps.places.PlacesService(map);
 
     autoComplete.addListener('place_changed', () => {
         const place = autoComplete.getPlace() as google.maps.places.PlaceResult;
 
         if (place && place.place_id){
             const types = place.types as string[];
             const featureType = types[0]
 
             showSelectedPolygon(place.place_id, featureType);
         }
     });
 
     // Add all the feature layers.
     //@ts-ignore
     countryLayer = map.getFeatureLayer('COUNTRY');
     //@ts-ignore
     admin1Layer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_1');
     //@ts-ignore
     admin2Layer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_2');
     //@ts-ignore
     admin3Layer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_3');
     //@ts-ignore
     admin4Layer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_4');
     //@ts-ignore
     localityLayer = map.getFeatureLayer('LOCALITY');
     //@ts-ignore
     subLocalityLayer = map.getFeatureLayer('SUBLOCALITY_LEVEL_1');
     //@ts-ignore
     neighborhoodLayer = map.getFeatureLayer('NEIGHBORHOOD');
     //@ts-ignore
     postalCodeLayer = map.getFeatureLayer('POSTAL_CODE');
 
     // List of all the layers when they get initialized.
     allLayers = [countryLayer, admin1Layer, admin2Layer, admin3Layer, admin4Layer, localityLayer, subLocalityLayer, neighborhoodLayer, postalCodeLayer];
 
     // Init map styles.
     applyStyle();
 
 }
 
 // Apply styling to a polygon.
 function applyStyle(placeId?: string, featureType?: string) {
     // Define styles.
     let styleStrokeFill = /** @type {!google.maps.FeatureStyleOptions} */({
         strokeColor: "#810FCB",
         strokeOpacity: 1.0,
         strokeWeight: 2.0,
         fillColor: "#810FCB",
         fillOpacity: 0.5
     });
 
     revertStyles();
 
     const featureStyle = (params) => {
         if (params.feature.placeId == placeId) {
             return styleStrokeFill;
         }
     }
 
     // Only style the selected feature type.
     switch (featureType) {
         case 'country':
             countryLayer.style = featureStyle;
             break;
         case 'administrative_area_level_1':
             admin1Layer.style = featureStyle;
             break;
         case 'administrative_area_level_2':
             admin2Layer.style = featureStyle;
             break;
         case 'administrative_area_level_3':
             admin3Layer.style = featureStyle;
             break;
         case 'administrative_area_level_4':
             admin4Layer.style = featureStyle;
             break;
         case 'locality':
             localityLayer.style = featureStyle;
             break;
         case 'sublocality_level_1':
         subLocalityLayer.style = featureStyle;
         break;
         case 'neighborhood':
             neighborhoodLayer.style = featureStyle;
             break;
         case 'postal_code':
             postalCodeLayer.style = featureStyle;
             break;
         default:
             break;
     }
 }
 
 
 // Restyle all feature layers to be invisible.
 function revertStyles() {
     for (const layer of allLayers) {
         layer.style = null;
     }
 }
 
 // Event handler for when a polygon is selected.
 function showSelectedPolygon(placeId: string, featureType: string) {
     contentDiv.innerHTML = ''; // Clear the info display.
 
     const request = {
         placeId: placeId,
         fields: [
             'name',
             'formatted_address',
             'geometry',
             'type'
         ],
     };
 
     // Make a Place Details request.
     placesService.getDetails(request, (place, status) => {
         if (
             status === google.maps.places.PlacesServiceStatus.OK &&
             place &&
             place.geometry &&
             place.geometry.location
         ) {
             // Zoom to the polygon.
             var viewport = place.geometry?.viewport as google.maps.LatLngBounds;
             map.fitBounds(viewport, 155);
 
             // Build the HTML.
             contentDiv.appendChild(document.createElement('hr'));
 
             const types = place.types as string[];
 
             // Create HTML for place information.
             contentDiv.innerHTML = '<hr><span id="place-info"><b>' + place.formatted_address + 
                 '</b><br/> Place ID: <code>' + placeId + '</code>' +
                 '<br/> Feature type: <code>' + types[0] + '</code></span><br/>';
         }
     });
 
     // Call the global styling function.
     applyStyle(placeId, featureType);
 
 }
 
 declare global {
     interface Window {
         initMap: () => void;
     }
 }
 window.initMap = initMap;
 export { };