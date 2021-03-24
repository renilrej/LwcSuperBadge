import { LightningElement, wire, api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement 
{
    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    isRendered;
    latitude;
    longitude;

    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation,{latitude:'$latitude',longitude:'$longitude',boatTypeId:'$boatTypeId'})
    wiredBoatsJSON({error, data}) 
    {
      if(data)
      {
          this.createMapMarkers(data);
      }
      else if(error)
      {
        this.dispatchEvent(
            new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.body.message,
                variant: ERROR_VARIANT
            })
        );
      }
      this.isLoading = false;  
    }

    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() 
    { 
        if(this.isRendered === false)
        {
            this.getLocationFromBrowser();
        }
        this.isRendered = true; 
    }

    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() 
    { 
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition((position) => {

                // Get the Latitude and Longitude from Geolocation API
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                
                // Add Latitude and Longitude to the markers list. This was commented because, this was copied from an example.
                /*this.mapMarkers = [{
                    location : {
                        Latitude: this.latitude,
                        Longitude : this.longitude
                    },
                    title : LABEL_YOU_ARE_HERE
                }];*/
                //this.zoomlevel = "4";
            });
        }
    }

    // Creates the map markers
    createMapMarkers(boatData) {
        //The marker on that list must be generated from the boatData parameter. 
        //For each marker, the title must be the boat name, and the marker must have the boat’s latitude and longitude
        this.mapMarkers = boatData.map(boat => {
            return{
                location : {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude : boat.Geolocation__Longitude__s
                },
                title : boat.Name,
            };
        });
        //The marker in mapMarkers must have the current user’s latitude and longitude. 
        //Use the constants LABEL_YOU_ARE_HERE for the title, and ICON_STANDARD_USER for the icon.
        this.mapMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
                },
                title: LABEL_YOU_ARE_HERE,
                icon: ICON_STANDARD_USER
        });
        this.isLoading = false;
    }
}