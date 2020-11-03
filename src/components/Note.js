import React, {Component} from 'react'
import * as firebase from 'firebase'

class Note extends Component{
    constructor(props){
        super(props)
        this.state={
            title: '',
            caption:'',
            url:'',
            //data in the edit note form
            editedTitle:'',
            editedCaption:'',
            editedUrl:'',
            //note's unique database id
            id: this.props.id,
            boardID: this.props.boardID,
            //controls the edit menu
            menuVisible:false,
            //controls the deletion warning
            deleteVisible:false,
            //controls the 'move to new group' window
            moveVisible:false,
            //layout
            format:'title-pic-caption',
            //default option for 'move to new group'
            newGroup:'noParent'
        }
        this.handleChange=this.handleChange.bind(this);
        this.handleUpdate=this.handleUpdate.bind(this);
        this.setFormat=this.setFormat.bind(this);
        this.formatNote=this.formatNote.bind(this);
        this.moveNote=this.moveNote.bind(this);
        this.hideMove=this.hideMove.bind(this);
        this.showMove=this.showMove.bind(this);
    }
    ///DEV NOTES
    /// we still haven't connected formatting to firebase

    componentDidMount(){
        //if props have loaded in...
        if(this.props.id){
            //use props data to establish connection
            this.connectToFirebase();
        }
    }

    handleChange(event){
        this.setState(
            {[event.target.id]:event.target.value}
        )
    }

    /////////////////////////////////////////
    /// DATABASE CONNECTION
    //////////////////////////////////////////

    //Dev Notes
    //May be prudent to add a format field to the notes in the database
    connectToFirebase(){
        //get this note's entry in the database
        const rootRef = firebase.database().ref().child('notes').child(this.props.id)
        //get unique refs for its three components
        const titleRef = rootRef.child('title')
        const captionRef = rootRef.child('caption')
        const urlRef = rootRef.child('url')
        //establish connections between database and rendering
        //content
        titleRef.on('value',snap=>{
            this.setState({
                title: snap.val()
            })
        })
        captionRef.on('value',snap=>{
            this.setState({
                caption:snap.val()
            })
        })
        urlRef.on('value',snap=>{
            this.setState({
                url:snap.val()
            })
        })
        //formatting
        //uncomment when all notes have formatting attribute
        
        rootRef.child('format').on('value',snap=>{
            this.setState({
                format:snap.val()
            })
        })
        
    }

    ///////////////////////////////////////
    /// EDIT NOTE CONTENTS
    ///////////////////////////////////////

    editingModal(){
        return(
            <div className="modal-background">
                <div className="modal-window">
                    <button onClick={()=>this.hideMenu()}>Close</button>
                    <p>Edit Note</p>
                    <form onSubmit={this.handleUpdate}><table><tbody>
                        <tr>
                            <td><label htmlFor='editedTitle'>Title</label></td>
                            <td><input type='text' value={this.state.editedTitle} onChange={this.handleChange} id='editedTitle'/></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='editedUrl'>Image URL</label></td>
                            <td><input type='text' value={this.state.editedUrl} onChange={this.handleChange} id='editedUrl'/></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='editedCaption'>Caption</label></td>
                            <td><input type='text' value={this.state.editedCaption} onChange={this.handleChange} id='editedCaption'/></td>
                        </tr>
                    </tbody></table>
                    <input type="submit" value={"Save Changes"}/></form>
                </div>
            </div>
        )
    }

    displayMenu(){
        //just to make sure there's no errors, dont allow this until ID is loaded,
        //same as with connectToFirebase()
        if(this.props.id){
            //values from display content are sent to editable content
            //when the menu is made visible
            this.setState({
                menuVisible:true,
                editedTitle: this.state.title,
                editedCaption:this.state.caption,
                editedUrl:this.state.url
            })
        }
    }

    hideMenu(){
        this.setState({
            menuVisible:false
        })
    }
    
