////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                        //
// ===============                                                                                                        //
// PHOENIX (Plume Hazards and Observations of Emissions by Navigating and Interactive eXplorer)                           //
// ===============                                                                                                        //
//                                                                                                                        //
// Date Created: June 1, 2020                                                                                             //    
//                                                                                                                        //
// Brief description:                                                                                                     //
// This tool in GEE shows changes in a select group of pollutants and aerosols for a                                      //    
// user-selected date range or fire, when compared to a baseline map of 2018-2020 levels.                                 // 
// The tool allows users to see fire locations and the resulting anomalous changes in the                                 //
// air quality parameters.                                                                                                //
//                                                                                                                        //
// Required Packages                                                                                                      //
// ===================                                                                                                    //
// * Shapefile for the Study Area                                                                                         //
// * Baseline file of CO within the Study Area                                                                            //    
// * Baseline file of NO2 within the Study Area                                                                           //
// * Baseline file of HCHO within the Study Area                                                                          //
// * Baseline file of AOD within the Study Area                                                                           //
//                                                                                                                        //
//                                                                                                                        //
// Parameters                                                                                                             //
// -------------                                                                                                          //
// In order to run the script press Run and slide the code up so only the map is exposed.                                 //
// If you wish to make a graph click and drag the pin placed on the map.                                                  // 
//                                                                                                                        //
// Contact                                                                                                                //
// ---------                                                                                                              //  
// Name(s): Taylor Orcutt, Ani Matevosian, Danielle Ruffe, Liana Solis                                                    //
// E-mail(s): taylor.orcutt33@berkeley.edu                                                                                   //
//                                                                                                                        //  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Start of Code
Map.addLayer(Study_Area,0,'PNW');
var palettes = require('users/gena/packages:palettes');

//////blank variables to run functions on/////
var date = '2018-12-09';
var startDate; 
var endDate;
var l8startDate;
var l8endDate;
getdaterange(date);
var userDate = '2019-08-05';
var firmsfires;
var firedataset;
var yr = "2018";
var graphD1 = '2018-07-01';
var graphD2 = '2018-11-30';
var datewarning = ("*Formaldehyde data only available starting 2018-12-09");

//___________________________________________Dictionaries_______________________________________//
///////fires dictionary////
var fires = {"Hendrix / Klondike Fires":{date:'2018-08-01', lon:(-122.7059), lat: (42.5806),zoom:8,
            Date: "August 1st 2018", warning: datewarning},
              "Maple Fire": {date: '2018-08-09', lon: (-123.1214), lat: (47.5791), zoom: 8,
            Date: "August 9th 2018", warning: datewarning},
              "Cougar Creek / Cresent Mountain Fires": {date: '2018-08-09', lon: (-120.512), lat: (48.111), zoom: 8,
            Date: "August 9th 2018", warning: datewarning},
              "Williams Flats Fire":{date:'2019-08-05', lon: (-118.3704), lat: (47.9842), zoom:8,
            Date: "August 5th 2019", warning: ""},
              "243 Command Fire":{date:'2019-06-03', lon:(-119.8327), lat: (46.8506), zoom:8,
            Date: "June 3rd 2019", warning: ""},
              "Select Custom Date":{date: userDate, lon:(-121.084), lat:(48.208), zoom:6,
            Date: "", warning: ""}
};

///////pollutant sensor dictionary/////////
var datapulldict = {"Carbon Monoxide (CO)": {band:'COPERNICUS/S5P/OFFL/L3_CO', select:'CO_column_number_density', 
                                            baseline: CO_Baseline, exprtname1: 'CO Differenced', exprtname2: 'Day of CO Levels',
                                            graphtitle: "Max CO levels for July to November", Xaxistitle: "Column Number Density (mol/m^2)"},
                    "Nitrogen Dioxide (NO2)": {band:'COPERNICUS/S5P/OFFL/L3_NO2', select:'NO2_column_number_density', 
                                            baseline: NO2_Baseline, exprtname1: 'NO2 Differenced', exprtname2: 'Day of NO2 Levels',
                                            graphtitle: "Max NO2 levels for July to November", Xaxistitle: "Column Number Density (mol/m^2)"},
                    "Formaldehyde (HCHO)": {band:'COPERNICUS/S5P/OFFL/L3_HCHO', select:'tropospheric_HCHO_column_number_density', 
                                            baseline: HCHO_Baseline, exprtname1:'HCHO Differenced', exprtname2: 'Day of HCHO Levels',
                                            graphtitle: "Max HCHO levels for July to November", Xaxistitle: "Tropospheric Column Number Density (mol/m^2)"},
                    "Aerosol Optical Depth (AOD)": {band:'MODIS/006/MCD19A2_GRANULES', select:'Optical_Depth_047', 
                                            baseline: AOD_Baseline, exprtname1: 'AOD Differenced', exprtname2: 'Day of AOD Levels',
                                            graphtitle: "Max AOD levels for July to November", Xaxistitle: "Optical Depth (047)"},
};
var pollutants = ['Carbon Monoxide (CO)', 'Nitrogen Dioxide (NO2)', 'Formaldehyde (HCHO)', 'Aerosol Optical Depth (AOD)'];
//__________________________________________Set Date___________________________________//

