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

function findById(arrToSrch, idNum) {
  let retObj = {};

  arrToSrch.forEach(itemObj => {
    if (itemObj.id === idNum) {
      retObj = itemObj;
    }
  });
  
  return retObj;
}

function getVideoID(targetID) {
  let retVal = "";
  Object.keys(videoID).forEach(function(key) {
    if (key === targetID) {
      retVal = videoID[key];
    }
  });
  return retVal;
}


function btnHndlr_EnterSite() {
  $('.intro-page').on('click', '.enter-site', event => {
    event.preventDefault();
    getFilmDatabase();
  });
}


function btnHndlr_BackToBrowse() {
  $('.details-view').on('click', '.back-to-browse-button', event => {
    event.preventDefault();
    setActiveAppPhase($('.browse-cards-page'));
  });
}


function btnHndlr_LearnMore() {
  $('.card-footer').on('click', '.card-button', event => {
    event.preventDefault();
    let targetID = $(event.target).parents('.card').attr('id');

    let foundFilmObj = findById(filmDB, targetID);

    if (jQuery.isEmptyObject(foundFilmObj)) {

      alert("Object was empty.");

    } else {
      let filmTitle = foundFilmObj.title;
      let filmRelease = foundFilmObj.release_date;
      let filmDescr = foundFilmObj.description;
      let filmVideoID = getVideoID(targetID);
      
      if (filmVideoID === "") {
        // set class identifier such that some message like "Trailer not Available" displays instead of iframe stuff
      }
     
      $('.app-phase.details-view').html(`<img src="images/${targetID}.jpg" alt="${filmTitle}">
        
        <section class="details film-descrip">
          <h2>Description</h2>
          <p>${filmDescr}</p>
        </section>
        
        <section class="details cast">
          <h2>Characters</h2>
          <ul>
            <li>Suzuki Blondeau</li>
            <li>Timo Potter</li>
            <li>Kakashan Timoshi</li>
          </ul>
        </section>

        <section class="details trailer">
          <h2>Play Trailer</h2>
          <div class="iframe-container">
            <iframe src="https://www.youtube.com/embed/${filmVideoID}?start=2&modestbranding=1&showinfo=0&rel=0&fs=0" width="450" height="300" frameborder="0"></iframe>
          </div>
        </section>

        <button class="back-to-browse-button" type="submit">Back</button>`);

      setActiveAppPhase($('.details-view'));
      btnHndlr_BackToBrowse();
    } // check for empty object

  });
}


function displayFetchErr(err) {
  $('#initial-fetch-err').text(`Sorry. Unable to retrieve film information. Cannot proceed.`);
  if (err.length > 0) {
    $('#initial-fetch-err').append(`<p class='errmsg-display'>(Err: ${err})</p>`);
  }
  $('button.enter-site').addClass('button-hide');
}

function renderFilmCard(filmObj, index) {
  let filmID = filmObj.id;
  let filmTitle = filmObj.title;
  let filmRelease = filmObj.release_date;
  
  if (index === 0) {
    $('.app-phase.browse-cards-page').html(`<div class="card" id="${filmID}">\
            <img src="images/${filmID}.jpg" class="card-img-top" alt="${filmTitle}">\
            <p class="card-release-date">${filmRelease}</p>\
            <div class="card-body">\
              <h5 class="card-title">${filmTitle}</h5>\
            </div>\
            <div class="card-footer">\
              <button class="card-button" type="submit">Learn More</button>\
            </div>\
          </div>`);

  } else {

    $('.card').last().after(`<div class="card" id="${filmID}">\
            <img src="images/${filmID}.jpg" class="card-img-top" alt="${filmTitle}">\
            <p class="card-release-date">${filmRelease}</p>\
            <div class="card-body">\
              <h5 class="card-title">${filmTitle}</h5>\
            </div>\
            <div class="card-footer">\
              <button class="card-button" type="submit">Learn More</button>\
            </div>\
          </div>`);
  }
}

function displayBrowsePage(fetchedFilmDB) {
  let filmObj;

  filmDB = fetchedFilmDB;
  if (filmDB.length > 0 && filmDB.some(element2Chk => {
    return Object.keys(element2Chk).length > 0;
  })) {
    filmDB.forEach(renderFilmCard);
    btnHndlr_LearnMore();
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
  
}


$(formInit);