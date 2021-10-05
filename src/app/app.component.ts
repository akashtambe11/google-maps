import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  title = 'google-maps';
  gpsCoords = { lat: 12.9716, lng: 77.5946 }; // Default coordinates
  map: google.maps.Map;
  geocoder;
  currentAddress: string = "";
  labels = "Mechanic will reach here";
  marker;
  mechanicMarkers: google.maps.Marker[] = [];
  userMarkers: google.maps.Marker[] = [];
  flightPath: google.maps.Polyline;
  flightPaths: google.maps.Polyline[] = [];
  userLocation;
  draggedLocation;


  // **********************************************************
  // Angular Google Map Integration 
  // latitude: number = 12.9716;
  // longitude: number = 77.5946;
  // **********************************************************

  ngOnInit() {
    this.initialiseGoogleMap(); // To intialise google map.
    this.locateMeOption(); // To add locate me option in google map.
    this.listenToGeolocateEvent(); // To listen geolocation event on page load.
    this.listenToMapDragEvent(); // To listen drag and drop option.
    // this.listenToMapClickEvent(); // To listen click event.
  }

  ngAfterViewInit() { }

  // Initialising Google Map
  initialiseGoogleMap() {
    var mapProp = {
      center: this.gpsCoords,
      zoom: 10,
      mapTypeId: "roadmap",
      fullscreenControl: false,
      scaleControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    };

    this.map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    this.geocoder = new google.maps.Geocoder();

    // const marker = new google.maps.Marker({
    //   position: myLatlng,
    //   map,
    //   title: "Click to zoom",
    // });
  }

  // To Add Locate Me GPS option
  locateMeOption() {

    const locationButton = document.createElement("div");
    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '40px';
    firstChild.style.height = '40px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.marginTop = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Locate Me';
    locationButton.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '10px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.cursor = 'pointer';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
    secondChild.style.backgroundSize = '200px 18px';
    secondChild.style.backgroundPosition = '0px 0px';
    secondChild.style.backgroundRepeat = 'no-repeat';
    secondChild.id = 'you_location_img';
    firstChild.appendChild(secondChild);

    // To push The GPS button in Map
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locationButton);

    // Click Event on locate Me GPS option
    firstChild.addEventListener('click', () => {
      this.listenToGeolocateEvent();
    })
  }

  // To get current postion of user on page load
  listenToGeolocateEvent() {
    if (!navigator.geolocation) {
      console.log("Location not supported on your browser");
      // this.toastr.warning('Location not supported on your browser!');

    } else {
      navigator.geolocation.getCurrentPosition(position => {
        this.gpsCoords.lat = position.coords.latitude;
        this.gpsCoords.lng = position.coords.longitude;

        const myposition = {
          lat: this.gpsCoords.lat,
          lng: this.gpsCoords.lng,
        };
        this.deleteMarkers();
        this.deleteFlightpath();
        setTimeout(() => {
          this.addMarker(myposition, "user")
        }, 500);

        this.userLocation = myposition;
        this.flyToCoordinate(myposition);
        // console.log("Current Location", position.coords.latitude, position.coords.longitude);
      })
    }
  }

  // Dragged Event on Map
  listenToMapDragEvent() {
    google.maps.event.addListener(this.map, 'dragend', () => {
      this.gpsCoords.lat = this.map.getCenter().lat();
      this.gpsCoords.lng = this.map.getCenter().lng();

      const myposition = {
        lat: this.gpsCoords.lat,
        lng: this.gpsCoords.lng,
      };

      this.deleteFlightpath();
      this.map.panTo(myposition);
      this.draggedLocation = myposition;
      this.createRoute();
      this.flyToCoordinate(myposition);
    });
  }

  // Click Event on Map
  listenToMapClickEvent() {
    google.maps.event.addListener(this.map, "click", (event) => {

      this.map.panTo(event.latLng);
      this.gpsCoords.lat = this.map.getCenter().lat();
      this.gpsCoords.lng = this.map.getCenter().lng();

      const myposition = {
        lat: this.gpsCoords.lat,
        lng: this.gpsCoords.lng,
      };
      this.flyToCoordinate(myposition);
    });
  }

  // To keep map centered
  flyToCoordinate(coords) {
    // setCenter help to keep postion of map center as per coordinates
    // this.map.setCenter(coords);
    this.map.panTo(coords);
    this.map.setZoom(18);
    this.fetchGeocodedAddress(coords)
  }

  // To fetch address according to coordinates
  fetchGeocodedAddress(coords) {
    this.currentAddress = "Loading Address . . .";

    this.geocoder.geocode(
      { location: coords },
      (
        results: google.maps.GeocoderResult[],
        status: google.maps.GeocoderStatus
      ) => {
        if (status === "OK") {
          if (results[0]) {
            this.currentAddress = results[0].formatted_address;
          } else {
            window.alert("No results found");
          }
        } else {
          window.alert("Geocoder failed due to: " + status);
        }
      }
    )
  }

  // Adds a marker to the map.
  addMarker(location: google.maps.LatLngLiteral, type: string) {
    const marker = new google.maps.Marker({
      position: location,
      // label: this.labels,
      map: this.map,
      // icon: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi_hdpi.png"
    });

    // if (type === "mechanic")
    //   this.mechanicMarkers.push(marker);
    // else
    this.userMarkers.push(marker);
    console.log(this.userMarkers);
  }

  createRoute() {
    // Define a symbol using SVG path notation, with an opacity of 1.
    const lineSymbol = {
      path: "M 0,-1 0,1",
      strokeOpacity: 0.8,
      scale: 1.5,
    };

    const line = new google.maps.Polyline({
      path: [
        this.userLocation,
        this.draggedLocation,
      ],
      strokeOpacity: 0,
      icons: [
        {
          icon: lineSymbol,
          offset: "",
          repeat: "8px",
        },
      ],
      map: this.map,
    });

    this.flightPaths.push(line)
    console.log(this.flightPaths);
  }

  // Deletes all markers in the array by removing references to them.
  deleteMarkers(): void {
    this.setMapOnAll();
    this.mechanicMarkers = [];
    this.userMarkers = [];
  }

  // Deletes all markers in the array by removing references to them.
  setMapOnAll() {
    for (let i = 0; i < this.mechanicMarkers.length; i++) {
      this.mechanicMarkers[i].setMap(null);
    }
    for (let i = 0; i < this.userMarkers.length; i++) {
      this.userMarkers[i].setMap(null);
    }
  }

  deleteFlightpath() {
    for (let i = 0; i < this.flightPaths.length; i++) {
      this.flightPaths[i].setMap(null);
    }
    this.flightPaths = [];
  }

}
