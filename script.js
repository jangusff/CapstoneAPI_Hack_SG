'use strict';

const baseURL = 'https://ghibliapi.herokuapp.com';

const endPtFilms = 'films';
const endPtPeople = 'people';
const endPtLocations = 'locations';
const endPtSpecies = 'species';
const endPtVehicles = 'vehicles';

let filmDB = [];

function setActiveAppPhase(targetPhase) {
  $('.app-phase').removeClass("toggle__active");
  targetPhase.addClass("toggle__active");
}

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

function displayFetchErr(err) {
  $('#initial-fetch-err').text(`Sorry. Unable to retrieve film information. Cannot proceed.`);
  if (err.length > 0) {
    $('#initial-fetch-err').append(`<p class='errmsg-display'>(Err: ${err})</p>`);
  }
  $('button.enter-site').addClass('button-hide');
}


function displayBrowsePage(fetchedFilmDB) {
  filmDB = fetchedFilmDB;
  if (filmDB.length > 0 && filmDB.some(element2Chk => {
    return Object.keys(element2Chk).length > 0;
  })) {
    setActiveAppPhase($('.browse-cards-page'));
  } else {
    displayFetchErr('Retrieved empty film database');
  }
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
    .catch(err => displayFetchErr(err.message));    
}

 
function displayResults(responseJson) {
  console.log(responseJson);
}

function formInit() {
  btnHndlr_EnterSite();
  btnHndlr_LearnMore();
}


$(formInit);