
# &lt;Form /&gt;

_A react component for automatically wiring up forms._

This component is intended to simplify using forms with [React](https://reactjs.org) and does not prescribe any UI library to do so.

## Install

`npm install --save @stanlemon/react-form`

## Example

Wrap any form with this component and attach a handler and it'll handle populating those properties. Additionally you can pass server side errors in and map client side validators to your fields.

```jsx
<Form handler={(errors, fields) => console.log(errors, fields)}>
  <input type="text" name="name" />
  <button type="submit">Submit</button>
</Form>
```

## TODO

- [ ] Rename `fields` to `values`
- [ ] Rename `handler()` to `onSubmit()`
- [ ] Add more robust examples
- [ ] Update tsc to use `"noImplicitAny": true `
