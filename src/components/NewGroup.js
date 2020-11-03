import React, {Component} from 'react'
import * as firebase from 'firebase'
import 'firebase/auth'

class NewGroup extends Component{
    constructor(props){
        super(props)
        this.state={
            title:'',
            caption:'',
            parentID: this.props.parentID,
            otherGroups:[],
            boardID: this.props.boardID
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.parseOtherGroups = this.parseOtherGroups.bind(this)
    }
    ///DEV NOTES
    /* The dropdown menu for selecting a parent group must somehow
    disabled when NewGroup is summoned by a specific group's "new subgroup" button
    In addition, the parent group must be LOCKED to the group that summoned it
    */

    handleChange(event){
        //change state to match what's written in form
        this.setState(
            {[event.target.id]:event.target.value}
        )
    }

    handleSubmit(event){
        //when the form is submitted, push a new Group to the database
        //ensure user is logged in
        event.preventDefault()
        const user = firebase.auth().currentUser;
        if(user===null){
            //if no one is logged in
            alert("you must log in to edit a board")
        }else{
            //if someone is logged in 
            //get data from state
            const newTitle = this.state.title
            const newCaption = this.state.caption
            const newParentID = this.state.parentID
            const newBoardID = this.state.boardID
            //send new data to firebase
            const postRef = firebase.database().ref().child('groups')
            postRef.push().set({
                title:newTitle,
                caption:newCaption,
                parentID:newParentID,
                userID: user.uid,
                boardID: newBoardID
            })
            //reset entry form
            this.setState(
                {title:'',caption:'',parentID:'noParent'}
            )
        }
        if(this.props.closeWindow){
            this.props.closeWindow();
        }
    }

    componentDidMount(){
        //get a list of all the groups on this board
        //so that we can display them in a dropdown menu
        //for choosing this group's parent

        //make sure a user is logged in
        const user = firebase.auth().currentUser;
        if(user!=null){    
            //get roof reference
            const rootRef = firebase.database().ref().child('groups')
            console.log(rootRef)
            //retrieve all groups with matching user ID
            rootRef.orderByChild('boardID').equalTo(this.props.boardID).on('value',snap=>{
                //and put them in an object stored in state
                this.setState({
                    otherGroups: snap.val()
                })
            })
        }//if no user is present, we dont need to do anything

    }

    parseOtherGroups(){
        //start with the default option
        let result = []
        result.push(<option value="noParent">No Parent Group</option>)
        //get the other options
        for(const field in this.state.otherGroups){
            //generate an option with the group's name as its display text
            //and the group's ID as its value
            result.push(<option value={field}>{this.state.otherGroups[field].title}</option>)
        }

        return result
    }

    render(){
        return(
            <>
            {/* form entry for new note,formatted as table */}
            <form onSubmit={this.handleSubmit}>
                <table><tbody>
                    <tr>
                        <td><label htmlFor='title'>Title</label></td>
                        <td><input type='text' value={this.state.title} onChange={this.handleChange} id='title'/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor='caption'>Caption</label></td>
                        <td><input type='text' value={this.state.caption} onChange={this.handleChange} id='caption'/></td>
                    </tr>
                    {/* only display parent group selector if this is the form at the
                    top of the board. otherwise parentID is locked to whichever group
                    has summoned this component */}
                    {this.props.parentID==="noParent" ? 
                    <tr>
                        <td><label htmlFor='parentID'>Select Parent</label></td>
                        <td><select onChange={this.handleChange}id='parentID'>{this.parseOtherGroups()}</select></td>
                    </tr> : <></>}
                </tbody></table>
                <input type="submit" value="Create New Group"/>
            </form>
            </>         
        )
    }
}

export default NewGroup;