    handleUpdate(event){
        //dont refresh the page
        event.preventDefault()
        //get note's ref
        const rootRef = firebase.database().ref().child('notes').child(this.props.id)
        // construct update widget
        let newData = {}
        newData['/title/'] = this.state.editedTitle;
        newData['/caption/'] = this.state.editedCaption;
        newData['/url/'] = this.state.editedUrl;
        // send update to firebase
        rootRef.update(newData);
        // close editing menu
        this.hideMenu()
    }

    /////////////////////////////////////
    /// DELETING NOTES
    /////////////////////////////////////

    displayDelete(){
        //just to make sure there's no errors, dont allow this until ID is loaded,
        //same as with connectToFirebase()
        if(this.props.id){
            this.setState({
                deleteVisible: true
            })
        }
    }

    hideDelete(){
        this.setState({
            deleteVisible:false
        })
    }

    handleDeletion(){
        firebase.database().ref().child('notes').child(this.props.id).remove();
    }

    deletionModal(){
        return(
            <div className="modal-background">
                <div className="modal-window">
                    <p>Are you sure you want to delete the note</p>
                    <h3>{this.state.title}</h3>
                    <p>Deleted notes cannot be recovered!</p>
                    <div className="delete-button-wrapper">
                        <button onClick={()=>this.hideDelete()}>No</button>
                        <button className="delete-button" onClick={()=>this.handleDeletion()}>Yes</button>
                    </div>

                </div>
            </div>
        )
    }

    //////////////////////////////////////////
    // MOVING NOTES BETWEEN GROUPS
    //////////////////////////////////////////

    moveNote(event){
        //changes parentID to that of another group
        //render a dropdown menu displaying all other groups within this board
        //when submit button on that dropdown form is pressed, make a call to
        //  the database informing it that THIS note whoudl have its parentID
        //  changed to the VALUE of the selected option from the dropdown menu

        //dont refresh page
        event.preventDefault();

        const noteRef = firebase.database().ref().child('notes').child(this.props.id)
        noteRef.update({
            ['/parentID/']:this.state.newGroup
        })
        //reset the dropdown menu
        this.setState({
            newGroup:'noParent'
        })
        this.hideMove()
    }

    //get a list of all the groups on the board, for the 'move note' dropdown menu
    parseOtherGroups(){
        let options = [<option value="noParent">No Group</option>]
        const groupsRef = firebase.database().ref().child('groups').orderByChild('boardID').equalTo(this.props.boardID)
        groupsRef.once('value',snap=>{
            for(const key in snap.val()){
                options.push(
                    <option value={key}>{snap.val()[key].title}</option>
                )
            }
        })
        return options
    }

    moveMenu(){
        //the dropdown menu mentioned in moveNote()
        return(
            <div className="modal-background">
                <div className="modal-window">
                    <h3>Move note to new group</h3>
                    <button onClick={this.hideMove}>Close</button>
                    <form onSubmit={this.moveNote}>
                        <label htmlFor="newGroup">Select Destination Group</label>
                        <select id="newGroup" onChange={this.handleChange}>
                        {/* options for each group on the board */}
                        {this.parseOtherGroups()}
                        </select>
                        <input type="submit" value="Confirm Selection"/>
                    </form>
                </div>
            </div>
        )
    }

    showMove(){
        this.setState({
            moveVisible:true
        })
    }

    hideMove(){
        this.setState({
            moveVisible:false
        })
    }

    //////////////////////////////////////////////
    /// FORMATTING NOTE LAYOUT
    //////////////////////////////////////////////

