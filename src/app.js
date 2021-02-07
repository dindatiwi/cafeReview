//variables
let geoJSON = {}
var mymap = 0
var data = []
let newResto = ''
var newRestoList = []
var newMarker = 0
//review modal
var modal = document.getElementById( "myModal" );
//new review modal
var newRevModal = document.getElementById( "newReviewModal" );
//new data for marker modal
var markerModal = document.getElementById( "newMarkerModal" );
// Get the <span> element that closes the modal
var span = document.getElementsByClassName( "close" )[ 0 ];
var reviewSpan = document.getElementsByClassName( "close" )[ 1 ];
var markerSpan = document.getElementsByClassName( "close" )[ 2 ];
const addReviewPost = document.getElementById("review-form");
const addNewResto = document.getElementById("new-marker-form");
var author = document.getElementById("author");
var authorReview = document.getElementById("text-review");
var addresto = document.getElementById("add-resto");
var reviewContainer = document.querySelector( '.review-list' );

//get location from browser
//map init
function getLocation() {
	//dom
	const resto_container = document.querySelector( '.resto' )

	//geolocation
	if ( navigator.geolocation ) {
		navigator.geolocation.getCurrentPosition( ( position ) => {
			latit = position.coords.latitude
			longit = position.coords.longitude

			//configure the map
			mymap = L.map( 'mapid' ).setView( [ latit, longit ], 14 );
			L.tileLayer( 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox/streets-v11',
				tileSize: 512,
				zoomOffset: -1,
				accessToken: 'pk.eyJ1IjoiYmxhaDEyMyIsImEiOiJja2kydjJhbXUxNDgxMnFtc3ltYXp0cnh5In0.Qs4SZvGjKYrPy9TOj5nWlA'
			} ).addTo( mymap );
			mymap.on( 'click', addMarker );

			var api_url = `https://developers.zomato.com/api/v2.1/geocode?lat=${latit}&lon=${longit}`
			//fetching data
			fetch( api_url, {
					method: "GET",
					headers: {
						"user-key": "0ff6d128a533d91d4129678e70043653"
					}
				} )
				.then( response => {
					if ( response.ok ) {
						return response.json();
					}
					throw new Error( 'Req Failed !' );
				}, networkError => console.log( networkError.message ) )
				.then( jsonResponse => {
					const restoList = jsonResponse.nearby_restaurants;

					//card on the restolist
					const contents = restoList.map( result => card( result.restaurant ) );
					resto_container.innerHTML = contents;

					//mapping & onclick
					geoJSON = {
						...restoList
					};
					for ( let key in geoJSON ) {
						let restaurant = geoJSON[ key ].restaurant;
						const {
							latitude,
							longitude,
							address
						} = restaurant.location;
						const {
							res_id
						} = restaurant.R;
						const {
							aggregate_rating
						} = restaurant.user_rating;
						const {
							featured_image,
							name,
						} = restaurant;

						const popupContent = () =>
							`<img class="thumbnail-popup" src="${featured_image}" alt="">
                            <h3> ${name}</h3>
                            <p><b>Address:</b> ${address}</p> 
                            <div class="rating">
                            <input id="radio" type="radio" name="star" class="star" checked/>
                            <label for="radio">&#9733;</label>
                            </div>
                            <label class="rateNum">${aggregate_rating}</label>
                            <button id="myModal" class="review-button" onclick="getReview('${res_id}')">
                            See Review
                        </button>
                            `;

						L.marker( [ latitude, longitude ] )
							.bindPopup( popupContent )
							.addTo( mymap );
					}
				} );
			// user_rating.aggregate_rating
			function card( result ) {
				return `<div class="resto-item" >
                        <img src="${result.featured_image}" alt="">
                            <h3>${result.name}</h3>
                            <p> Address  : ${result.location.address} </p>
                            <div class="rating">
                                <input id="radio" type="radio" name="star" class="star"/>
                                <label for="radio"  style="color:orange">&#9733;</label>
                            </div>
                            <label class="rateNum"> ${result.user_rating.aggregate_rating}</label>
                        </div>`;
			}
		} )
	} else {
		alert( "User denied the request for Geolocation. Refresh the broswer and allow Geolocation" );
	}
};


