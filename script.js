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
    getCharacterDatabase();
  });
}


function btnHndlr_BackToBrowse() {
  $('.details-view').on('click', '.back-to-browse-button', event => {
    event.preventDefault();
    setActiveAppPhase($('.browse-cards-page'));
    if (LASTVIEWED_ID !== "") {
     let elmnt = document.getElementById(LASTVIEWED_ID)
     elmnt.scrollIntoView();
    } else {
      scrollTo(0,0);
    }
  });
}


function btnHndlr_LearnMore() {
  $('.card-footer').on('click', '.card-button', event => {
    event.preventDefault();
    let targetID = $(event.target).parents('.card').attr('id');
    renderDetailsView(targetID);
  });
}


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


function renderFilmCard(filmObj, index) {
  let filmID = filmObj.id;
  let filmTitle = filmObj.title;
  let filmRelease = filmObj.release_date;
  
  if (index === 0) {
    $('.app-phase.browse-cards-page').html(`<div class="card" id="${filmID}">\
            <img src="images/${filmID}.jpg" class="card-img-top" alt="${filmTitle}">\
            <p class="card-release-date">(released ${filmRelease})</p>\
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
            <p class="card-release-date">(released ${filmRelease})</p>\
            <div class="card-body">\
              <h5 class="card-title">${filmTitle}</h5>\
            </div>\
            <div class="card-footer">\
              <button class="card-button" type="submit">Learn More</button>\
            </div>\
          </div>`);
  }
}

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
      setActiveAppPhase($('.details-view'));
      scrollTo(0,0);

    } // check for non-existent film object
}


function displayBrowsePage(fetchedFILM_DB) {
  let filmObj;

  FILM_DB = fetchedFILM_DB;
  if (FILM_DB.length > 0 && FILM_DB.some(element2Chk => {
    return Object.keys(element2Chk).length > 0;
  })) {
    FILM_DB.forEach(renderFilmCard);
    btnHndlr_LearnMore();
    setActiveAppPhase($('.browse-cards-page'));
  } else {
    filmDBFetchErr('Retrieved empty film database');
  }
}

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


function formInit() {
  btnHndlr_EnterSite();
  btnHndlr_BackToBrowse();
  
}


$(formInit);