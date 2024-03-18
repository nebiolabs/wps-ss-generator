
function initializePlate() {
  console.log('initializing 96 well plate ... ');

  let headers = ['Total Samples', 'Submitter Name', 'Email', 'Sample #', 'Sample Name', 'Qubit Concentration ng/ul', 'Expected Size (bases)', 'Read Count', 'Vector Backbone (optional)', 'Reference Genome', 'Barcode Well Position', 'Barcode Well #', 'Volume Sample (ul)', 'Volume H2O (ul)'];

}

function makeSampleSheet() {
  console.log('making sample sheet ... ')
}

module.exports = {
  initializePlate,
  makeSampleSheet
}