addNewResto.addEventListener("submit", (e) => {
	e.preventDefault();
	newResto = addresto.value;

	let newDataItem = {
		newResto: newResto,
	  };
	  
	newRestoList.push(newDataItem)
	markerModal.style.display = "none";
	addresto.value = ""
	let resName = newResto
		const popupContent = () =>
		`<div class="newRestoMarker" >
		<p>Restaurant Name : <h3>${resName}</h3></p>
	</div>`;
		newMarker.bindPopup( popupContent ).addTo( mymap );
  });

function addMarker( e ) {
    newRestoDataMarker()
	// Add marker to map at click location; add popup window
	  newRestoUpdate = {
		...newRestoList
	};
	newMarker = new L.marker( e.latlng )
}

function getReview( val ) {
	const reviewContainer = document.querySelector( '.review-list' )
	var api_review = `https://developers.zomato.com/api/v2.1/reviews?res_id=${val}`
	fetch( api_review, {
			method: "GET",
			headers: {
				"user-key": "0ff6d128a533d91d4129678e70043653"
			}
		} )
		.then( response => {
			if ( response.ok ) {
				return response.json();
			}
			throw new Error( 'Req Failed !' );
		}, networkError => console.log( networkError.message ) )
		.then( jsonResponse => {
			const reviewList = jsonResponse.user_reviews;
			//mapping & onclick
			const contents = reviewList.map( result => popupContent( result.review ) );
			reviewContainer.innerHTML = contents;
			modal.style.display = "block";
		} );
}

const popupContent = ( result ) => {
	return ` <div class="review-item" id="rate">
<div class="rating">
<input id="radio" type="radio" name="star" class="star"/>
<label for="radio"  style="color:orange">&#9733;</label>
</div>
<label class="rateNum"> ${result.rating}</label>
<p>${result.review_text}</p>
<p><small>By ${result.user.name}</small></p>
</div>
`;
}


function newReview(arr) {
  for (let i = 0; i < arr.length; i++) {
	reviewContainer.innerHTML += `
	<div class="review-item" id="rate">
	<div class="rating">
	<input id="radio" type="radio" name="star" class="star"/>
	<label for="radio"  style="color:orange">&#9733;</label>
	</div>
	<label class="rateNum"> ${arr[i].rate}</label>
	<p>${arr[i].review}</p>
	<p><small>By ${arr[i].nama}</small></p>
	</div>
	`;
  }

}

addReviewPost.addEventListener("submit", (e) => {
  e.preventDefault();
  var ratebutton = document.querySelector('input[name="star-review"]:checked');
  var nama = author.value;
  var review = authorReview.value;
  var rate = ratebutton.value;

  let newDataItem = {
    nama: nama,
    review: review,
    rate: rate
  };
  data.push(newDataItem);
  newReview(data);
  author.value = "";
  authorReview.value = "";
  newRevModal.style.display = "none";
});

// Get the <modals> element that open the modals

span.addEventListener( 'click', function () {
	modal.style.display = "none";
} )
reviewSpan.addEventListener( 'click', function () {
	newRevModal.style.display = "none";
} )
markerSpan.addEventListener( 'click', function () {
	markerModal.style.display = "none";
} )

window.addEventListener( 'click', function ( event ) {
	if ( event.target == modal ) {
		modal.style.display = "none";
	}
    if ( event.target == newRevModal ) {
		newRevModal.style.display = "none";
	}
    if ( event.target == markerModal ) {
		markerModal.style.display = "none";
	}
} )

function getNewReview(){
    newRevModal.style.display = "block";
}

function newRestoDataMarker(){
    markerModal.style.display = "block";
}

window.addEventListener( 'DOMContentLoaded', getLocation );