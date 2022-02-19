
let isReRender = false;
let isStartingNewRef = false;

const onClickListeners = new Map();
const onClickRef = new Map();
function onClick(callback, props) {
    // if(!isReRender) onClickListeners.set(ref, callback);

    if(!isReRender) {
        let ref = newRef();
        onClickListeners.set(props.ref, ref);
        onClickRef.set(ref, callback);
        return ref;
    } else {
        return onClickListeners.get(props.ref);
        // return cache'd ID for ref
    }
}

// TODO: Create single state object based off of a virtaul DOM JSON structure for hierarchy
// TODO: Know newRef data ordered as its structured as array of parent ref

function pointer(m, p) {
    if(!p) return m;
    let s = p.split(".");
    let pp = m;
    for(let i = 0; i < s.length; i++) {
        pp = pp[s[i]];
    }
    return pp;
}

let vdom = {};
let vdomPointer = false;

let initializeMap = new Map();
function init (props, a, b) {
    let component = init.caller;

    // Structure data
    if(!isReRender) {
        // figure out if element is child, sibling, or parent
        
        // TODO: Any newRef's from here onward are a child of this element
        // TODO: Set pointer to this ref
        let childrenRefs = [...newRefs];
        console.log(childrenRefs.length + " children of " + init.caller.name);
        newRefs = [];

        childrenRefs.forEach(ref => {
            pointer(vdom, vdomPointer)[ref] = {}
        })

        pointer(vdom, vdomPointer)[props.ref] = {}
        if(!vdomPointer) vdomPointer = props.ref;
        else vdomPointer = vdomPointer + "." + props.ref;
    }

    if(!isReRender) {
        let _id = false;
        let _callback = false;
        if(typeof a === "string") {
            _id = a;
            callback = b;
        } else {
            _id = b;
            _callback = a;
        }

        if(_id) {
            id(component, props, _id);
        }
        if(_callback) {
            _callback();
        }

        bind(component, props);
    }
}


const bindRefMap = new Map();
function bind (component, props) {
    bindRefMap.set(props.ref, { component, props, c: component, p: props });
}

function bindRef (ref) {
    return bindRefMap.get(ref);
}


const stateMap = new Map();
function setState(state, component, props) {
    let isInitialize = stateMap.has(props.ref);
    if(!isReRender) {
        stateMap.set(props.ref, state);
        if(isInitialize) reRender(component, props);
    }
}
function getState(props) {
    return stateMap.get(props.ref);
}

// TODO: Figure current refPosition
let refPosition = 0;
let refArray = [];

let newRefs = [];

let refMap = new Map();
function newRef (props) {
    
    if(isReRender) {
        console.log(refPosition);
        console.log(props);
        let a = refArray[refPosition];
        refPosition++;
        return a;
    }



    // TODO: Keep track of current refPosition at ALL times
    // TODO: When creating element, add refPosition
    // TODO: When rerendering && rendering component, set refReRenderPosition to parent refPosition

    let id = (Math.round(Math.random() * 100000000000)).toString();
    if(!props) {
        // generate new ID, no arguments
        if(!isReRender) {
            refArray.push(id);
            newRefs.push(id);
            refPosition++;
        }
        return id;
    } else {
        if(typeof props === "function") {
            // if we provide component as props
            //    create new ID based off component
            if(refMap.has(props)) refMap.set(props, [...refMap.get(props), id]);
            else refMap.set(props, [id]);
        } else {
            if(refMap.has(props)) return refMap.get(props);
            refMap.set(props, id);
        }
        if(!isReRender) {
            refArray.push(id);
            newRefs.push(id);
            refPosition++;
        }
        return id;
    }
}




function ref(ref) {
    if(refMap.has(ref) && Array.isArray(refMap.get(ref))) {
        const componentRefs = refMap.get(ref);

        let array = [];
        for(let i = 0; i < componentRefs.length; i++) array.push(bindRef(componentRefs[i]));
        
        return array;
    }
    return document.querySelector(`[ref="${ref}"]`);
}


function reRender(component, props) {
    console.log("RE RENDERING: " + props.ref + " for " + component.name);
    console.log("\n\n\n");

    refPosition = 0;
    isReRender = true;

    const element = createElement(component, props);
    const parent = document.querySelector(`[ref="${props.ref}"]`).parentElement;
    parent.replaceChild(element, document.querySelector(`[ref="${props.ref}"]`));
    
    // parent.appendChild(element);

    isReRender = false;
}

function root (component, props) {
    props.ref = newRef();
    
    const element = createElement(component, props);
    document.body.innerHTML = "";
    document.body.appendChild(element); 
}

function createElement(component, props) {

    // set newRef
    isStartingNewRef = true;
    let htmlStr = component(props);
    isStartingNewRef = false;

    const html = new DOMParser().parseFromString(htmlStr, 'text/html');
    const element = html.documentElement.querySelector('body').firstChild;

    if(element.hasAttribute("click")) {
        element.onclick = onClickRef.get(element.getAttribute("click"));
    }

    element.setAttribute("ref-offset", refPosition);

    const children = element.getElementsByTagName("*");
    for(let i = 0; i < children.length; i++) {
        let child = children[i];
        if(child.hasAttribute("click")) {
            child.onclick = onClickRef.get(child.getAttribute("click"));
        }
        if(child.hasAttribute("ref") && idRefMap.has(child.getAttribute("ref"))) {
            console.log("SET ID");
            child.setAttribute("id", idRefMap.get(child.getAttribute("ref")));
        }
    }
    element.setAttribute("ref", props.ref);

    if(idRefMap.has(props.ref)) {
        element.setAttribute("id", idRefMap.get(props.ref));
    }
    // if(onClickListeners.has(props.ref)) element.onclick = onClickListeners.get(props.ref);

    return element;
}



const idRefMap = new Map();
const idMap = new Map();
function id (component, props, id) {
    if(typeof component === "string") {
        if(idMap.has(component)) return idMap.get(component);
        return;
    }
    idRefMap.set(props.ref, id);
    idMap.set(id, { component, props, c: component, p: props });
}

// module.exports = {
//     root,
//     onClick,
//     ref,
//     newRef,
//     setState,
//     getState,
//     reRender,
//     createElement,
// }