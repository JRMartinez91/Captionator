import React, {Component} from 'react'
import * as firebase from 'firebase'
import 'firebase/auth'
import Note from './Note'
import Group from './Group'
import NewNote from './NewNote'
import NewGroup from './NewGroup'

class Board extends Component{
    constructor(props){
        super(props)
        this.state={
            notes:{},
            groups:{},
            id:this.props.id,
            title:'',
            desc:'',
            //visibility of 'edit title/caption' menu
            editVisible: false,
            //text stored in 'edit title/caption' menu
            editedTitle:'',
            editedCaption:''
        }
        this.refreshNotes = this.refreshNotes.bind(this);
        this.parseAllNotes = this.parseAllNotes.bind(this);
        this.formatAll = this.formatAll.bind(this);
        this.showEdit = this.showEdit.bind(this);
        this.hideEdit = this.hideEdit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    ///NOTICE
    ///this function calls all notes/groups belonging to the currently logged in USER
    // and NOT any sort of BOARD. it must be refactored later.

    refreshNotes(){
        console.log("BOARD calling refreshNotes()")
        //check if user is logged in
        const user = firebase.auth().currentUser;
        if(user && this.state.id){
            console.log("user logged in: "+user.displayName)

            /////get database connection for notes and groups
            //////////////

            //get user ID
            //fetch notes with matching boardID
            const ref = firebase.database().ref()
            const noteRef = ref.child('notes')
            noteRef.orderByChild("boardID").equalTo(this.state.id).on('value', snap => {
                //right now this is storing ALL the fields of the note object in state
                //whereas we only the note's personal ID and parent ID
                //there's obviously a way to filter this, just gotta figure it out.
                this.setState({
                    notes: snap.val()
                })
            })
            //fetch groups with matching boardID
            const groupRef = ref.child('groups')
            groupRef.orderByChild("boardID").equalTo(this.state.id).on('value', snap=>{
                this.setState({
                    groups: snap.val()
                })
            })

            ///// get database connection for this board's title and desc.
            /////////////
            const selfRef = ref.child('boards').orderByKey().equalTo(this.state.id)
            selfRef.on('value', snap=>{
                const myTitle = snap.val()[this.state.id].title
                const myDesc = snap.val()[this.state.id].desc
                this.setState({
                    title: myTitle,
                    desc: myDesc
                })
            })

        }else{
            //if there is no user logged in
            console.log("no user detected")
            //empty the board
            this.setState({
                notes:{}
            })
        }
        // console.log(typeof this.state.notes)
        // console.log(this.state.notes)
    }

    componentDidMount(){
        console.log("BOARD mounted")
        if(firebase.auth().currentUser){
            this.refreshNotes();
        }
    }

    handleChange(event){
        this.setState({
            [event.target.id]:event.target.value
        })

    }

    ////////////////////////////////
    // EDIT BOARD TITLE/CAPTION
    ////////////////////////////////

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

    hideEdit(){
        this.setState({
            editVisible:false
        })
    }

    showEdit(){
        this.setState({
            editVisible:true,
            editedCaption: this.state.desc,
            editedTitle: this.state.title
        })
    }

    handleUpdate(){
        //construct update widget
        let newData = {}
        newData['/title/'] = this.state.editedTitle
        newData['/desc/'] = this.state.editedCaption
        //call database for this board's id and update
        firebase.database().ref().child('boards').child(this.state.id).update(newData)
        //close editing window
        this.hideEdit()
    }

    ///////////////////////////////////////

    parseOneNote(noteID){
    //noteObject: an object containing title,caption, and url
    //noteID: the note's unique ID in firebase
    //in this.state.notes, noteID and noteObject are a key-value pair
    //but they are passed to this function as separate arguments
        return(
            <Note id={noteID}/>
        )
    }

    parseAllNotes(){
        //take notes stored in state and render html to display them
        let result=[]
       for(const field in this.state.notes){
           result.push(this.parseOneNote(field))
       }
       console.log("BOARD calling Parse All Notes")
       return result
    }

    parseBoard(){
        //start with an empty block
        let result
        let noteBlock = []
        let groupBlock = []
        //go through the object (NOT ARRAY) of notes stored in state
        //extract the ones with no parent group
        let topLevelNotes = []
        // let otherNotes = []
        for(const key in this.state.notes){
            if(this.state.notes[key].parentID === "noParent" || this.state.notes[key].parentID === null){
                topLevelNotes.push(key)
            }
        }
        //go through the object (NOT ARRAY) of groups stored in state
        //extract the ones with no parent group
        let topLevelGroups = []
        // let otherGroups = []
        for(const key in this.state.groups){
            if(this.state.groups[key].parentID === "noParent"){
                topLevelGroups.push(key)
            }
        }
        //render notes at top level of board
        //passing the database key to each Note Component
        //the Note Component will handle the rest
        for(const item of topLevelNotes){
            noteBlock.push(<Note id={item} boardID={this.state.id}/>)
        }
        //for each remaining group...
        for(const item of topLevelGroups){
            //console.log("board parsing group id")
            //console.log(item)
            if(item){
                groupBlock.push(<Group id={item} parent="noParent" boardID={this.state.id}/>)
            }
        }
        //console.log(result);
        result = (
            <>
            <div className="note-block">{noteBlock}</div>
            <div className="group-block">{groupBlock}</div>
            </>
        )
        return result
    }

    formatAll(formatCode){
        //iterate though this board's notes
        for(const key in this.state.notes){
            //connect to note's location in database
            const ref = firebase.database().ref().child('notes').child(key)
            //check if this note has a 'format' attribute
            if(ref.child('format').getRoot()!==null){
                //if there is, change it.
                ref.update({
                    ['/format/']:formatCode
                })
            }
        }

    }

    render(){
        return(
            <div className="outer-board-box">
                <div className="board-header">
                    <h2>{this.state.title}</h2>
                    <p>{this.state.desc}</p>
                    <div className="menu-bar">
                        <NewNote parentID ="noParent" boardID={this.state.id}/>
                        <NewGroup parentID ="noParent" boardID={this.state.id}/>
                        <div class="format-all-buttons">
                            <p>Format All notes</p>
                            <button onClick={()=>this.formatAll('title-pic-caption')}>Pic Center</button>
                            <button onClick={()=>this.formatAll('pic-title-caption')}>Title Center</button>
                            <button onClick={()=>this.formatAll('title-caption-pic')}>Caption Center</button>
                            <button onClick={()=>this.formatAll('pic-side')}>Side by Side</button>
                        </div>
                        <button onClick={this.showEdit}>Edit Title/Description</button>
                        {this.state.editVisible? this.editingModal() :<></>}
                    </div>
                    <button onClick={this.refreshNotes}>Get Notes</button>
                </div>
                <div className="inner-board-box">
                    {this.parseBoard()}
                </div>
            </div>
        )
    }
}

export default Board