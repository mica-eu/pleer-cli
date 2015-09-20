#!/usr/bin/env node

var //dependencias
  pleer    = require('pleer'),
  jsonFile = require('jsonfile'),
  http     = require('http'),
  fs       = require('fs');

var listFile = 'list.json';
var songsDir = process.env.HOME + '/Music/';

var program = require('commander');
program.command('search [terms]').action(actionSearch);
program.command('list [page]').action(actionList);
program.command('download [index]').action(actionDownload);
program.parse(process.argv);

function actionSearch (terms){
  pleer.search(terms, function (err, response) {
    if (err) return console.log('error');
    if (response.tracks.length == 0) return console.log('no results');

    response.tracks.forEach(function (track, i) {
      var index = i < 10 ? ' ' + i : i;
      console.log('%s | %s - %s', index, track.artist, track.track);
    });

    // gravando lista em arquivo para consulta
    jsonFile.writeFileSync(listFile, response);
  });
}

function actionList (){
  var list = jsonFile.readFileSync(listFile);

  list.tracks.forEach(function (track, i) {
    var index = i < 10 ? ' ' + i : i;
    console.log('%s | %s - %s', index, track.artist, track.track);
  });
}

function actionDownload(index){
  var list = jsonFile.readFileSync(listFile);
  var track = list.tracks[index | 0];

  pleer.getUrl(track.track_id, function (err, response) {
    if (err) return console.log('error');
    downloadSongByUrl(response.url, track.artist + ' - ' + track.track);
  });
}

function downloadSongByUrl (url, fileName) {
  console.log('Downloading... %s', fileName);
  var file = fs.createWriteStream(songsDir + fileName + '.mp3');

  http.get(url, function (response) {
    response.pipe(file);
  });
}
