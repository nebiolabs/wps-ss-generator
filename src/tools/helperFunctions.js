
// these will be the ones to try first
const startingLocations = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'];

function initializePlate() {
  console.log('initializing 96 well plate ... ');

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
    let thisSample = sample.slice(1, 10);
    samplesInfo.push(thisSample)
  });
  return samplesInfo;
}

// this function just puts all the submissions together, no matter how many. later, separate into 96 well plates.
function makeSampleSheet(submissions) {
  if (!Array.isArray(submissions)) {
    return;
  }

  // sort by # of samples first
  submissions.sort((a, b) => b - a);

  console.log('making sample sheet ... ')
  let masterPlate = initializePlate();
  // console.log(masterPlate)

  submissions.forEach((submission) => {
    let samples = extractSamples(submission);

    // is there room for this one?
    let spaceLeft = masterPlate.filter((row) => row[4] === '').length;
    console.log(`${spaceLeft} wells left ... checking for room`)
    if (spaceLeft - samples.length < 0) {
      return alert(`There isn't enough room for this order: ${submission.name}. Try selecting a different group of orders.`)
    }

    console.log(samples)
    // where does this sample get added? 
    let startingLocation = 1;
    for (let i = 1; i < masterPlate.length - 1; i++) {
      if (masterPlate[i][4] === '' && masterPlate[i][10].includes('A')) {
        startingLocation = i;
        break;
      }
    }

    console.log(`startingLocation ${startingLocation}`)

    // grab each sample and insert the info into the masterPlate
    samples.forEach((sample, i) => {
      let thisRow = startingLocation + i;

      sample.forEach((info, j) => {
        masterPlate[thisRow][j] = info;
      });

    });

    //   masterPlate[startingLocation][j + 1] = samples[j];

    // console.log(masterPlate)



  });


  console.log(masterPlate)
  return masterPlate;
}

// this function should find empty space in the plate compatible with the # of samples.
// Ex: D5 --> H5 is empty, so can fit <= 5 samples here without jumping to the next empty A well.
// Note: we don't want the samples loading 
// should return array of [ startWell, endWell ]
function findAvailableSpace(plate, samplesLength) {
  let spaceLength = 0;
  let startWell = '';
  let endWell = '';

  for (let i = 0; i < plate.length; i++) {

    if (plate[i][4] === '') {
      // good, this well is empty. keep evaluating

      //only assign startingWell when it is the first empty spot
      if (spaceLength === 0) {
        startWell = plate[i][10];
      }
      spaceLength = spaceLength++;
    } else {
      // bad, this well is occupied. go back to starting values
      spaceLength = 0;
      startWell = '';
    }

    // alright, we have enough space 
    if (spaceLength === samplesLength) {
      endWell = plate[i][10];
      break;
    }
  }

  return [startWell, endWell];
}

module.exports = {
  initializePlate,
  makeSampleSheet
}