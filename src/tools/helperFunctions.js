
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

  let headers = ['Total Samples', 'Submitter Name', 'Email', 'Sample #', 'Sample Name', 'Qubit Concentration ng/ul', 'Expected Size (bases)', 'Read Count', 'Vector Backbone (optional)', 'Reference Genome', 'Barcode Well Position', 'Barcode Well #', 'Volume Sample (ul)', 'Volume H2O (ul)'];

  let rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let masterPlate = [headers];

  // set up the scaffold of 96 rows
  for (let i = 0; i < 96; i++) {
    let masterPlateRow = Array(headers.length).fill('');
    let plateCol = Math.floor(i / 8) + 1;
    let plateRow = rows[i % 8];
    masterPlateRow[0] = i + 1;
    masterPlateRow[7] = '10000';
    masterPlateRow[10] = `${plateRow}${plateCol}`;
    masterPlate.push(masterPlateRow);
  }
  // console.log(masterPlate);
  return masterPlate;
}

function extractSamples(submission) {
  // toss everything without a sample name
  let samples = submission.samples.slice(17).filter(el => el[4] !== '');
  console.log(samples)
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
// Note: we don't want the samples loading 
function findStartingLocation(plate, sampleSize) {
  let spaceLength = 0;
  let startingLocation = null;

  if (sampleSize >= 8) {
    // just use the next A well, skipping any empties
    for (let i = 1; i < plate.length - 1; i++) {
      if (plate[i][4] === '' && plate[i][10].includes('A')) {
        startingLocation = i;
        console.log(`Adding ${sampleSize} samples @ ${startingLocation}`);
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
        console.log(`Adding ${sampleSize} samples @ ${startingLocation}`);
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
  console.log(allSampleSheets)

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
      console.log(`looking for space for ${samples.length} samples on flow cell #${i + 1}`);
      let currentFlowCell = allSampleSheets[i];

      // is there room for these samples on this flow cell?
      let spaceLeft = currentFlowCell.filter((row) => row[4] === '').length;
      if (spaceLeft - samples.length < 0) {
        if (i === 4) {
          return alert(`There aren't enough empty wells remaining on any flow cells for ${submission.name}`);
        } else {
          continue;
        }
      }

      let startingLocation = findStartingLocation(currentFlowCell, samples.length);

      // couldn't find a place for this sample set - return alert if it's the last flow cell, continue if not
      if (!startingLocation) {
        if (i === 4) {
          return alert(`Could not find a place on any flow cells for this sample set: ${submission.name}`);
        } else {
          continue;
        }
      }

      // grab each sample and insert the needed info 
      samples.forEach((sample, j) => {
        // console.log(sample)
        // add the sample and H20 volumes
        sample[0] = j > 0 ? j : '';
        let volumes = determineVolumes(sample[5]);
        sample[12] = volumes[0];
        sample[13] = volumes[1];

        let thisRow = startingLocation + j;
        sample.forEach((info, k) => {
          currentFlowCell[thisRow][k] = info;
        });


      });

      break;

    }



    // // is there room for this one?
    // let spaceLeft = currentFlowCell.filter((row) => row[4] === '').length;
    // // console.log(`${spaceLeft} wells left ... checking for room`)
    // if (spaceLeft - samples.length < 0) {
    //   return alert(`There isn't enough room for this order: ${submission.name}. Try selecting a different group of orders.`)
    // }

    // let startingLocation = findStartingLocation(currentFlowCell, samples.length);

    // if (!startingLocation) {
    //   return alert(`Could not find a place for this sample set: ${submission.name}`);
    // }

    // // grab each sample and insert the needed info into the currentFlowCell
    // samples.forEach((sample, i) => {
    //   let thisRow = startingLocation + i;

    //   sample.forEach((info, j) => {
    //     currentFlowCell[thisRow][j] = info;
    //   });

    // });

  });



  return allSampleSheets;
}

module.exports = {
  initializeFlowCell,
  makeSampleSheets
}