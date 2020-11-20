var ORGANIZER_INDEX = 9;

function runEmailExport() {
  Logger.log('Beginning runEmailExport()');
  SpreadsheetApp.getActive().getRange('Control Panel!B18').setValue((new Date()).toString());
  SpreadsheetApp.getActive().getRange('Control Panel!B19').setValue("Running");
  try {
    orgs = getOrgs(); //returns array of organizers
    var data = splitOrgData(orgs);
    headers = SpreadsheetApp.getActive().getRangeByName('Volunteer Output!A1:J1').getValues()[0];
    Object.entries(data).forEach(sendEmailForOrg);
    SpreadsheetApp.getActive().getRange('Control Panel!B19').setValue('Success');
  }
  catch(err) {
    SpreadsheetApp.getActive().getRange('Control Panel!B19').setValue('Error');
    throw(err);
    }
  Logger.log('END');
}


function getOrgs() {
  //gets a list of organizers from the organizer_list sheet
  Logger.log('getOrgs START');
  var rangeName = 'organizer_list!A2:A';
  var values = SpreadsheetApp.getActive().getRangeByName(rangeName).getValues();
  if(!values) {
    Logger.log('Something went wrong, null organizers');
  }
  ret = values.flat().filter(x => x!='');
  Logger.log('getOrgs END, %s found', ret.length);

  return ret;
}

function splitOrgData(orgs) {
  Logger.log("splitOrgData START");
  var ss =  SpreadsheetApp.getActiveSpreadsheet();
  var rangeName = 'Volunteer Output!A2:J';
  
  var ret = {'alexa.king@digidems.com' : [],
             'heather.ward@2020victory.com' : []};
  
  orgs.forEach((org) => {ret[org] = []});
  
  var data = ss.getRange(rangeName).getValues();
  for(var i = 0; i < data.length; i++) {
    row = data[i];
    var org = row[ORGANIZER_INDEX];
    if (!org || org=='') {continue;} 
    else if (org=='Not in VAN') {org = 'alexa.king@digidems.com';}
    try {
      ret[org].push(row);
    }
    catch(err) {
      Logger.log("ERROR at data[%s], row %s, org %s", i, row, org);
      Logger.log("%s: %s", err.name, err.message);
      throw(err);
    }
  }
  Logger.log("splitOrgData END");

  return ret;
}

function sendEmailForOrg(entry) {
  //creates a report and sends a personalized email for each organizer with records
  const [org, records] = entry;
  
  if(!records[0]) {
    Logger.log("No records found for org %s", org);
    return;
  }
  
  Logger.log("sendEmailForOrg START %s", org);

  html = [];
  html.push('<div style="text-align:center;display: inline-block;font-family: arial,sans,sans-serif">');
  html.push('<H1> Dialer Volunteer Report </H1>');
  html.push('<H2> Automatically generated for '+org+'</H2>');
  createHtmlTable(records, html);
  html.push('</div>');
  
  body = html.join('\n')
//Commenting this out to avoid accidental sends!
MailApp.sendEmail(org, 'Dialer report', "Requires HTML", {htmlBody:body});
  Logger.log("sendEmailForOrg END");

}


function createHtmlTable(records, html) {
  html.push('<table style="font-size: 10px; border:1px solid black;border-collapse:collapse;text-align:center" border = 1 cellpadding = 1>');
  html.push('<tr>');
  for(col = 1; col < headers.length-1; col++) {
    html.push('<th style="color: white; background-color: blue">' + headers[col] + '</th>');
  }
  html.push('</tr>');
  for(row=0;row<records.length;row++) {
    html.push('<tr>');
    for (col=1;col<records[0].length-1;col++) {
      let val = records[row][col];
      
      
      if(col == 5) {val = parseFloat(val).toFixed(2);}
      if(col > 5) {val = (parseFloat(val)*100).toFixed(2)+ '%';}
      
      html.push('<td>' + val + '</td>');
    }
    html.push('</tr>');
  }
  html.push ('</table>');
}