///function to create date ranges for both the pollutants and the landsat imagery///
function getdaterange(date_){
    if(typeof date_ === 'string'){
       startDate = ee.Date(new Date(date_).getTime()).advance(-3,'day');
       l8startDate = ee.Date(new Date(date_).getTime()).advance(-15,'day');
    }else {
      startDate = ee.Date(date_).advance(-3,'day'),
      l8startDate = ee.Date(date_).advance(-15,'day');
    }
    endDate = startDate.advance(7,'day'),
    l8endDate = l8startDate.advance(30,'day');
}
//_______________________________________________________________________________________//


//_____________________________________Landsat___________________________________________//


var trueColorL8 = {bands: ['B4', 'B3', 'B2'], min: 0, max: 4000, gamma: 1.4};
var LC8_BANDS = ['B2',   'B3',    'B4',  'B5',  'B6',    'B7',    'B10'];
var STD_NAMES = ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'temp'];
var landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR");
var srL8 = ee.ImageCollection(landsat8)
    .filterDate('2013-01-01', '2020-06-24')
    .filterBounds(Study_Area);
function cloudSortdate(){
  var cloudSort = srL8.filterDate(l8startDate,l8endDate).sort("CLOUD_COVER",false);
  Map.addLayer(cloudSort, trueColorL8, 'L8 true color');
}

//_______________________________________________________________________________________//



//_________________________________Vizualization Bands____________________________________//

//////Day of Pollutant viz bands/////

var CO_viz = {
  min: 0,
  max: 0.05,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};

var NO2_viz = {
  min: 0,
  max: 0.0002,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};

var HCHO_viz = {
  min: 0.0,
  max: 0.0003,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};

var AOD_viz = {
  min: 0,
  max: 500,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};



////////Difference Viz Palettes/////////
var paletteCO_diff = palettes.matplotlib.magma[7];
var CO_diff_viz = {
  min: 0,
  max: 0.02,
  palette: paletteCO_diff
};
var paletteNO2_diff = palettes.kovesi.linear_kry_5_95_c72[7];
var NO2_diff_viz = {
  min:0,
  max: 0.00008,
  palette: paletteNO2_diff
};
var paletteAOD_diff = palettes.cmocean.Thermal [7];
var AOD_diff_viz = {
  min: 0,
  max: 500,
  palette: paletteAOD_diff
};
var paletteHCHO_diff = palettes.niccoli.cubicl[7];
var HCHO_diff_viz = {
  min: 0,
  max: 0.00028,
  palette: paletteHCHO_diff
};

/////Firms viz band////
var firmsfires_vis = {
  min: 325.0,
  max: 400.0,
  palette: ['22f4e4'],
};
//__________________________________________________________________________//////


/////_______________________________GUI style variables____________________//////

var borderStyle = '3px solid #AE580F';
var subborderStyle = '1px solid #AE580F';
var titlesize = '24px';
var subtitlesize = '12px';
var margins = '0px 10px';
var textcolor = 'black';
var backgroundcolor = '#FFE6D1';
var buttoncolor = 'white';
var buttontextcolor = 'blue';
var selectortext = 'black';
var warningtxtcolor = 'red';

var titlestyle = {fontSize: titlesize, margin: margins,backgroundColor: backgroundcolor, color: textcolor, fontWeight: 'bold'};
var subtitlestyle = {fontSize: subtitlesize , margin: margins, backgroundColor: backgroundcolor, color: textcolor, whiteSpace: 'pre'};
var checkboxstyle = {backgroundColor: backgroundcolor, color: textcolor};
var buttonstyle = {width: '300px', padding: '15px 5px 0px 5px', backgroundColor: backgroundcolor, color: buttontextcolor};
var selectorstyle = {backgroundColor: backgroundcolor, color: selectortext};
var fireselectorstyle = {width: '300px', padding: '15px 5px 0px 5px', backgroundColor: backgroundcolor, color: selectortext};
var panelstyle = {margin: '10px 0px 0px 0px', border: subborderStyle, backgroundColor: backgroundcolor};
var subpanelstyle = {margin: '10px 0px 0px 0px',backgroundColor: backgroundcolor};
var allpanelstyle = {width:'360px', padding: '8px', backgroundColor: backgroundcolor, border: borderStyle};
var warningstyle = {fontSize: '10px', margin: margins,backgroundColor: backgroundcolor, color: warningtxtcolor};
var legendstyle = {fontWeight: 'bold', textAlign: 'center', fontSize: '16px', margin: '0 0 2px 0', padding: '0',   whiteSpace: 'pre'};


