# reactive-js
reactive-js is a vanilla JavaScript library for building state based user interaces.

## Usage ##

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
