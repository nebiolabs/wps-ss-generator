
// these will be the ones to try first
const startingLocations = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'];

function initializePlate() {
  console.log('initializing 96 well plate ... ');

  let headers = ['Total Samples', 'Submitter Name', 'Email', 'Sample #', 'Sample Name', 'Qubit Concentration ng/ul', 'Expected Size (bases)', 'Read Count', 'Vector Backbone (optional)', 'Reference Genome', 'Barcode Well Position', 'Barcode Well #', 'Volume Sample (ul)', 'Volume H2O (ul)'];

  let cols = [...Array(10).keys()];
  let rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let masterPlate = [headers];

  // set up the scaffold
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

function makeSampleSheet(submissions) {
  if (!Array.isArray(submissions)) {
    return;
  }

  console.log('making sample sheet ... ')
  let masterPlate = initializePlate();
  // console.log(masterPlate)

  submissions.forEach((submission) => {
    let samples = extractSamples(submission);
    console.log(samples)
    // where does this sample get added? 
    let startingLocation = 1;
    for (let i = 1; i < masterPlate.length - 1; i++) {
      if (masterPlate[i][4] === '') {
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

    console.log(masterPlate)



  });


  // console.log(masterPlate)
  return masterPlate;
}

module.exports = {
  initializePlate,
  makeSampleSheet
}