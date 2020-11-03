import React, {Component} from 'react'
import * as firebase from 'firebase'
import Board from './Board'

class BoardMenu extends Component{
    constructor(props){
        super(props)
        this.state={
            boardlist:{},
            currentBoard:'',
            //data for the 'create new board' menu
            newTitle:'',
            newDesc:'',
            //controls visibility for 'create new board' menu
            newBoardVisible:''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.showNewBoard = this.showNewBoard.bind(this)
        this.hideNewBoard = this.hideNewBoard.bind(this)
        this.getBoard = this.getBoard.bind(this)
    }
    //the board menu displays a list of all boards belonging to the
    //  currently logged in user, and allows the user to select a board
    //  to work with by clicking on its name

    //DEV NOTES
    /*The current problem with boards not switching out after the first one
    is selected comes from the fact that the board component, despite having
    its props changed, isn't actually refreshing to reflect those changes
    in state. find a way to force refresh when a 'select board' button is pressed
    or as a brute force, temporarily de-render the board and just set up a new one
    after a short delay */

    componentDidMount(){
        //get current user
        const user = firebase.auth().currentUser;
        //query the database to retrieve all boards belonging to that user
        const ref = firebase.database().ref().child('boards').orderByChild('userID').equalTo(user.uid)
        ref.on('value',snap =>{
            //and store them in state
            this.setState({
                boardlist: snap.val()
            })
        })
    }

    handleChange(event){
        //change state to match what's written in form
        this.setState(
            {[event.target.id]:event.target.value}
        )
    }
    
    parseButtons(){
        //take the list of boards stored in state and generate a button
        //for each one. clicking the button calls the 'display board' function,
        //which renders a Board Component with that board's unique ID # as a prop
        let result = []
        for(const key in this.state.boardlist){
        result.push(<button onClick={()=>this.getBoard(key)}>{this.state.boardlist[key].title}</button>)
        }
        return result
    }

    getBoard(id){
        this.setState({
            currentBoard:null
        })
        this.forceUpdate()
        this.setState({
            currentBoard:id
        })
    }

    handleSubmit(){
        //get current user's ID
        const user = firebase.auth().currentUser
        //push a new board to the database with a matching ID
        const newTitle = this.state.newTitle
        const newDesc = this.state.newDesc
        const postRef = firebase.database().ref().child('boards')
        postRef.push().set({
            title: newTitle,
            desc: newDesc,
            userID: user.uid
        })
        //reset menu
        this.setState({
            newTitle:'',
            newDesc:''
        })
        //close menu
        this.hideNewBoard();
    }

    showNewBoard(){
        this.setState({
            newBoardVisible:true
        })
    }

    hideNewBoard(){
        this.setState({
            newBoardVisible:false
        })
    }

    newBoard(){
        return(
        <div className="modal-background">
            <div className="modal-window">
                <button onClick={()=>this.hideNewBoard()}>Close</button>
                <form onSubmit={this.handleSubmit}>
                <table><tbody>
                    <tr>
                        <td><label htmlFor='newTitle'>Board Title</label></td>
                        <td><input type='text' value={this.state.newTitle} onChange={this.handleChange} id='newTitle'/></td>
                    </tr>
                    <tr>
                        <td><label htmlFor='newDesc'>Board Description</label></td>
                        <td><input type='text' value={this.state.newDesc} onChange={this.handleChange} id='newDesc'/></td>
                    </tr>
                </tbody></table>
                <input type="submit" value="Create New Board"/>
                </form>
            </div>
        </div>
        )
    }

    render(){
        return(
            <>
            <div className="board-select">
                <h4>Board Menu</h4>
                <button onClick={this.showNewBoard}>Create New Board</button>
                <div className="board-buttons">
                    {this.parseButtons()}
                </div>
            </div>
            {this.state.currentBoard ? <Board key={this.state.currentBoard}id={this.state.currentBoard}/> : <p>Select a board to begin, or create a new one</p>}
            {/* Create New Board Menu */}
            {this.state.newBoardVisible ? this.newBoard() : <></>}
            </>
        )
    }
}

export default BoardMenu