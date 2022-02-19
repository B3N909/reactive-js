# reactive-js
reactive-js is a vanilla JavaScript library for building state based user interaces.

## Usage ##
### Components ###
All components must follow this basic pattern:
```js
function myComponent (props) { // props param always required
  init(props);
  
  // must always return valid vanilla HTML
  return `<div></div>`;
}
```


### init ###
Init must always be the first line of a component. You can specify a unique ID as a DOM ID reference, or component reference for later.
This is useful when you want to reference / change the state of a component inside a different component.
```js
init(props, "myCustomRef", callback);
```


### References ###
All props must have a unique ```ref``` value.

To generate a new reference:
```js
const ref = newRef();

// usage:
root(myComponent, { ref });
```


### Root ###
Specify the root component to render, all other components must be children of the root.
```js
root(component, props);
```


## Example ##

```js
function button (props) {
  init(props);
  
  // click events are embedded in HTML as ID callbacks
  return `<button click="${onClick(() => {
    console.log("Button clicked!");
    
    // get element with specific ID
    const textComponent = id("txtCmp"); // { props: ..., component: ... }
    const textComponentState = getState(textComponent.props);


    // change the state of another component
    setState({
      value: textComponentState.value + 1,
    }, textComponent.component, textComponent.props);
    
  }, props)}">Click me!</button>`;  
}


function textComponent (props) {
  init(props, "txtCmp");

  // initialize value to 0, is not called again on re-render
  setState({
    value: 0
  }, props);
  
  // get current state, on change component is re-rendering
  const state = getState(props);
  return `<h5>${state.value}</h5>`;
}


function app (props) {
  // line 1 must be init(...) for every component function
  init(props, "app", () => {
    // only ran once, never on re-render
    console.log("Component initialized!");
  });

  // Since ALL components return vanilla HTML strings, components can be nested easily
  return `<div>${button({ ref: newRef() }${textComponent({ ref: newRef() }) }</div>`;
}


// only call once with root component and props to render
root(app, { ref: newRef() });
```