    formatButtons(){
        //DEV NOTES
        // in the finished project, these buttons will display icons, not text
        //these buttons will also be contained in a popup menu, rather than be displayed
        //by default. however, this popup menu is too small to justify its own modal
        //so instead its visibility is going to controlled with CSS tricks
        return(
            <div className="popup-wrapper">
            {/* hover over the popup-wrapper div to make the formatting-buttons div visible 
            the hover-trigger div is the part of the popup-wrapper that DOESN'T disappear,
            allowing us to user it as a jury-rigged event listener*/}
                <div className="hover-trigger">X</div>
                <div className="formatting-buttons">
                    <button onClick={()=>this.setFormat('title-pic-caption')}>Pic Center</button>
                    <button onClick={()=>this.setFormat('title-caption-pic')}>Caption Center</button>
                    <button onClick={()=>this.setFormat('pic-title-caption')}>Title Center</button>
                    <button onClick={()=>this.setFormat('pic-side')}>Side by Side</button>
                </div>
            </div>
        )
    }

    setFormat(formatCode){
        //change state
        this.setState({
            format: formatCode
        })
        //update database
        const ref = firebase.database().ref().child('notes').child(this.props.id)
        ref.update({
            ['/format/']:formatCode
        })
    }

    formatNote(formatCode){
        //changes the order of title,picture,and caption
        //different formats are hard-coded as separate blocks of html
        //only one is returned when called in render()
        switch(formatCode){
            case 'title-pic-caption':
                return(<>
                <div className="vertical-content">
                    
                    <h3>{this.state.title}</h3>
                    <div className="image-wrapper">
                        <img className="note-image" src={this.state.url} alt={"could not find image at "+this.state.url}/>
                    </div>
                    <p>{this.state.caption}</p>
                </div>
                    </>)
            case 'title-caption-pic':
                return(<>
                <div className="vertical-content">
                    
                    <h3>{this.state.title}</h3>
                    <p>{this.state.caption}</p>
                    <div className="image-wrapper">
                        <img className="note-image" src={this.state.url} alt={"could not find image at "+this.state.url}/>
                    </div>
                </div>
                    </>)
            case 'pic-title-caption':
                return(<>
                <div className="vertical-content">
                    
                    <div className="image-wrapper">
                        <img className="note-image" src={this.state.url} alt={"could not find image at "+this.state.url}/>
                    </div>
                    <h3>{this.state.title}</h3>
                    <p>{this.state.caption}</p>
                </div>
                    </>)
            case 'pic-side':
                return(<>
                    <div className="side-by-side">
                        <div className="image-wrapper">
                            <img className="note-image" src={this.state.url} alt={"could not find image at "+this.state.url}/>
                        </div>
                        <div className="sbs-text-wrapper">
                            <h3>{this.state.title}</h3>
                            <p>{this.state.caption}</p>
                        </div>
                    </div>
                    </>)
            default: //default case is title-pic-caption
                return(<>
                    <h3>{this.state.title}</h3>
                    <div className="image-wrapper">
                        <img className="note-image" src={this.state.url} alt={"could not find image at "+this.state.url}/>
                    </div>
                    <p>{this.state.caption}</p></>) 
        }
    }

    resizeNote(){
        //changes the font size and pic dimensions of a note
        //most of the heavy lifting for this feature is going to be in CSS
        //where a few different classes (i.e. small-note large-note) are going to have
        //specified sizes for title, caption, and pic dimensions
        //the selected size class is printed as a className for the note itself
    }

    /////////////////////
    // RENDERING
    ////////////////////
   
    render(){
        return(
            <>
            <div className="note-box">
                <div className="note-editing">
                    <button onClick={()=>this.displayMenu()}>Edit Note</button>
                    <button onClick={()=>this.displayDelete()}>Delete Note</button>
                    <button onClick={()=>this.showMove()}>Move</button>
                {this.formatButtons()}
                </div>
                {this.formatNote(this.state.format)}
            </div>
            {/* Editing Menu */}
            {this.state.menuVisible ? this.editingModal() : <></>}
            {/* Deletion Warning */}
            {this.state.deleteVisible ? this.deletionModal() : <></>}
            {/* Move Note Menu */}
            {this.state.moveVisible ? this.moveMenu() : <></>}
            </>
        )
    }
}

export default Note