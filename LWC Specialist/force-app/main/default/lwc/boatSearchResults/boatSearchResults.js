import { LightningElement, wire, api } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const SUCCESS_TITLE     = 'Success';
const MESSAGE_SHIP_IT   = 'Ship it!';
const SUCCESS_VARIANT   = 'success';
const ERROR_TITLE       = 'Error';
const ERROR_VARIANT     = 'error';

const COLS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true }];

export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = COLS;
    boatTypeId = '';
    boats;
    draftValues = [];
    /** Wired Apex result so it can be refreshed programmatically */
    errors;
    isLoading = false;
    
    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method 
    /*gets the data returned by getBoats(), which stores the search results in a 
    component attribute boats through a wired function called wiredBoats()*/
    @wire(getBoats,{boatTypeId: '$boatTypeId'})
    wiredBoats(result) 
    {
        this.boats = result;
        if(result.data)
        {
            this.boats = result;
            this.errors = undefined;
        }
        else if(result.error)
        {
            this.errors = result.error;
            this.boats = undefined;
        }
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }
    
    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api searchBoats(boatTypeId) 
    { 
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }
    
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) 
    { 
        // update the information about the currently selected boat Id based on the event.
        //get the boatId that you are passing in boat tile component an store it in selectedBoatId 
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }
    
    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) 
    { 
        // explicitly pass boatId to the parameter recordId
        publish(this.messageContext,BOATMC,{
            recordId: boatId
        });
    }
    
    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) 
    {
        // notify loading
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        //When you edit multiple rows, event.detail.draftValues stores the edited field values and the record Id as an array of objects.
        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        updateBoatList({data: updatedFields})
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            // Clear all draft values in the datatable
            this.draftValues = [];
            // Display fresh data in the datatable
            this.refresh();
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        })
        .finally(() => {

        });
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api async refresh() 
    {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        console.log('refresh complete');
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }
    
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) 
    { 
        if(isLoading)
        {
            this.dispatchEvent(new CustomEvent('loading'));
        }
        else
        {
            this.dispatchEvent(new CustomEvent('doneloading'));
        }
    }
}