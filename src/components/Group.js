import React, {Component} from 'react'
import * as firebase from 'firebase'
import 'firebase/auth'
import Note from './Note'
import NewNotePopup from './NewNotePopup'
import movingWidget from './MovingWidget'

class Group extends Component{
    constructor(props){
        super(props)
        console.log("hello!")
        console.log(this.props)
        this.state={
            //group info
            title:'',
            caption:'',
            id: this.props.id,
            parent: this.props.parent,
            boardID:this.props.boardID,
            //what the group contains
            notes: [], //array of IDs
            subgroups: [], //array of IDs
            //all fields that are blank here
            //will be filled with info from a database query
            //menu visibility
            editVisible: false,
            deleteVisible:false,
            //text in the 'edit' menu
            editedTitle:'',
            editedCaption:''
        }
        this.parseSubgroups = this.parseSubgroups.bind(this)
        this.parseNotes = this.parseNotes.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.displayEdit = this.displayEdit.bind(this)
        this.displayDelete = this.displayDelete.bind(this)
        this.hideEdit = this.hideEdit.bind(this)
        this.hideDelete = this.hideDelete.bind(this)
    }
    //to function properly, the GROUP must be passed three parameters:
    //1) its own firebase ID (to fetch its contents from the database)
    //2) the firebase ID of its parent group (or "noParent")
    //3) the firebase ID of the board it belongs to 

    componentDidMount(){
        if(this.props.id){
            this.connectToDatabase();
        }
        //establish click-and-drag functionality
        movingWidget(document.getElementById(this.state.id));
    }

    handleChange(event){
        this.setState(
            {[event.target.id]:event.target.value}
        )
    }

    connectToDatabase(){
        console.log("Called from Group's CDM"+this.state.id)
        //establish database connections for this group's title, caption, and parent
        const rootRef = firebase.database().ref().child('groups').child(this.state.id)
        const titleRef = rootRef.child('title')
        const captionRef = rootRef.child('caption')
        const parentRef = rootRef.child('parentID')
        titleRef.on('value',snap=>{
            this.setState({title: snap.val()})
        })
        captionRef.on('value',snap=>{
            this.setState({caption: snap.val()})
        })
        parentRef.on('value',snap=>{
            this.setState({parent: snap.val()})
        })
        //establish a weirder database connection for this group's children
        const childNotesRef = firebase.database().ref().child('notes').orderByChild("parentID").equalTo(this.state.id)
        const childGroupsRef = firebase.database().ref().child('groups').orderByChild('parentID').equalTo(this.state.id)
        childNotesRef.on('value', snap=>{
            //snap is an object consisting of notes
            //we must extract their IDs and save those IDs to this.state.notes
            let idArray = []
            for(const key in snap.val()){
                idArray.push(key)
            }
            this.setState({notes:idArray})
        })
        childGroupsRef.on('value', snap=>{
            //snap is an object consisting of groups
            //we must extract their IDs and save those IDs to this.state.groups
            let idArray = []
            for(const key in snap.val()){
                idArray.push(key)
            }
            this.setState({subgroups:idArray})
        })

    }

