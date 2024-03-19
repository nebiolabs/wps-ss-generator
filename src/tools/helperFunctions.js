
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
  return masterPlate;
}

function extractSamples(submission) {
  console.log(submission);

  let samples = submission.samples.filter((row) => {
    return row[4] !== '';
  });

  // console.log(samples);
  return samples;
}

function makeSampleSheet(submissions) {
  if (!Array.isArray(submissions)) {
    return;
  }

  console.log('making sample sheet ... ')
  let newPlateSS = initializePlate();

  submissions.forEach((submission) => {
    let samples = extractSamples(submission);
    samples.forEach((sample) => {
      newPlateSS.push(sample);
    });
  });
  console.log(newPlateSS)
  return newPlateSS;
}

module.exports = {
  initializePlate,
  makeSampleSheet
}