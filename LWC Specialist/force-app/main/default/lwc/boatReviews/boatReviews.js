import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
// imports
export default class BoatReviews extends NavigationMixin(LightningElement) 
{
    // Private
    boatId;
    error;
    boatReviews;
    isLoading = false;

    // Getter and Setter to allow for logic to run on recordId change
    @api get recordId() 
    { 
        return this.boatId;
    }
    set recordId(value) 
    {
        //sets boatId attribute
        this.setAttribute('boatId', value);
        //sets boatId assignment
        this.boatId = value;
        //get reviews associated with boatIdS
        this.getReviews();
    }

    // Getter to determine if there are reviews to display
    get reviewsToShow() 
    { 
        if (this.boatReviews && this.boatReviews.length > 0) {
            return true;
        } 
            return false;
        
    }

    // Public method to force a refresh of the reviews invoking getReviews
    @api refresh() 
    {
        this.getReviews();
    }

    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() 
    {
        if (!this.boatId) {
            return
        }
        this.isLoading = true;
        getAllReviews({boatId: this.boatId})
            .then(result => {
                this.boatReviews = result;
                this.error = 'undefined';
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                this.boatReviews = 'undefined';
            });
    }

    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) 
    {  
        event.preventDefault();       
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes:
            {
                recordId: event.target.dataset.recordId,
                objectApiName:'User',
                actionName: 'view'
            }
        });
    }
}
  