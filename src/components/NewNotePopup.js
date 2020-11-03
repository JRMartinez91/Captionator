import React, {Component} from 'react'
// import * as firebase from 'firebase'
import NewGroup from './NewGroup'
import NewNote from './NewNote'

class NewNotePopup extends Component{
    constructor(props){
        super(props)
        this.state={
            noteVisible:false,
            groupVisible:false,
            parentID:this.props.parentID,
            boardID:this.props.boardID,
            groupTitle:this.props.groupTitle
        }
        this.displayGroupModal = this.displayGroupModal.bind(this)
        this.hideGroupModal = this.hideGroupModal.bind(this)
        this.displayNoteModal = this.displayNoteModal.bind(this)
        this.hideNoteModal = this.hideNoteModal.bind(this)
    }
    //the new note popup consists of two parts
    //first, a button that will display in the corner of every group
    //  as well as at the top of the board
    //second, a modal that will appear on screen when the button is clicked
    //the modal will contain a form that allows the user to enter in information
    //  for a new note
    //clicking the button on a group will add the new note to THAT group, specifically
    //whereas clicking the one at the top of the board will add the note to the board,
    //  but not in any group

    //DEV NOTES
    /*Make sure popup closes after a new note/group is created
    */
    displayNoteModal(){
        //make sure note form wont pop up while group form is already there
        if(!this.state.groupVisible){
            this.setState({noteVisible:true})
        }
    }

    hideNoteModal(){
        this.setState({noteVisible:false})
    }

    displayGroupModal(){
        //make sure group form won't pop up while note form is already there
        if(!this.state.noteVisible){
            this.setState({groupVisible:true})
        }
    }

    hideGroupModal(){
        this.setState({groupVisible:false})
    }

    render(){
        return(
            <>
            <div className="corner-button-box">
                <button onClick={()=>this.displayNoteModal()}>New Note</button>
                <button onClick={()=>this.displayGroupModal()}>New Subgroup</button>
            </div>
            {this.state.noteVisible ? <NoteModal myParent={this.state.parentID} myBoard={this.state.boardID} myTitle={this.props.groupTitle} closeWindow={this.hideNoteModal}/> : <></>}
            {this.state.groupVisible ? <GroupModal myParent={this.state.parentID} myBoard={this.state.boardID} myTitle={this.props.groupTitle} closeWindow={this.hideGroupModal}/>: <></>}
            </>
        )
    }
}

//the modal form itself is stored in a functional component
//  separate from the class. Because it is a separate component,
//  we may arrange the class's render function so that the modal form
//  is added and removed from the page whenever we want, rather than
//  every group having its own little form lying in wait, invisible, and
//  taking up processing power.
function NoteModal(props){
    return(
        <div className="modal-background">
            <div className="modal-window">
                <button onClick={props.closeWindow}>Close</button>
                <p>Add new note to {props.myTitle}</p>
                <NewNote closeWindow={props.closeWindow} parentID={props.myParent} boardID={props.myBoard}/>
            </div>
        </div>
    )
}

function GroupModal(props){
    return(
        <div className="modal-background">
            <div className="modal-window">
                <button onClick={props.closeWindow}>Close</button>
                <p>Add new subgroup to {props.myTitle}</p>
                <NewGroup closeWindow={props.closeWindow} parentID={props.myParent} boardID={props.myBoard}/>
            </div>
        </div>
    )
}

export default NewNotePopup;