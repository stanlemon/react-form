import React from "react";
import ReactDOM from "react-dom";
import { Form } from "../src/Form";

interface Values {
  firstName?: string;
  lastName?: string;
}

interface Errors {
  firstName?: string[];
  lastName?: string[];
}

interface State {
  values?: Values;
  errors?: Errors;
  history?: { values?: Values; errors?: Errors }[];
}

class ExampleForm extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      values: {},
      errors: {},
      history: []
    };
  }

  onSuccess = (values: Values): {} => {
    this.setState({
      // Clear our forms errors & values so we start fresh
      errors: {},
      values: {},
      // This is to showcase submits over time
      history: [{ values }, ...this.state.history]
    });
    return {};
  }

  onError = (errors: Errors): void => {
    this.setState({
      errors,
      history: [{ errors }, ...this.state.history]
    });
  }

  render(): React.ReactElement {
    const { values, errors } = this.state;

    const validate = {
      firstName: {
        notEmpty: {
          msg: "You must enter a first name for this form."
        }
      }
    };

    return (
      <>
        <Form
          onSuccess={this.onSuccess}
          onError={this.onError}
          values={values}
          errors={errors}
          validate={validate}
        >
          <h1>Example Form</h1>
          Try this form out for size!
          <div>
            <label htmlFor="name">First Name:</label>
            <input type="text" name="firstName" />
          </div>
          {errors.firstName && <div className="error" style={{ color: 'red' }}>{errors.firstName[0]}</div>}
          <div>
            <label htmlFor="name">Last Name:</label>
            <input type="text" name="lastName" validate={{
              notEmpty: {
                msg: "You must enter a last name for this form."
              }
            }}/>
          </div>
          {errors.lastName && <div className="error" style={{ color: 'red' }}>{errors.lastName[0]}</div>}

          <button type="submit">Submit</button>
        </Form>
        <pre>{this.state.history.map((v, i) => <div key={i}>{JSON.stringify({ errors: v.errors, values: v.values }))}</div>}</pre>
      </>
    );
  }
}

ReactDOM.render(<ExampleForm />, document.getElementById("root"));
