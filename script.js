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

function displayBrowsePage(fetchedFilmDB) {
  filmDB = fetchedFilmDB;
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
    .then(responseJson => displayBrowsePage(responseJson))
    .catch(err => {
      $('#initial-fetch-err').text(`Unable to retrieve film information. Cannot proceed.`);
      if (err.message.length > 0) {
        $('#initial-fetch-err').append(`<p class='errmsg-display'>(Err: ${err.message})</p>`);
      }
    });
    
}

 
function displayResults(responseJson) {
  console.log(responseJson);
}

function formInit() {
  btnHndlr_EnterSite();
  btnHndlr_LearnMore();
}


$(formInit);