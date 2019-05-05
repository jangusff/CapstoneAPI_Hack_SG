'use strict';

const baseURL = 'https://ghibliapi.herokuapp.com';

const endPtFilms = 'films';
const endPtPeople = 'people';
const endPtLocations = 'locations';
const endPtSpecies = 'species';
const endPtVehicles = 'vehicles';

let FILM_DB = [];
let CHARACTER_DB = {};
let LASTVIEWED_ID = '';


function setActiveAppPhase(targetPhase, showNav) {
  $('.app-phase').removeClass("toggle__active");
  targetPhase.addClass("toggle__active");
  if (showNav) {
    $('nav').addClass("toggle__active");
  }
}

// Search our Film Database by ID and return its Object.
function findById(arrToSrch, idNum) {
  let retObj = {};
  arrToSrch.forEach(itemObj => {
    if (itemObj.id === idNum) {
      retObj = itemObj;
    }
  });
  return retObj;
}

// Return the YouTube video ID for a given Film ID.
function getVideoID(targetID) {
  let retVal = "";
  Object.keys(videoID).forEach(function(key) {
    if (key === targetID) {
      retVal = videoID[key];
    }
  });
  return retVal;
}

// Error-handling functions...

function filmDBFetchErr(err) {
  $('#initial-fetch-err').text(`Sorry. Unable to retrieve film information. Cannot proceed.`);
  if (err.length > 0) {
    $('#initial-fetch-err').append(`<p class='errmsg-display'>(Err: ${err})</p>`);
  }
  $('button.enter-site').addClass('button-hide');
}

function charDBFetchErr(err) {
  // Since this DB is not critical, we'll implicitly silence this exception.
  CHARACTER_DB = {};
}

// Create the HTML necessary to display a single Film card.
function htmlForCard(filmID, filmTitle, filmRelease) {
  return `<div class="card" id="${filmID}">\
            <img src="images/${filmID}.jpg" class="card-img-top" alt="${filmTitle}">\
            <p class="card-release-date">(released ${filmRelease})</p>\
            <div class="card-body">\
              <h5 class="card-title">${filmTitle}</h5>\
            </div>\
            <div class="card-footer">\
              <button class="card-button" type="submit">Learn More</button>\
            </div>\
          </div>`;
}

// Add a card to the Browse page of the site.
function renderFilmCard(filmObj, index) {
  let filmID = filmObj.id;
  let filmTitle = filmObj.title;
  let filmRelease = filmObj.release_date;
    
  if (index === 0) {
    $('.app-phase.browse-cards-page').html(htmlForCard(filmID, filmTitle, filmRelease));
  } else {
    $('.card').last().after(htmlForCard(filmID, filmTitle, filmRelease));
  }
}

// Iterate through the Film Database and formulate the Browse page.
function displayBrowsePage(fetchedFILM_DB) {
  let filmObj;

  FILM_DB = fetchedFILM_DB;
  if (FILM_DB.length > 0 && FILM_DB.some(element2Chk => {
    return Object.keys(element2Chk).length > 0;
  })) {
    FILM_DB.forEach(renderFilmCard);
    btnHndlr_LearnMore();
    setActiveAppPhase($('.browse-cards-page'), true);
  } else {
    filmDBFetchErr('Retrieved empty film database');
  }
}

