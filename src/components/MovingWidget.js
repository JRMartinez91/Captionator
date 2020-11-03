//the operation of the Moving Widget is as follows:
//it contains a single function that assigns a series of
//click and drag eventListeners to an element
//it is imported into every Note and Group, where each of them
//call the function with themselves as arguments, thus assigning
//those eventListeners to themselves

function movingWidget(element){

    let dx = 0
    let dy = 0
    let mouseX = 0
    let mouseY = 0
    let anchorX = element.offsetLeft
    let anchorY = element.offsetTop

    //handles for dragging will be handled later, so for now we'll assign
    //the even handler to the entire div

    //find handle
    let dragHandle = null
    console.log(element.children);
    for(const child of element.children){
        if(child.classList && child.classList.contains('drag-handle')){
            dragHandle = child;
        }
    }
    
    const startDragging=(event)=>{
        event = event || window.event
        event.preventDefault();
        if(event.target === event.currentTarget){
            
            console.log("startDragging called by " + event.target.id)
            //get mouse's current position
            mouseX = event.clientX
            mouseY = event.clientY
            //during dragging, and ONLY during dragging, the element
            //receives two event handlers:
            //  -on mousemove, follow the mouse
            element.onmousemove = moveWithMouse;
            //  -on mouseup, disconnected the mousemove and mouseup events
            element.onmouseup = endDragging;
            console.log(element.offsetLeft)
            //console.log(element.clientWidth)
            console.log(element.offsetTop)
            //console.log(element.parentElement.children)
        }
    }

    function moveWithMouse(event){
        //console.log("movewithMouse called")
        event = event || window.event
        event.preventDefault();
        //get difference between cursor's location last tick and this tick
        dx = mouseX - event.clientX
        dy = mouseY - event.clientY
        //record current cursor location
        mouseX = event.clientX
        mouseY = event.clientY

        const backupTop = element.style.top
        const backupLeft = element.style.left
        const destinationY = element.offsetTop - anchorY - dy
        const destinationX = element.offsetLeft - anchorX - dx
        //if its a box, move wherever you want
        if(!element.classList.contains('handle')){
            element.style.top = destinationY + "px";
            element.style.left = destinationX + "px";
        }
        
    }
    
    function endDragging(){
        //remove mousemove and mouseup event listeners
        //console.log("endDragging called by " + element.id)
        element.onmousemove = null;
        element.onmouseup = null;
    }
    //give this element an on-click event that activates dragging
    //element.addEventListener("mousedown",startDragging);

    dragHandle.addEventListener("mousedown",startDragging)

    // phandle.addEventListener("mousedown",()=>{
    //     console.log("clicked!")
    //     startDragging()})
    //emergency brake:
    document.addEventListener("mouseup",endDragging)
}


// window.onload=()=>{
//     console.log("window.onload() recognized")
//     let oldstats = []
//     const movingWindows = document.getElementsByClassName("x")

//     for(const element of movingWindows){
//        // element.style.position = "relative"
//         gogo(element)
//         element.addEventListener("click",(event)=>{
//             if(event.target === event.currentTarget){
//                 console.log(event.target.offsetLeft,event.target.offsetTop)
//             }
//         })
//      }

// }

export default movingWidget;