//________________________________Panel titles and descriptions__________________________________//
////////Define title and description.///////
var Title = ui.Label('P H O E N I X', {fontWeight: 'bold', fontSize: '40px', margin: margins, color: '#f15500',
                                backgroundColor: backgroundcolor});
var titlesub = ui.Label('(Plume Hazards and Observations of Emissions by Navigating an Interactive eXplorer)', 
                        {fontSize: '14px', margin: margins, backgroundColor: backgroundcolor, color: textcolor});
var subtitle = ui.Label('A tool measuring changes in air quality due to wildfires \nby examining the change in pollutant'
                        + ' and aerosol levels  \naround a user selected date against a pre-determined \n2 year baseline',subtitlestyle);
var datepaneltitle = ui.Label('Select a Fire or Choose a Custom Date', titlestyle);
var pollutantpaneltitle = ui.Label(" Choose Pollutants", titlestyle);

var togglepaneltitle = ui.Label("Toggle Map Layers", titlestyle);
var exportpaneltitle = ui.Label("Export Map Layers",titlestyle);
var exportpanelsubtitle = ui.Label("1. Choose day of levels or differenced data"
                                  + " \n2. Select desired pollutant"
                                  + " \n3. Click 'Export' \n4. Navagate to Tasks panel in the top right of the screen"
                                  + " \n5. Click RUN \n6. Choose your export settings and locations"
                                  + " \n(Data exports as .tiff files)", subtitlestyle);
var footnote = ui.Label("*Chemical pollutant data gathered from Sentinal 5P Tropomi, AOD and FIRMS data gathered from the MODIS" 
                        + " sensor on Aqua and Terra Satallites, true color imagery gathered from Landsat 8", 
                        {fontSize: "8pt", backgroundColor: backgroundcolor});
var graphtitle = ui.Label ("Create Fire Season Graphs",titlestyle);
var graphsubtitle = ui.Label ("1. Click and drag the pin on the map to your interest area \n2. Select a year"
                              + " and desired pollutant \n3. Click 'Generate Graph'", subtitlestyle);
var graphwarning = ui.Label ("*Formaldehyde data does not exists for the 2018 fire season", warningstyle);




//____________________________________Functions___________________________________________________//

//resets all the optional addins
function resetaddins(){
          togglepanel.clear();
          legendpanel.clear();
}
//sets checkboxes back to on/off depending on the box
var setcheckboxes = function(){
  l8checkbox.setValue(1);
  firmscheckbox.setValue(1);
  COdaycheckbox.setValue(0);
  NO2daycheckbox.setValue(0);
  HCHOdaycheckbox.setValue(0);
  AODdaycheckbox.setValue(0);
  COdiffcheckbox.setValue(1);
  NO2diffcheckbox.setValue(1);
  HCHOdiffcheckbox.setValue(1);
  AODdiffcheckbox.setValue(1);
};
//pulls in the map data for selected pollutants
function getData(pollutant){
  var thing = datapulldict[pollutant];
  var image = ee.ImageCollection(thing.band)
  .select(thing.select)
  .filterDate(startDate, endDate)
  .reduce(ee.Reducer.mean());
  return image;
}
//displays the pollutants selected as well as adding their toggle boxes and legends
function DisplayLayers(){
  if (COcheckbox.getValue()===true){
    var COimg = getData('Carbon Monoxide (CO)');
    var CO_diff = COimg.subtract(CO_Baseline);
    Map.addLayer(CO_diff.clip(Study_Area), CO_diff_viz, "ΔCO");
    Map.addLayer(COimg.clip(Study_Area),CO_viz,'CO',0);
    togglepanel.add(COdaycheckbox).add(COdiffcheckbox);
    legendpanel.add(legendCOdiff);
  }
  if (NO2checkbox.getValue()===true){
    var NO2img = getData('Nitrogen Dioxide (NO2)');
    var NO2_diff = NO2img.subtract(NO2_Baseline);
    Map.addLayer(NO2_diff.clip(Study_Area), NO2_diff_viz,"ΔNO2");
    Map.addLayer(NO2img.clip(Study_Area),NO2_viz,'NO2',0);
    togglepanel.add(NO2daycheckbox).add(NO2diffcheckbox);
    legendpanel.add(legendNO2diff);
  }
  if (HCHOcheckbox.getValue()===true){
    var HCHOimg = getData('Formaldehyde (HCHO)');
    var HCHO_diff = HCHOimg.subtract(HCHO_Baseline);
    Map.addLayer(HCHO_diff.clip(Study_Area), HCHO_diff_viz,"ΔHCHO");
    Map.addLayer(HCHOimg.clip(Study_Area),HCHO_viz,'HCHO',0);
    togglepanel.add(HCHOdaycheckbox).add(HCHOdiffcheckbox);
    legendpanel.add(legendHCHOdiff);
  }
  if (AODcheckbox.getValue()===true){
    var AODimg = getData('Aerosol Optical Depth (AOD)');
    var AOD_diff = AODimg.subtract(AOD_Baseline);
    Map.addLayer(AOD_diff.clip(Study_Area), AOD_diff_viz,"ΔAOD");
    Map.addLayer(AODimg.clip(Study_Area),AOD_viz,'AOD',0);
    togglepanel.add(AODdaycheckbox).add(AODdiffcheckbox);
    legendpanel.add(legendAODdiff);
  }
}