// Create the Details page for a particular Film.
function renderDetailsView(targetID) {
  let foundFilmObj = findById(FILM_DB, targetID);
  LASTVIEWED_ID = "";

  if (jQuery.isEmptyObject(foundFilmObj)) {
    alert("Sorry, no details available.");

  } else {
    let filmTitle = foundFilmObj.title;
    let filmRelease = foundFilmObj.release_date;
    let filmDescr = foundFilmObj.description;
    let filmVideoID = getVideoID(targetID);
    let castHtml = '';
    let trailerHtml = '';

    $('.details-title').html(`${filmTitle}`).append(`<span class="details-title-reldate">(${filmRelease})</span>`);
    $('.details.feature-img').html(`<img src="images/${targetID}.jpg" alt="${filmTitle}">`);
    $('.details.film-descrip').html(`<h2>Description</h2>
        <p>${filmDescr}</p>`
    );

    if (CHARACTER_DB.hasOwnProperty(targetID)) {
      let arrCast = CHARACTER_DB[targetID];
      castHtml = `  <ul>`;
      arrCast.forEach(oneName => { castHtml += `   <li>${oneName}</li>`});
      castHtml += ' </ul>';
    } else {
      castHtml = `<p>(none)</p>`;
    }

    $('.details.cast').html(`<h2>Notable Characters</h2>${castHtml}`);
    
    if (filmVideoID !== "") {
      trailerHtml = `<div class="iframe-container">
            <iframe src="https://www.youtube.com/embed/${filmVideoID}?start=2&modestbranding=1&showinfo=0&rel=0&fs=0" frameborder="0"></iframe>
          </div>`;
    } else {
      trailerHtml = `<p class="no trailer">No trailer found</p>`;
    }

    $('.details.trailer').html(`<h2>Play Trailer</h2>${trailerHtml}`);
    
    LASTVIEWED_ID = targetID;
    setActiveAppPhase($('.details-view'), true);
    scrollTo(0,0);

  } // check for non-existent film object
}

// Query API for Film information and build our Browse page.
function getFilmDatabase() {
  const fieldsToIncl = 'fields=id,title,release_date,description';
  const url = baseURL + '/' + endPtFilms + '?' + fieldsToIncl;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayBrowsePage(responseJson))
    .catch(err => filmDBFetchErr(err.message));    
}

// Query API for Film Character information. Build our Character database from the data returned.
function getCharacterDatabase() {
  const fieldsToIncl = 'fields=id,name,films';
  const url = baseURL + '/' + endPtPeople + '?' + fieldsToIncl;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      responseJson.forEach(apiRec => {
        let name = apiRec.name;

        for (let i = 0; i < apiRec.films.length; i++) {
          let filmID = apiRec.films[i];
          filmID = filmID.slice(filmID.lastIndexOf('/')+1);
 
          if (CHARACTER_DB.hasOwnProperty(filmID)) {
            CHARACTER_DB[filmID].push(name);
          } else {
            CHARACTER_DB[filmID] = [ name ];
          }
        }
      });
    })
    .catch(err => charDBFetchErr(err.message));    
}

// Button on intro page; brings user to Browse page when clicked.
function btnHndlr_EnterSite() {
  $('.intro-page').on('click', '.enter-site', event => {
    event.preventDefault();
    getFilmDatabase();
    
    if (jQuery.isEmptyObject(CHARACTER_DB)) {
      getCharacterDatabase();
    }
  });
}

// Set up Nav bar link to 'Home' (Intro page).
function navHndlr_BackToHome() {
  $('nav').on('click', '.nav-home', event => {
    event.preventDefault();
    setActiveAppPhase($('.intro-page'));
  });
}

// Set up Nav bar link to 'Back to Browse' (Browse Films page).
function navHndlr_BackToBrowse() {
  $('nav').on('click', '.nav-browse', event => {
    event.preventDefault();
    setActiveAppPhase($('.browse-cards-page'), true);
    if (LASTVIEWED_ID !== "") {
     let elmnt = document.getElementById(LASTVIEWED_ID)
     elmnt.scrollIntoView();
    } else {
      scrollTo(0,0);
    }
  });
}

// Button shown at bottom of 'Details' page. Returns user to 'Browse' page when clicked.
function btnHndlr_BackToBrowse() {
  $('.details-view').on('click', '.back-to-browse-button', event => {
    event.preventDefault();
    setActiveAppPhase($('.browse-cards-page'), true);
    if (LASTVIEWED_ID !== "") {
     let elmnt = document.getElementById(LASTVIEWED_ID)
     elmnt.scrollIntoView();
    } else {
      scrollTo(0,0);
    }
  });
}

// Button shown at the bottom of an individual card that's displayed in the 'Browse' page.
function btnHndlr_LearnMore() {
  $('.card-footer').on('click', '.card-button', event => {
    event.preventDefault();
    let targetID = $(event.target).parents('.card').attr('id');
    renderDetailsView(targetID);
  });
}


function formInit() {
  btnHndlr_EnterSite();
  navHndlr_BackToHome();
  navHndlr_BackToBrowse();
  btnHndlr_BackToBrowse();
}


$(formInit);