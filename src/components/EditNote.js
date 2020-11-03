import React,{Component} from'react'

////DEV NOTE
/* It'd probably be better just to make ALL THIS a PART of the NOTE COMPONENT
so we'd have all the information in its STATE ready at hand without having to
send it through props,state, and props again*/


class EditNote extends Component{
    constructor(props){
        super(props)
        this.state={
            menuVisible:false,
            targetTitle: this.props.title,
            targetCaption: this.props.caption,
            targetURL: this.props.url,
            targetID: this.props.id,
        }
        this.displayMenu = this.displayMenu.bind(this)
        this.hideMenu = this.hideMenu.bind(this)
    }
    /// EditNote will receive a note's ID, title, caption, and URL from its
    // Parent Note (this component will be summoned by the Note Component and
    // displayed in a modal or popup)
    /// Contain a form to edit the latter three
    /// and send a message to firebase to update the note with new content
    displayMenu(){
        this.setState({
            menuVisible:true
        })
    }

    hideMenu(){
        this.setState({
            menuVisible:false
        })
    }

    render(){
        return(
            <>
            {/* button to summon menu (always visible) */}
            <button>Edit Note</button>
            {/* Editing menu (only visible when active) */}
            { this.state.menuVisible ?
                <EditModal closeWindow={this.hideMenu} myTitle={this.props.title}/> : <></>}
            </>
        )
    }
}

function EditModal(props){
    return(
        <div className="modal-background">
            <div className="modal-window">
                <button onClick = {props.closeWindow}>Close</button>
                <p>Edit information for note: {props.myTitle}</p>
                {/* form goes here */}
            </div>
        </div>
    )
}

export default EditNote