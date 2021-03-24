import { LightningElement, wire } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

export default class BoatSearchForm extends LightningElement
{
    selectedBoatTypeId = '';
    
    // Private
    error = undefined;
    
    searchOptions;
    
    // Wire a custom Apex method
    @wire(getBoatTypes)
    boatTypes({ error, data }) {
        if (data) {
            //map acts like a for each loop and it also return us a new array. For each loops dont return us anything 
            //however a map return us a new array. therefore, it is important to use return in map.
            // type here is your temp variable.
            this.searchOptions = data.map((type) => {
                // TODO: complete the logic
                return{
                    label: type.Name,
                    value: type.Id,
                };
        });
        //this unshift is used to make All Types as the first values. Unshift adds values to the begining of the array.
        this.searchOptions.unshift({ label: 'All Types', value: '' });
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }
    
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
      // Create the const searchEvent
      // searchEvent must be the new custom event search
        this.selectedBoatTypeId = event.target.value;
        const searchEvent = new CustomEvent('search',{
            detail: 
            {
                boatTypeId: this.selectedBoatTypeId
            }
        });
      this.dispatchEvent(searchEvent);
    }
}