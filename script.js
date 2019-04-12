'use strict';

const baseURL = 'https://ghibliapi.herokuapp.com';

const endPtFilms = 'films';
const endPtPeople = 'people';
const endPtLocations = 'locations';
const endPtSpecies = 'species';
const endPtVehicles = 'vehicles';

let filmDB = [];

function btnHndlr_EnterSite() {
  $('.intro-page').on('click', '.enter-site', event => {
    event.preventDefault();
    getFilmDatabase();
  });
}


function btnHndlr_LearnMore() {
  $('.card-footer').on('click', '.card-button', event => {
    event.preventDefault();
    alert("Learn More was Clicked");
  });
}

function displayResults(responseJson) {
  filmDB = responseJSon;
  console.log(filmDB);
}

function getFilmDatabase() {
    
  const fieldsToIncl = 'fields=id,title,release_date,description';
  const url = baseURL + '/' + endPtFilms + '?' + fieldsToIncl;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => console.log(responseJson))
    .catch(err => console.log(`Something went wrong: ${err.message}`));

}

 
function displayResults(responseJson) {
  console.log(responseJson);
}

function formInit() {
  btnHndlr_EnterSite();
  btnHndlr_LearnMore();
}


$(formInit);