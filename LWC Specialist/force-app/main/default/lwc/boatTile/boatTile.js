import { LightningElement,api } from 'lwc';
//Make sure you implement best practices and store these strings in constants called TILE_WRAPPER_SELECTED_CLASS and TILE_WRAPPER_UNSELECTED_CLASS.
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper'; 

export default class BoatTile extends LightningElement {
    //Make sure to use the correct decorators for these attributes.
    @api boat;
    @api selectedBoatId;
    
    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() 
    {
      //return string using background-image:url() that contains image from the boat object
      return `background-image:url(${this.boat.Picture__c})`;
    }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() 
    {
      /*It must change its own class between tile-wrapper selected and tile-wrapperusing the function tileClass(), 
      depending on the value of selectedBoatId*/
      return this.selectedBoatId === this.boat.Id ? TILE_WRAPPER_SELECTED_CLASS : TILE_WRAPPER_UNSELECTED_CLASS;
    }
    
    // Fires event with the Id of the boat that has been selected.
    selectBoat() 
    { 
      //adding it to a custom event named boatselect
      const boatSelect = new CustomEvent("boatselect",{
        detail: 
        {
          //send the correct detail information, assigning boat.Id to boatId
            boatId: this.boat.Id
        }
    });
    this.dispatchEvent(boatSelect);
    }
  }