    ///////////////////////////////////
    /// FORMAT ALL NOTES IN GROUP
    ///////////////////////////////////

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
                    <p>Format all notes in this group</p>
                    <button onClick={()=>this.setNoteFormat('title-pic-caption')}>Pic Center</button>
                    <button onClick={()=>this.setNoteFormat('title-caption-pic')}>Caption Center</button>
                    <button onClick={()=>this.setNoteFormat('pic-title-caption')}>Title Center</button>
                    <button onClick={()=>this.setNoteFormat('pic-side')}>Side by Side</button>
                </div>
            </div>
        )
    }

    setNoteFormat(formatCode){
        //get the list of direct child notes
        for(const key of this.state.notes){
            //make a database call changing their format attribute
            firebase.database().ref().child('notes').child(key).update({
                ['/format/']:formatCode
            })
        }
    }

    /////////////////////////////////

    displayEdit(){
        //just to make sure there's no errors, dont allow this until ID is loaded,
        //same as with connectToFirebase()
        if(this.props.id){
            //values from display content are sent to editable content
            //when the menu is made visible
            this.setState({
                editVisible:true,
                editedTitle: this.state.title,
                editedCaption:this.state.caption,
            })
        }
    }

    hideEdit(){
        this.setState({
            editVisible:false
        })
    }

    handleUpdate(event){
         //dont refresh the page
         event.preventDefault()
         //get group's ref
         const rootRef = firebase.database().ref().child('groups').child(this.props.id)
         // construct update widget
         let newData = {}
         newData['/title/'] = this.state.editedTitle;
         newData['/caption/'] = this.state.editedCaption;
         // send update to firebase
         rootRef.update(newData);
         // close editing menu
         this.hideEdit();
    }

    editingModal(){
        return(
            <div className="modal-background">
                <div className="modal-window">
                <button onClick={()=>this.hideEdit()}>Close</button>
                    <p>Edit Group: {this.state.title ? this.state.title : "no name"}</p>
                    <form onSubmit={this.handleUpdate}><table><tbody>
                        <tr>
                            <td><label htmlFor='editedTitle'>Title</label></td>
                            <td><input type='text' value={this.state.editedTitle} onChange={this.handleChange} id='editedTitle'/></td>
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

    ///DEV NOTES
    /// Deletion not working-- group itself is deleted by some child nodes are remaining in the database
    /// without parent IDs
    // childNodeDive can FIND all the right items-- so the problem is in the process of running the
    // database 'remove' command
    deletionModal(){
        return(
            <div className="modal-background">
                <div className="modal-window">
                    <p>Are you sure you want to delete the group</p>
                    <h3>{this.state.title}</h3>
                    <div className="delete-button-wrapper">
                        <button onClick={this.hideDelete}>Close</button>
                    </div>
                    <div className="delete-button-wrapper">
                        <button className="delete-button" onClick={()=>this.handleDeletion(true)}>Delete Group and ALL contents</button>
                    </div>
                    <div className="delete-button-wrapper">
                        <button className="delete-button" onClick={()=>this.handleDeletion(false)}>Delete Group and move contents to parent group</button>
                    </div>
                </div>
            </div>
        )
    }

    childNodesDive(queryID){
        //start with an empty list
        let deletionSlate = {
            notes:[],
            groups:[]
        }
        //IDs of items slated for deletion will be added to it
        //query the databse for all notes that posess the queryID as their parentID
        const noteRef = firebase.database().ref().child('notes').orderByChild('parentID').equalTo(queryID)
        //if notes appear, add their IDs to the deletion slate
        noteRef.once('value',snap=>{
            for(const key in snap.val()){
                deletionSlate.notes.push(key)
                //change "snap.val()[key].title" back to "key" when done debugging
            }
        })
        //if no notes appear, do nothing
        //query the databse for all groups that posess the queryID as their parentID
        const groupRef = firebase.database().ref().child('groups').orderByChild('parentID').equalTo(queryID)
        //if groups appear, run a childNodesDive on all of their IDs as well
        groupRef.once('value',snap=>{
            for(const key in snap.val()){
                //assemble all the IDs returned by those dives and add them to the deletion slate
                const result = this.childNodesDive(key)
                //add the notes...
                for( const item of result.notes){
                    deletionSlate.notes.push(item)
                }
                //add the subgroups...
                for(const item of result.groups){
                    deletionSlate.groups.push(item)
                }
                //AND the group itself
                deletionSlate.groups.push(key)
                //change "snap.val()[key].title" back to "key" when done debugging

            }
        })
        //if no groups appear, do nothing
        //return an array of all IDs slated for deletion (or an empty array)
        //console.log(deletionSlate)
        return deletionSlate
    }

    reParenting(){
        //find all notes/groups that have THIS GROUP's ID as their parentID
        //and update them so that they have THIS GROUP'S PARENT ID as THEIR parentID as well
        //start with an empty list
        let directChildNotes = []
        let directChildGroups =[]
        //query the database for matches (match's parentID = this group's personal ID)
        const noteRef = firebase.database().ref().child('notes').orderByChild('parentID').equalTo(this.props.id)
        const groupRef = firebase.database().ref().child('groups').orderByChild('parentID').equalTo(this.props.id)
        //assemble a list of the matches' personal IDs
        noteRef.once('value',snap=>{
            for(const key in snap.val()){
                //console.log(snap.val()[key].title)
                directChildNotes.push(key)
            }
        })
        groupRef.once('value',snap=>{
            for(const key in snap.val()){
                directChildGroups.push(key)
            }
        })
        //go through it and run an update on each one, changing
        //  its parentID to THIS GROUP'S PARENT ID
        for(const key of directChildNotes){
            firebase.database().ref().child('notes').child(key).update({parentID:this.props.parent})
        }
        for(const key of directChildGroups){
            firebase.database().ref().child('groups').child(key).update({parentID:this.props.parent})
        }
        // when done, delete this group itself
        firebase.database().ref().child('groups').child(this.props.id).remove()
    }

    handleDeletion(contentsToo){
        //contentsToo
        //  True: Delete group AND all contents
        //  False: Delete group and re-parent all direct children
        //         content to THIS group's parent
        this.hideDelete();

        //this is going to be surprisingly complex...
        if(contentsToo){
            //we must do a deep dive of the database
            //find all items with THIS group's id as their parentID...
            //and then find all items with THOSE group's IDs as their parentIDs...
            //and so on until all our searches turn up empty
            //then we will have a full list (array) of the IDs of items slated for deletion
            const children = this.childNodesDive(this.props.id)
            console.log(children)
            //FUNCTIONAL DELETION CODE
            //delete all descendant nodes
            const noteRef = firebase.database().ref().child('notes')
            for( const note of children.notes){
                noteRef.child(note).remove()
            }
            //delete all descendant groups
            const groupRef = firebase.database().ref().child('groups')
            for( const group of children.groups){
                groupRef.child(group).remove()
            }
            //then delete this group itself
            groupRef.child(this.props.id).remove()
            
            //DEBUGGING CODE
            // const noteRef = firebase.database().ref().child('notes')
            // console.log("listing notes")
            // for( const note of children.notes){
            //     noteRef.child(note).once('value',snap=>{
            //         console.log("note: ",note)
            //         console.log(snap.val().title)
            //     })
            // }
            // //delete all descendant groups
            // console.log("listing subgroups")
            // const groupRef = firebase.database().ref().child('groups')
            // for( const group of children.groups){
            //     groupRef.child(group).once('value',snap=>{
            //         console.log("group: ",group)
            //         console.log(snap.val().title)
            //     })
            // }
            // //then delete this group itself
            // groupRef.child(this.props.id).once('value',snap=>{
            //     console.log("listing self: ", this.props.id)
            //     console.log(snap.val().title)
            // })
            
        }else{
            //find all items with THIS group's id as their parentID
            //and UPDATE all those items such that their parentID is replaced with
            //THIS GROUP'S parentID
            this.reParenting()
        }
    }

    parseNotes(){
        // console.log("calling parseNotes in Group")
        if(this.state.notes.length>0){

            let result =[]
            for(const noteID of this.state.notes){
               // console.log("printing note with id: "+noteID)
                result.push(<Note id={noteID} boardID={this.props.boardID} />)
            }
            return result
        }
    }

    parseSubgroups(){
        if(this.state.subgroups.length>0){
            let result = []
            for(const groupID of this.state.subgroups){
                //to construct the necesary props for each subgroup's Component,
                //  there are a few steps
                //get the group's ID from the list in state
                //use our own ID as the component's ParentID
                result.push(<Group id={groupID} parent={this.state.id} boardID={this.state.boardID}/>)
            }
            return result
        }
    }

    render(){
        
        return(
            <>
            <div className="group" id={this.state.id}>
                <p className="drag-handle">DRAG HERE</p>
                <div className="group-header">
                    <NewNotePopup parentID={this.state.id} boardID={this.state.boardID} groupTitle={this.state.title}/>
                    <button onClick={this.displayEdit}>Edit Group</button>
                    <button onClick={this.displayDelete}>Delete Group</button>
                    {this.formatButtons()}
                    <div className="group-title-box">
                        <h2>{this.state.title}</h2>
                        <p>{this.state.caption}</p>
                    </div>
                </div>
                <div className="group-content">
                    <div className="note-block">
                        {this.parseNotes()}
                    </div>
                    <div className="group-block">
                        {this.parseSubgroups()}
                    </div>
                </div>
            </div>
        {/* modal menus */}
            {/* Editing Menu */}
            {this.state.editVisible ? this.editingModal() : <></>}
            {/* Deletion Warning */}
            {this.state.deleteVisible ? this.deletionModal() : <></>}
            </>
        )
    }
}

export default Group;