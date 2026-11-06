/**
 * Creates the "Xpressions | Register my interest" Google Form and prints the
 * values to paste into site.js (settings.googleForm and settings.interestFormUrl).
 *
 * How to use:
 * 1. Go to https://script.google.com and click New project.
 * 2. Delete the sample code, paste this whole file, and click Save.
 * 3. Choose createXpressionsForm in the function menu and click Run.
 *    Allow the permissions it asks for (it only creates a form in your Drive).
 * 4. Open View > Logs (or Execution log) and copy the printed block into site.js.
 */
function createXpressionsForm() {
  // Keep these names identical to the events in site.js
  var events = {
    'Compete': ['Board Room', 'J.O.A.T.', 'XIMB MUN', 'Xigabytes', 'Maxim Mela'],
    'Perform': ['Rap It Up', 'Decibelz', 'Nukkad Natak'],
    'Watch': ['Sunburn Campus'],
    'Give back': ['X-Athon', 'Vriddhi']
  };
  var all = [];
  Object.keys(events).forEach(function (k) { all = all.concat(events[k]); });

  var form = FormApp.create('Xpressions | Register my interest');
  form.setDescription('Tell us which Xpressions events you would like to take part in or attend. ' +
    'Submitting interest does not confirm entry or participation.');
  form.setConfirmationMessage('Your interest has been recorded. This does not confirm entry or participation.');
  form.setCollectEmail(false);

  var name = form.addTextItem().setTitle('Name').setRequired(true);
  var email = form.addTextItem().setTitle('Email').setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  var college = form.addTextItem().setTitle('College or organisation').setRequired(true);
  var picks = form.addCheckboxItem().setTitle('Events I am interested in').setRequired(true)
    .setChoiceValues(all);
  var sides = form.addCheckboxItem().setTitle('Sides (filled automatically by the website)')
    .setChoiceValues(Object.keys(events));

  // Build a prefilled link to read each question's entry ID
  var r = form.createResponse()
    .withItemResponse(name.createResponse('n'))
    .withItemResponse(email.createResponse('e@x.in'))
    .withItemResponse(college.createResponse('c'))
    .withItemResponse(picks.createResponse([all[0]]))
    .withItemResponse(sides.createResponse(['Compete']));
  var ids = r.toPrefilledUrl().match(/entry\.\d+/g);

  var action = form.getPublishedUrl().replace(/\/viewform.*$/, '/formResponse');
  Logger.log([
    'Paste this into site.js:',
    '',
    "  interestFormUrl: '" + form.getPublishedUrl() + "',",
    '  googleForm: {',
    "    action: '" + action + "',",
    "    fields: { name: '" + ids[0] + "', email: '" + ids[1] + "', college: '" + ids[2] + "', interests: '" + ids[3] + "', sides: '" + ids[4] + "' },",
    '  },',
    '',
    'Responses sheet: open the form > Responses > Link to Sheets.',
    'Edit form: ' + form.getEditUrl()
  ].join('\n'));
}
