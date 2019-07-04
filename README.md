
# &lt;Form /&gt;

_A react component for automatically wiring up forms._

This component is intended to simplify using forms with [React](https://reactjs.org) and does not prescribe any UI library to do so.

## Install

`npm install --save @stanlemon/react-form`

## Example

Wrap any form with this component and attach a handler and it'll handle populating those properties. Additionally you can pass server side errors in and map client side validators to your fields.

```jsx
class MyForm extends React.Component {
  onSubmit = (errors, fields) => {
    this.setState({ errors, fields });
  };

  render(): React.ReactElement {
    const { fields, errors } = this.state;

    const validate = {
      name: {
        notEmpty: {
          msg: "You must enter a name for this form."
        }
      }
    };

    return (
      <Form
        handler={this.onSubmit}
        fields={fields}
        errors={errors}
        validate={TestForm.validate}
      >
        <div>
          <input type="text" name="name" />
        </div>
        {errors.name && <div className="error">{errors.name[0]}</div>}
        <button type="submit">Submit</button>
      </Form>
    );
  }
}
```

Then in your document simply use:

```jsx
<MyForm />
```

Obviously if you want to do something more exciting than store the state back on the form you will want to modify your handler method accordingly.

## TODO

- [ ] Rename `fields` to `values`
- [ ] Rename `handler()` to `onSubmit()`
- [ ] Update tsc to use `"noImplicitAny": true `
