
// these will be the ones to try first
const startingLocations = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'];

// this will calculate the sample and water volume for each sample based on the quant
function determineVolumes(quantStr) {
  let volumes = [5, 5]; //use this as a default
  let quant = quantStr.replace(/[^\d.]+/g, "");

  if (quant > 80) {
    volumes = [1, 9];
  } else if (quant > 50) {
    volumes = [2, 8];
  } else if (quant > 30) {
    volumes = [3, 7];
  } else if (quant > 15) {
    volumes = [5, 5];
  } else {
    volumes = [10, 0];
  }
  return volumes;
}


function initializeFlowCell() {
  // console.log('initializing 96 well plate ... ');

  let headers = [['Date Sequenced', ''], ['Flow Cell', ''], ['Available Pores on Flow Cell', ''], ['New or Washed?', ''], ['', ''], ['Total Samples', 'Submitter Name', 'Email', 'Sample #', 'Sample Name', 'Qubit Concentration ng/ul', 'Expected Size (bases)', 'Read Count', 'Vector Backbone (optional)', 'Reference Genome', 'Barcode Well Position', 'Barcode Well #', 'Volume Sample (ul)', 'Volume H2O (ul)']];

  let rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let masterPlate = [];
  headers.forEach(header => masterPlate.push(header));

  // set up the scaffold of 96 rows with defaults
  for (let i = 0; i < 96; i++) {
    let masterPlateRow = Array(headers.length).fill('');
    let plateCol = Math.floor(i / 8) + 1;
    let plateRow = rows[i % 8];
    masterPlateRow[0] = i + 1;
    masterPlateRow[10] = `${plateRow}${plateCol}`;
    masterPlate.push(masterPlateRow);
  }
  // console.log(masterPlate);
  return masterPlate;
}

function extractSamples(submission) {
  // toss everything without a sample name
  let samples = submission.samples.slice(17).filter(el => el[4] !== '');
  let samplesInfo = [];
  // toss the info we don't need
  samples.forEach((sample) => {
    let thisSample = sample.slice(0, 10);
    samplesInfo.push(thisSample)
  });

  // somehow an empty row gets added ... sometimes? filter it out to be sure
  return samplesInfo.filter(sample => sample.length > 1);
}

// this function should find empty space in the plate compatible with the # of samples.
// Ex: D5 --> H5 is empty, so can fit <= 5 samples here without jumping to the next empty A well.
function findStartingLocation(plate, sampleSize) {
  let spaceLength = 0;
  let startingLocation = null;

  if (sampleSize >= 4) {
    // just use the next A well, skipping any empties
    for (let i = 1; i < plate.length - 1; i++) {
      if (plate[i][4] === '' && plate[i][10].includes('A')) {
        console.log(`findStartingLocation says there is room for ${sampleSize} @${i}`)
        startingLocation = i;
        console.log(`Trying to add ${sampleSize} samples @ ${startingLocation}`);
        break;
      }
    }

  } else {
    // small sample set, see if it fits anywhere
    // console.log(`finding space for ${sampleSize} samples ... `)
    for (let i = 0; i < plate.length; i++) {

      if (plate[i][4] === '') {
        // good, this well is empty. keep evaluating
        // console.log(`${plate[i][10]} is empty`);
        // only assign startingLocation when it is the first empty spot
        if (spaceLength === 0) {
          startingLocation = i;
        }
        spaceLength++;
        // console.log(`spaceLength: ${spaceLength}, sampleSize: ${sampleSize}`)
      } else {
        // bad, this well is occupied. go back to starting values
        spaceLength = 0;
        startingLocation = null;
      }

      // alright, we have enough space 
      if (spaceLength === sampleSize) {
        console.log(`Trying to add ${sampleSize} samples @ ${startingLocation}`);
        break;
      }
    }

  }

  return startingLocation;
}

// ######## Notes for handling multiple sample sheets ###########