///toggle checkbox function///
function toggleViz(name,visibility){
  var filtered = Map.layers().filter(function(element){
    return element.getName() === name;
  });
  filtered[0].setShown(visibility);
}


//resets+adds date and warning to datepanel
function datepaneladd(selected){
  datepanelsub.clear();
  var Date = ui.Label(fires[selected].Date, subtitlestyle);
  var Warning = ui.Label(fires[selected].warning, warningstyle);
  datepanelsub.add(Date).add(Warning);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




///////////////////////////////////GUI Elements/////////////////////////////////////////////////////////////////////////////


////// Generate main panel and add it to the map.//////
var titlepanel = ui.Panel({
  widgets:[
        Title,
        titlesub,
          ],
  style: {margin: '10px 0px 10px 0px',backgroundColor: backgroundcolor},
});
var intropanel = ui.Panel({
  widgets: [
        titlepanel,
        subtitle,
            ],
  style: subpanelstyle,
});


//////////////////////////////////////////////////////////Toggle Checkboxes//////////////////////////////////////////////////////////
///Fires Checkbox
var firmscheckbox = ui.Checkbox({
                    label: 'Show Fires',
                    value: true,
                    style: checkboxstyle
});
firmscheckbox.onChange(function(checked) {
  toggleViz('Fires',checked);
});
//Landsat Checkbox
var l8checkbox = ui.Checkbox({
                  label: 'Display True Color Satellite Imagery',
                  value: true,
                  style: checkboxstyle
});
l8checkbox.onChange(function(checked) {
  toggleViz('L8 true color',checked);
});

///Start of Day of Checkboxes///

//CO day of checkbox
var COdaycheckbox = ui.Checkbox({
                    label: 'Day of CO Levels',
                    value: false,
                    style: checkboxstyle,
                    onChange: function(){
                    if (COdaycheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendCO);
                      legendpanel.widgets().add(legendCO);}
                    else{legendpanel.widgets().remove(legendCO)}
                    },
});
COdaycheckbox.onChange(function(checked) {
  toggleViz('CO',checked);
});
//NO2 day of checkbox
var NO2daycheckbox = ui.Checkbox({
                    label: 'Day of NO2 Levels',
                    value: false,
                    style: checkboxstyle,
                    onChange: function(){
                    if (NO2daycheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendNO2);
                      legendpanel.widgets().add(legendNO2);}
                    else{legendpanel.widgets().remove(legendNO2)}
                    },
});
NO2daycheckbox.onChange(function(checked) {
  toggleViz('NO2',checked);
});
//HCHO day of checkbox
var HCHOdaycheckbox = ui.Checkbox({
                    label: 'Day of HCHO Levels',
                    value: false,
                    style: checkboxstyle,
                    onChange: function(){
                    if (HCHOdaycheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendHCHO);
                      legendpanel.widgets().add(legendHCHO);}
                    else{legendpanel.widgets().remove(legendHCHO)}
                    },
});
HCHOdaycheckbox.onChange(function(checked) {
  toggleViz('HCHO',checked);
});
//AOD day of checkbox
var AODdaycheckbox = ui.Checkbox({
                    label: 'Day of AOD Levels',
                    value: false,
                    style: checkboxstyle,
                    onChange: function(){
                    if (AODdaycheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendAOD);
                      legendpanel.widgets().add(legendAOD);}
                    else{legendpanel.widgets().remove(legendAOD)}
                    },
});
AODdaycheckbox.onChange(function(checked) {
  toggleViz('AOD',checked);
});
///End of day of checkboxes///

