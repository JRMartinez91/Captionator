// import { auth } from 'firebase'
import React, {Component} from 'react'
import * as firebase from 'firebase'
import 'firebase/auth'

////Development Note
///// something's going wrong-- groups are appearing on the page as soon as they're created,
///// but notes dont appear until the page is refreshed

class NewNote extends Component{
    constructor(props){
        super(props)
        this.state={
            title:'',
            url:'',
            caption:'',
            parentID: this.props.parentID,
            boardID: this.props.boardID
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event){
        //change state to match what's written in form
        this.setState(
            {[event.target.id]:event.target.value}
        )
    }

    handleSubmit(event){
        event.preventDefault()
        const user = firebase.auth().currentUser;
        if (user === null){
            //if no one is logged in
            alert("you must log in to create a note");
        }else{
            //get data from state
            const newTitle = this.state.title
            const newUrl = this.state.url
            const newCaption = this.state.caption
            const newParentID = this.state.parentID
            const newBoardID = this.state.boardID
            //send new data from this.state to firebase
            const postRef = firebase.database().ref().child('notes');
            postRef.push().set({
                title: newTitle,
                url: newUrl,
                caption: newCaption,
                userID: user.uid,
                parentID: newParentID,
                boardID: newBoardID,
                format:'title-pic-caption' //always the default
            })
            //find a way to check if posting was successful???
            //future feature: "Are you sure" popup that displays preview of note
            //after data has been sent, reset entry form
            this.setState(
                {title:'',url:'',caption:''}
            )
        }
        if(this.props.closeWindow){
            this.props.closeWindow();
        }
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
                        <td><label htmlFor='url'>Image URL</label></td>
                        <td><input type='text' value={this.state.url} onChange={this.handleChange} id='url'/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor='caption'>Caption</label></td>
                        <td><input type='text' value={this.state.caption} onChange={this.handleChange} id='caption'/></td>
                    </tr>
                </tbody></table>
                <input type="submit" value="Create New Note"/>
            </form>
            </>
        )
    }
}

export default NewNote