// start with 5 initialized SS, as above
// loop through the submissions
// loop through the sample sheets, moving to the next if there is no room, etc.
// add when a spot is found
// return array of sample sheets, filtering out the empty ones.

// ########   

// this function just puts all the submissions together, no matter how many. later, separate into 96 well plates.
function makeSampleSheets(submissions) {
  // set up for a maximum of 5 SS, the limit of the GridIon
  let allSampleSheets = [];
  for (let i = 0; i < 5; i++) {
    let plate = initializeFlowCell();
    allSampleSheets.push(plate);
  }

  if (!Array.isArray(submissions)) {
    return;
  }

  // sort by # of samples first
  submissions.sort((a, b) => {
    let aSize = extractSamples(a).length;
    let bSize = extractSamples(b).length;
    return bSize - aSize;
  });

  submissions.forEach((submission) => {
    let samples = extractSamples(submission);

    for (let i = 0; i < allSampleSheets.length; i++) {

      let currentFlowCell = allSampleSheets[i];
      // console.log(`looking for space for ${samples.length} samples on flow cell #${i + 1}`);

      let startingLocation = findStartingLocation(currentFlowCell, samples.length);
      // is there room for these samples on this flow cell?
      let emptyWells = currentFlowCell.slice(startingLocation).filter((row) => row[4] === '');
      let spaceLeft = emptyWells.length;

      if (spaceLeft - samples.length < 0) {
        if (i === 4) {
          return alert(`There aren't enough empty wells remaining on any flow cells for ${submission.name}`);
        } else {
          continue;
        }
      }

      // couldn't find a place for this sample set - return alert if it's the last flow cell, continue if not
      if (!startingLocation) {
        if (i === 4) {
          return alert(`Could not find a place on any flow cells for this sample set: ${submission.name}`);
        } else {
          continue;
        }
      }

      // sometimes users only put their name and email in the first sample, so uses that as a default
      let defaultUser = samples[0][1];
      if (defaultUser === '') {defaultUser = 'name missing'};
      let defaultEmail = samples[0][2];
      if (defaultEmail === '') {defaultEmail = 'email missing'};
      // console.log(defaultEmail, defaultUser)
      let defaults = [
        '', defaultUser, defaultEmail, '', '', '', '5555', '10000', 'unknown', '?', '', '', '', ''
      ]
      console.log(defaults)

      // grab each sample and insert the needed info 
      samples.forEach((sample, j) => {
        console.log(`adding sample ${j}`)

        let thisRow = startingLocation + j;
        sample[0] = startingLocation - 5 + j;      

        // add the sample and H20 volumes
        let volumes = determineVolumes(sample[5]);
        sample[12] = volumes[0];
        sample[13] = volumes[1];

        // and now add all the info to the actual flow cell
        // add default info where it is missing
        sample.forEach((info, k) => {
          
          if (info === '') {
            console.log(`missing info: defaulting to ${defaults[k]}`)
            currentFlowCell[thisRow][k] = defaults[k];
          } else {
            currentFlowCell[thisRow][k] = info;
          }
        });


      });

      break;

    }

  });

  allSampleSheets.filter(sampleSheet => {
    return sampleSheet.slice(1).filter(el => el[4] !== '').length > 0;
  });

  return allSampleSheets;
}

function sum(arr) {
  let total = 0;

  arr.forEach((entry) => {
    let sampleNos = entry["Samples"];
    if (Number.isInteger(sampleNos)) {
      total += sampleNos;
    } else if (typeof (sampleNos) === 'string') {
      let parsedSampleNos = sampleNos.split(',').map(num => Number(num));
      parsedSampleNos.forEach((sample) => {
        if (Number.isInteger(sample)) {
          total += sample;
        }
      });
    }
    console.log(total)

  });
  return total;
}

function getDateString() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }

  return `${year}_${month}_${day}`;
}

module.exports = {
  initializeFlowCell,
  makeSampleSheets,
  getDateString
}