// ******** Begin Google Maps ********* //
function initMap() {
  // latitude and longitude for different location
  // var name format: location x streetName

 // bitcoin marker hosted on imgur
  var bitcoinMarker = "https://i.imgur.com/2IrgxZs.png";

  //3000 City
  var cityxmc = {lat: -37.811316, lng: 144.962345};
  var cityxeli = {lat: -37.812621, lng: 144.961197};

  //3002 East Melbourne
  var eastxalbert = {lat: -37.810182, lng: 144.981044};

  //3008 Docklands
  var dockxbourke = {lat: -37.819007, lng: 144.946385};

  //map, Melbourne Central 
  var map = new google.maps.Map(
    // Default position when maps open
    document.getElementById('googleMaps'), {
      zoom: 15, 
      center: cityxmc
    });

    // ******** BEGIN POP UP WINDOW ******** //
    var contentString = 
      '<div id="content1">'+
      '<div class="container">'+
      '<div class="p-3 mb-6 bg-dark text-white text-center" style="margin-bottom:30px;" >Available Meetup Point</div>'+
      '<div class="row">'+
      '<div class="col">'+
      '<img src="https://static.ffx.io/images/$width_780%2C$height_439/t_crop_auto/t_sharpen%2Cq_auto%2Cf_auto/f813bdba882a963e27f6a17f5cdf4a17cf60967b" alt="nissanSuv" width="330" height="200">'+
      '</div>'+
      '<div class="col text-center">'+
      '<table class="table">'+
      '<tbody>'+
      '<tr>'+
      '<th scope="row">Address</th>'+
      '<td> 432 Bourke Street</td>'+
      '</tr>'+
      '<tr>'+
      '<th scope="row">Time</th>'+
      '<td>Friday 20:00</td>'+
      '</tr>'+
      '<tr>'+
      '<th scope="row">Hosted By</th>'+
      '<td>Ed. Snowden</td>'+
      '</tbody>'+
      '</table>'+
      '<a href="subscribe" class="btn btn-info" role="button">Subscribe Now</a>'+
      '</div>'+
      '</div>'+
      '</div>'+
      '</div>'
    ;
      var gMapsMarker = new google.maps.Marker({
        position: cityxmc,
        map: map,
        icon: bitcoinMarker
        });

      var gMapsInfo = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 600 
      });

      gMapsMarker.gMapsInfo = gMapsInfo;

      gMapsMarker.addListener('click', function() {
        return this.gMapsInfo.open(map, this);
      });


  // The meetup marker, positioned for City 3000
  //var marker = new google.maps.Marker({position: cityxmc, map: map, icon: bitcoinMarker});
  var marker = new google.maps.Marker({position: cityxeli, map: map, icon: bitcoinMarker});

  // The meetup marker, positioned for East Melbourne 3002
  var marker = new google.maps.Marker({position: eastxalbert, map: map, icon: bitcoinMarker});

  // The bitcoin marker, positioned for Docklands 3008
  var marker = new google.maps.Marker({position: dockxbourke, map: map, icon: bitcoinMarker});

  // Set autocomplete project, for assignment purpose set no boundaries -> -90, -180 90,180
  var defaultBounds = new google.maps.LatLngBounds(
   new google.maps.LatLng(-90, -180),
   new google.maps.LatLng(90, 180));
  
  var input = document.getElementById('pac-input');
  var options = {
    bounds: defaultBounds,
      // for future reference if anyone want to set to any country
      // set location only in AU
      //types: ['(cities)'],
      //componentRestrictions: {country: 'au'}
    };

  // Create the autocomplete object
  var autocomplete = new google.maps.places.Autocomplete(input, options);
  
  autocomplete.bindTo('bounds', map);
  
  autocomplete.setFields(
    ['address_components', 'geometry', 'icon', 'name']);
  
  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map:map,
    anchorPoint: new google.maps.Point(0, -29)
  });

autocomplete.addListener('place_changed', function() {
  infowindow.close();
  marker.setVisible(false);
  var place = autocomplete.getPlace();
  // if the location not found, it will prompt a dialog box to let user know
  if (!place.geometry) {
    window.alert("The location you search are not found: '" + place.name + "'");
    return;
  }

  // If location found then show on map
  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
  } else {
    map.setCenter(place.geometry.location);
    map.setZoom(17);
  }
  
  // It will set the location you search with red marker
  marker.setPosition(place.geometry.location);
  marker.setVisible(true);
  
  var address = '';
  if (place.address_components) {
    address = [
    (place.address_components[0] && place.address_components[0].short_name || ''),
    (place.address_components[1] && place.address_components[1].short_name || ''),
    (place.address_components[2] && place.address_components[2].short_name || '')
    ].join(' ');
  }
  
  infowindowContent.children['place-icon'].src = place.icon;
  infowindowContent.children['place-name'].textContent = place.name;
  infowindowContent.children['place-address'].textContent = address;
  infowindow.open(map, marker);
  
  });
}
