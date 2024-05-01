
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


function initializePlate() {
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

  let samplesInfo = [];
  // toss the info we don't need
  samples.forEach((sample) => {
    let thisSample = sample.slice(0, 10);
    samplesInfo.push(thisSample)
  });
  return samplesInfo;
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

// this function just puts all the submissions together, no matter how many. later, separate into 96 well plates.
function makeSampleSheet(submissions) {
  if (!Array.isArray(submissions)) {
    return;
  }

  // sort by # of samples first
  submissions.sort((a, b) => {
    let aSize = extractSamples(a).length;
    let bSize = extractSamples(b).length;
    return bSize - aSize;
  });

  // console.log('making sample sheet ... ')
  let masterPlate = initializePlate();
  // console.log(masterPlate)

  submissions.forEach((submission) => {
    let samples = extractSamples(submission);

    // is there room for this one?
    let spaceLeft = masterPlate.filter((row) => row[4] === '').length;
    // console.log(`${spaceLeft} wells left ... checking for room`)
    if (spaceLeft - samples.length < 0) {
      return alert(`There isn't enough room for this order: ${submission.name}. Try selecting a different group of orders.`)
    }

    let startingLocation = findStartingLocation(masterPlate, samples.length);

    if (!startingLocation) {
      return alert(`Could not find a place for this sample set: ${submission.name}`);
    }

    // grab each sample and insert the info into the masterPlate
    samples.forEach((sample, i) => {
      let thisRow = startingLocation + i;

      sample.forEach((info, j) => {
        masterPlate[thisRow][j] = info;
      });

    });

  });

  masterPlate.forEach((sample, i) => {
    sample[0] = i > 0 ? i : '';
    let volumes = determineVolumes(sample[5]);
    sample[12] = volumes[0];
    sample[13] = volumes[1];

    // sample[4] != '' && console.log(sample)


  })

  // console.log(masterPlate)

  return masterPlate;
}

module.exports = {
  initializePlate,
  makeSampleSheet
}