///Start of diff checkboxes///
var COdiffcheckbox = ui.Checkbox({
                    label: 'ΔCO Layer',
                    value: true,
                    style: checkboxstyle,
                    onChange: function(){
                    if (COdiffcheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendCOdiff);
                      legendpanel.widgets().add(legendCOdiff);}
                    else{legendpanel.widgets().remove(legendCOdiff)}
                    },
});
COdiffcheckbox.onChange(function(checked) {
  toggleViz('ΔCO',checked);
});
var NO2diffcheckbox = ui.Checkbox({
                    label: 'ΔNO2 Layer',
                    value: true,
                    style: checkboxstyle,
                    onChange: function(){
                    if (NO2diffcheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendNO2diff);
                      legendpanel.widgets().add(legendNO2diff);}
                    else{legendpanel.widgets().remove(legendNO2diff)}
                    },
});
NO2diffcheckbox.onChange(function(checked) {
  toggleViz('ΔNO2',checked);
});
var HCHOdiffcheckbox = ui.Checkbox({
                    label: 'ΔHCHO Layer',
                    value: true,
                    style: checkboxstyle,
                    onChange: function(){
                    if (HCHOdiffcheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendHCHOdiff);
                      legendpanel.widgets().add(legendHCHOdiff);}
                    else{legendpanel.widgets().remove(legendHCHOdiff)}
                    },
});
HCHOdiffcheckbox.onChange(function(checked) {
  toggleViz('ΔHCHO',checked);
});
var AODdiffcheckbox = ui.Checkbox({
                    label: 'ΔAOD Layer',
                    value: true,
                    style: checkboxstyle,
                    onChange: function(){
                    if (AODdiffcheckbox.getValue()===true){
                      legendpanel.widgets().remove(legendAODdiff);
                      legendpanel.widgets().add(legendAODdiff);}
                    else{legendpanel.widgets().remove(legendAODdiff)}
                    },
});
AODdiffcheckbox.onChange(function(checked) {
  toggleViz('ΔAOD',checked);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////date panel//////////////////////////////////////////////////////////////////


/////create fire select///
var fireselect = ui.Select ({
  items: Object.keys(fires),
  placeholder: ('Select a Fire'),
  style: fireselectorstyle,
  onChange: function(selected){
    date = fires[selected].date;
    if (selected == 'Select Custom Date'){
      datepanel.add(dateslider);
    }else {
      datepanel.remove(dateslider);
      getdaterange(date);
    } datepaneladd(selected);
   Map.setCenter(fires[selected].lon, fires[selected].lat, fires[selected].zoom);
  },
});

var datepanelsub = ui.Panel({
    widgets: [
              ],
    style: subpanelstyle
});

////Create variables for the date sliders/////
var dateslider = ui.DateSlider({
  start: '2018-07-01',
  value: '2019-08-06',
  style: {backgroundColor: backgroundcolor},
  onChange: function(datechoice){
    var selectedDate = datechoice.start();
    getdaterange(selectedDate);
  }
});
var datepanel = ui.Panel({
  widgets:[
        datepaneltitle,
        fireselect,
        datepanelsub,
        ],
  style: panelstyle,
});


////////////////////////////////////////////////////Pollutant Panel///////////////////////////////////////////////////////////

////////Creating checkboxes and adding to panel////////
var COcheckbox = ui.Checkbox({
                  label: 'Carbon Monoxide (CO)',
                  style: checkboxstyle
});
var NO2checkbox = ui.Checkbox({
                  label: 'Nitrogen Dioxide (NO2)',
                  style: checkboxstyle
});
var HCHOcheckbox = ui.Checkbox({
                    label: 'Formaldehyde (HCHO)',
                    style: checkboxstyle
});
var AODcheckbox = ui.Checkbox({
                    label: 'Aerosol Optical Depth (AOD)',
                    style: checkboxstyle
});




var addbutton = ui.Button({
  label: "Add to Map",
  style: buttonstyle,
  onClick: function(){
    Map.layers().reset(),
    Map.remove(legendpanel),
    resetaddins();
    Map.addLayer(Study_Area,0,'PNW'),
    togglepanel.add(l8checkbox),
    cloudSortdate(),
    DisplayLayers(),
    firedataset = ee.ImageCollection('FIRMS').filter(ee.Filter.date(startDate, endDate)),
    firmsfires = firedataset.select('T21'),
    Map.addLayer(firmsfires, firmsfires_vis, 'Fires');
    togglepanel.add(firmscheckbox),
    setcheckboxes(),
    Map.add(legendpanel);
  },
});


var checkboxpanel = ui.Panel({
  widgets: [
            pollutantpaneltitle,
            COcheckbox,
            NO2checkbox,
            HCHOcheckbox,
            AODcheckbox,
            addbutton,
            ],
  style: panelstyle,
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////Toggle Panel//////////////////////////////////////////////////////////////

///Create a button that re-centers the map////
var centerbutton = ui.Button({
  label: "Center Map",
  style: buttonstyle,
  onClick: function(){Map.setCenter(-121.084, 48.208,6)}
});
//create panel to hold checkboxes that toggle the map layers///
var togglepanel = ui.Panel({
  widgets: [
            
            ],
  style: {backgroundColor: backgroundcolor},
  layout: ui.Panel.Layout.flow('horizontal',1),
});
//create panel the holds all the toggles, titles, and center button
var displaypanel = ui.Panel({
    widgets: [
              togglepaneltitle,
              togglepanel,
              centerbutton,
              ],
    style: panelstyle,
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////Export Panel///////////////////////////////////////////////////////

//create selector for the choosing day of or change against baseline
var exporttypeselect = ui.Select({
  items: ['Change Against Baseline','Day of Levels'],
  style: selectorstyle,
  placeholder: ('Choose Export Type'),
});
//create selector for which pollutant to export
var exportselect = ui.Select({
  items: pollutants,
  style: selectorstyle,
  placeholder: ('Select a Layer')
});
//create button to export tiff file based on previous selector choices
var exportbutton = ui.Button({
  label: ['Export Map'],
  style: buttonstyle,
  onClick: function(){
    var Will = exportselect.getValue();
    if (exporttypeselect.getValue() == 'Change Against Baseline'){
        Export.image.toDrive({
          image: getData(Will).subtract(datapulldict[Will].baseline),
          description: datapulldict[Will].exprtname1,
          region: Study_Area
        });
    } else if (exporttypeselect.getValue() == 'Day of Levels'){
        Export.image.toDrive({
          image: getData(Will),
          description: datapulldict[Will].exprtname2,
          region: Study_Area
        });
    }
  }
});
//create panel to hold selectors and make them run horizontally
var exportpanelsub = ui.Panel({
  widgets: [
            exporttypeselect,
            exportselect,
            ],
  style: subpanelstyle,
  layout: ui.Panel.Layout.flow('horizontal',1),
});
//create panel to hold selectors and the export button
var exportpanel = ui.Panel({
  widgets: [
        exportpaneltitle,
        exportpanelsubtitle,
        exportpanelsub,
        exportbutton,
        ],
  style: panelstyle,
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//create footnote panel
var footnotepanel = ui.Panel({
  widgets: [
            footnote,
            ],
  style: subpanelstyle,
});





///////////////////////////////////////
//////////Legend//////////////////////
//////////////////////////////////////


//creating legends for all the possible pollutantlevels

/////////CO///////////////
// Create legend title
var legendTitleCO = ui.Label('CO\nmol/m^2', legendstyle);
// create the legend image
var lonCO = ee.Image.pixelLonLat().select('latitude');
var gradientCO = lonCO.multiply((CO_viz.max-CO_viz.min)/100.0).add(CO_viz.min);
var legendImageCO = gradientCO.visualize(CO_viz);


// create thumbnail from the image
var thumbnailCO = ui.Thumbnail({
  image: legendImageCO, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});

// set position of panel
var legendCO = ui.Panel({
  widgets: [
            legendTitleCO,
            ui.Label(CO_viz['max']),
            thumbnailCO,
            ui.Label(CO_viz['min']),
            ],
  style: {padding: '8px 15px'}
});

////////////NO2//////////////
// Create legend title
var legendTitleNO2 = ui.Label('NO2 \nmol/m^2', legendstyle);
// create the legend image
var lonNO2 = ee.Image.pixelLonLat().select('latitude');
var gradientNO2 = lonNO2.multiply((NO2_viz.max-NO2_viz.min)/100.0).add(NO2_viz.min);
var legendImageNO2 = gradientNO2.visualize(NO2_viz);
// create thumbnail from the image
var thumbnailNO2 = ui.Thumbnail({
  image: legendImageNO2, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});
// set position of panel
var legendNO2 = ui.Panel({
  widgets: [
            legendTitleNO2,
            ui.Label(NO2_viz['max']),
            thumbnailNO2,
            ui.Label(NO2_viz['min']),
            ],
  style: {padding: '8px 15px'}
});
////////////AOD//////////////
// Create legend title
var legendTitleAOD = ui.Label('AOD \nN/A', legendstyle);
// create the legend image
var lonAOD = ee.Image.pixelLonLat().select('latitude');
var gradientAOD = lonAOD.multiply((AOD_viz.max-AOD_viz.min)/100.0).add(AOD_viz.min);
var legendImageAOD = gradientAOD.visualize(AOD_viz);
// create thumbnail from the image
var thumbnailAOD = ui.Thumbnail({
  image: legendImageAOD, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});
// set position of panel
var legendAOD = ui.Panel({
  widgets: [
            legendTitleAOD,
            ui.Label(AOD_viz['max']),
            thumbnailAOD,
            ui.Label(AOD_viz['min']),
            ],
  style: {padding: '8px 15px'}
});
////////////HCHO//////////////
// Create legend title
var legendTitleHCHO = ui.Label('HCHO \nmol/m^2', legendstyle);
// create the legend image
var lonHCHO = ee.Image.pixelLonLat().select('latitude');
var gradientHCHO = lonHCHO.multiply((HCHO_viz.max-HCHO_viz.min)/100.0).add(HCHO_viz.min);
var legendImageHCHO = gradientHCHO.visualize(HCHO_viz);
// create thumbnail from the image
var thumbnailHCHO = ui.Thumbnail({
  image: legendImageHCHO, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});
// set position of panel
var legendHCHO = ui.Panel({
  widgets: [
            legendTitleHCHO,
            ui.Label(HCHO_viz['max']),
            thumbnailHCHO,
            ui.Label(HCHO_viz['min']),
            ],
  style: {padding: '8px 15px'}
});
/////////▲CO///////////////
// Create legend title
var legendTitleCOdiff = ui.Label('▲CO \nmol/m^2', legendstyle);
// create the legend image
var lonCOdiff = ee.Image.pixelLonLat().select('latitude');
var gradientCOdiff = lonCOdiff.multiply((CO_diff_viz.max-CO_diff_viz.min)/100.0).add(CO_diff_viz.min);
var legendImageCOdiff = gradientCOdiff.visualize(CO_diff_viz);
// create thumbnail from the image
var thumbnailCOdiff = ui.Thumbnail({
  image: legendImageCOdiff, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});

// set position of panel
var legendCOdiff = ui.Panel({
  widgets: [
            legendTitleCOdiff,
            ui.Label(CO_diff_viz['max']),
            thumbnailCOdiff,
            ui.Label(CO_diff_viz['min']),
            ],
  style: {padding: '8px 15px'}
});

////////////▲NO2//////////////
// Create legend title
var legendTitleNO2diff = ui.Label('▲NO2 \nmol/m^2', legendstyle);
// create the legend image
var lonNO2diff = ee.Image.pixelLonLat().select('latitude');
var gradientNO2diff = lonNO2diff.multiply((NO2_diff_viz.max-NO2_diff_viz.min)/100.0).add(NO2_diff_viz.min);
var legendImageNO2diff = gradientNO2diff.visualize(NO2_diff_viz);
// create thumbnail from the image
var thumbnailNO2diff = ui.Thumbnail({
  image: legendImageNO2diff, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});
// set position of panel
var legendNO2diff = ui.Panel({
  widgets: [
            legendTitleNO2diff,
            ui.Label(NO2_diff_viz['max']),
            thumbnailNO2diff,
            ui.Label(NO2_diff_viz['min']),
            ],
  style: {padding: '8px 15px'}
});
////////////▲AOD//////////////
// Create legend title
var legendTitleAODdiff = ui.Label('▲AOD \nN/A', legendstyle);
// create the legend image
var lonAODdiff = ee.Image.pixelLonLat().select('latitude');
var gradientAODdiff = lonAODdiff.multiply((AOD_diff_viz.max-AOD_diff_viz.min)/100.0).add(AOD_diff_viz.min);
var legendImageAODdiff = gradientAODdiff.visualize(AOD_diff_viz);
// create thumbnail from the image
var thumbnailAODdiff = ui.Thumbnail({
  image: legendImageAODdiff, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});
// set position of panel
var legendAODdiff = ui.Panel({
  widgets: [
            legendTitleAODdiff,
            ui.Label(AOD_diff_viz['max']),
            thumbnailAODdiff,
            ui.Label(AOD_diff_viz['min']),
            ],
  style: {padding: '8px 15px'}
});
////////////▲HCHO//////////////
// Create legend title
var legendTitleHCHOdiff = ui.Label('▲HCHO \nmol/m^2', legendstyle);
// create the legend image
var lonHCHOdiff = ee.Image.pixelLonLat().select('latitude');
var gradientHCHOdiff = lonHCHOdiff.multiply((HCHO_diff_viz.max-HCHO_diff_viz.min)/100.0).add(HCHO_diff_viz.min);
var legendImageHCHOdiff = gradientHCHOdiff.visualize(HCHO_diff_viz);
// create thumbnail from the image
var thumbnailHCHOdiff = ui.Thumbnail({
  image: legendImageHCHOdiff, 
  params: {bbox:'0,0,10,100', dimensions:'20x200',},  
  style: {padding: '1px', position: 'bottom-center'}
});
// set position of panel
var legendHCHOdiff = ui.Panel({
  widgets: [
            legendTitleHCHOdiff,
            ui.Label(HCHO_diff_viz['max']),
            thumbnailHCHOdiff,
            ui.Label(HCHO_diff_viz['min']),
            ],
  style: {padding: '8px 15px'}
});


//create a panel to hold all the potential legends and places it in the bottom right corner of the map
var legendpanel = ui.Panel({
  widgets: [
          ],
  style: {position: 'bottom-right',},
  layout: ui.Panel.Layout.flow('horizontal',1),
});






//////////////////////////////////////////////Chart Generation///////////////////////////////////////////////////


//creates a geometry based on a user placed point//
var geom = geometry.buffer(500);

//// setting the time range ////
var startyearOptions = 2018; //sets earliest year for list of years generated in the dropdown menu
var now = Date.now();
var endyearOptions = ee.Number(ee.Date(now).get('year')); //set last year in the list as the current year

////___ defining function that creates a list of years as strings ___////
var createyearlist = function(){ 
    var numlist = ee.List.sequence(startyearOptions, endyearOptions, 1);
    var totext = numlist.getInfo().map(function(input){
      var a = input.toString();
      return a;
    });
    return totext;
};

///create the list of years for the selection menus ////
var yearlist = createyearlist();
print (yearlist);

//selector for which year the user wants to generate a chart for//
var yrselect = ui.Select({
  items: yearlist,
  placeholder: ('Select a Year'),
  style: selectorstyle,
  onChange: function(yr){
              graphD1 = ee.String(yr).cat('-07-01'),
              graphD2 = ee.String(yr).cat('-11-30');
              if(yr == "2018"){chartsubpanel.add(graphwarning)}
  },
});

//create a function that generates the graph
var makegraph = function(graphimg){
  var Roxy = pollutselect.getValue();
  var thing2 = datapulldict[Roxy];
  var graph = ui.Chart.image.series(graphimg, geom, ee.Reducer.max(), 200)
                .setOptions({
                title: thing2.graphtitle,
                //vAxis: {title: thing2.Xaxistitle},
                //hAxis: {title: 'Time (days)'},
                });
  chartpanel.add(graph);
  };

//create selector for choosing pollutant to graph
var pollutselect = ui.Select({
  items: pollutants,
  style: selectorstyle,
});

//create button that allows user to add their chart
var graphbutton = ui.Button({
  label: 'Generate Graph',
  style: buttonstyle,
  onClick: function(){
    var Al = pollutselect.getValue();
    var thing1 = datapulldict[Al];
    var graphimg = ee.ImageCollection(thing1.band)
    .select(thing1.select)
    .filterDate(graphD1, graphD2);
    return makegraph(graphimg);
  }
});


//create subpanel to hold selectors horizontally
var chartsubpanel = ui.Panel({
  widgets: [
            yrselect,
            pollutselect,
            ],
    style: subpanelstyle,
    layout: ui.Panel.Layout.flow('horizontal',1), 
});
  
//create a panel to hold selectors, chart, and graph
var chartpanel = ui.Panel({
  widgets:[
          graphtitle,
          graphsubtitle,
          chartsubpanel,
          graphbutton,
          ],
  style: panelstyle,
});


////////////////put all panels together into one panel which is the GUI
var Allpanel = ui.Panel({
  widgets: [
        intropanel,
        datepanel,
        checkboxpanel,
        displaypanel,
        exportpanel,
        chartpanel,
        footnotepanel,
        ],
  style: allpanelstyle
});
//adds the gui to the map
ui.root.insert(0,Allpanel);
//centers map over the study area
Map.setCenter(-121.084, 48.208,6);
