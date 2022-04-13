READ ME
===============
PHOENIX (Plume Hazards and Observations of Emissions by Navigating an Interactive eXplorer)


===============


Date Created: June 2020
===============
Brief description: 
This tool in GEE shows changes in a select group of pollutants and aerosols for a user-selected date range or fire, when compared to a baseline map of 2018-2020 levels. The tool allows users to see fire locations and the resulting anomalous changes in the air quality parameters.
 Required Packages
===================
* No extra software or packages required, just the 5 assets listed in next section titled “Required to run code.”


Brief description: This tool in GEE shows changes in a select group of pollutants and aerosols for a user-selected date range or fire, when compared to a baseline map of 2018-2020 levels. The tool allows users to see fire locations and the resulting anomalous changes in the air quality parameters.
---------


Authors: Taylor Orcutt, Ani Matevosian; Collaborators/Team members: Danielle Ruffe and Liana Solis


Contact(s): Taylor Orcutt, taylor.orcutt33@berkeley.edu; Ani Matevosian, amatevosian@berkeley.edu
============================
Required to run code: 
* Google Earth Engine API in Javascript 
* Shapefile for the Pacific Northwest Study Area 
* 4 baseline map files
   * NO2 Baseline Map
   * CO Baseline Map
   * HCHO Baseline Map
   * AOD Baseline Map 




Introduction: 
The motivation for creating this software was the increasing wildfire presence in the Pacific Northwest region, and the subsequent impact on air quality due to the smoke. Smoke in the atmosphere affects the composition of gases in the atmosphere, visibility, air quality, and is associated with negative health effects. For these reasons, we wanted to create a public-facing tool to visualize how the presence of a select group of pollutants (carbon monoxide, nitrogen dioxide, formaldehyde, and aerosol optical depth as indicators)change due to wildfires. The tool will specifically allow custom visualizations of the change in air quality (by looking at 4 specific pollutants) after a fire event to inform and enhance the user’s understanding of the impact wildfire smoke in this region. The tool also shows true color LANDSAT imagery for user selected dates, with a layer that highlights where the smoke is, offering a different visualization of where wildfire smoke is. Lastly, the creation of this tool was motivated by the spatially, limited locations of ground-based air quality monitoring stations; the tool uses satellite data to address this issue and supplement air quality research in regions where ground-based monitoring stations may be lacking (e.g. in Eastern Washington).


Applications and Scope: 
The software will be provided to end-users as a web-based tool for use of visualization of smoke pollutants in the Pacific Northwest Region (Washington, Oregon, and southern British Columbia). The Puget Sound Clean Air Agency and The Nature Conservancy Washington Chapter may use the tool internally and/or share it with their network, if desired, to learn about changes in air quality due to specific fires. The users may also use the tool for exporting MODIS and TROPOMI satellite sensor-derived data and/or the output “change” maps. Users may also select a pollutant, a location, and a year to generate time-series graphs of the pollutant concentrations for a fire season.


Capabilities:
 This software uses satellite data to visualize how pollutant concentrations have changed after fire events. This Google Earth Engine tool allows the user to select a fire event, or a custom date, and several pollutants, then the software runs a difference between that selected date/event and a 2 year averaged baseline map (for that selected pollutant). Along with these maps showing change in air quality, the tool displays true color LANDSAT 8 imagery to see images of smoke and plumes. Lastly, the tool can generate time-series graphs for user-selected pollutants for the  2018, 2019, and 2020 fire seasons (July to November); the time-series graphs are created for a user-selected point, from which a 500 meter buffer is created. 
Currently a large proportion of air quality data is observed and measured using ground-based monitoring stations, so this tool can fill in gaps where areas lack monitoring stations; with this tool, communities will have access to historical/recent air quality data over their area. Also, the tool provides analyses that may show areas more affected by smoke or poor air quality due to fires. This tool can also supplement current ongoing research on wildfire smoke by providing data for recent changes in air quality after specific fire events.




Interfaces: 
The software uses JavaScript in the Google Earth Engine API. The user interfaces with the GUI in Google Earth Engine to select their preferred parameters (pre-selected fire event or custom date, pollutant type, historical fire locations). The user may also edit the JavaScript code that is displayed by default in the Google Earth Engine interface. The code relies on baseline image maps for AOD, nitrogen dioxide, carbon monoxide, and formaldehyde, as well as a shapefile for the Pacific Northwest study area. These can be imported as assets in Google Earth Engine.


Assumptions, Limitations, & Errors: 
The limitations include the differencing operation being based off of a baseline map which is an average for only 2 years (2018-2020). This decision was due to data availability as Sentinel data only dates back to 2018. Furthermore, there are some data gaps in MODIS Aerosol Optical Depth data due to the nature of satellite data and Terra/Aqua’s orbiting path. The tool currently only works for the Pacific Northwest region, as the data is filtered and bounded by a shapefile which is pre-uploaded into the tool, however with some edits the user can replace it with a different geometry.
========================
How To Use PHOENIX:
1. Select a fire OR choose a custom date (the tool will create an average of the values for a 7 day date range for this fire or date, due to limitations of satellite data and to get an average/ambient value for that date range)
2. Choose a pollutant: Check the boxes for desired pollutant(s) 
   1. Carbon Monoxide (CO)
   2. Nitrogen Dioxide (NO2)
   3. Formaldehyde (HCHO)
   4. Aerosol Optical Depth (AOD)
3. Click “Add to Map” button
4. Toggle Map Layers - check and uncheck the boxes to display desired layers. Options include:
   1. the true color satellite imagery to see the actual images and plumes
   2. the selected pollutant levels for the selected day or fire (note this is the aforementioned 7 day average surrounding that selected day or fire event)
   3. “Δ[selected pollutant]” is the difference between the fire event/selected day AND the a baseline map which represents the typical conditions (averages for 2018-2020).
   4. “Show Fires” to display locations of fires for the dates chosen
5. Export Map Layers - follow instructions in panel. Click ‘Export’, navigate to Tasks panel in top right corner, click ‘Run’, and choose export settings (exports as .tiff which can be imported into other programs like Esri ArcGIS Pro).
6. Create Fire Season Graphs
   1. Drag and move the pin from Seattle to an area of interest (a 500 meter buffer around this point will be created)
   2. Select Year from dropdown
   3. Select pollutant
   4. Click “Generate Graph” - displays maximum values for the selected pollutant and year in mol/m^2
========================
