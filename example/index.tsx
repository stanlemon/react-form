import React from "react";
import ReactDOM from "react-dom";
import { Form } from "../src/Form";

interface Values {
  name?: string;
}

interface Errors {
  name?: string[];
}

interface State {
  values?: Values;
  errors?: Errors;
  history?: { values: Values; errors: Errors }[];
}

class ExampleForm extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      errors: {},
      history: []
    };
  }

  onSubmit = (errors: Errors, values: Values): State => {
    this.setState({
      errors,
      values,
      // This is to showcase submits over time
      history: [{ errors, values }, ...this.state.history]
    });
    return this.state;
  };

  render(): React.ReactElement {
    const { values, errors } = this.state;

    const validate = {
      name: {
        notEmpty: {
          msg: "You must enter a name for this form."
        }
      }
    };

    return (
      <>
        <Form
          onSubmit={this.onSubmit}
          values={values}
          errors={errors}
          validate={validate}
        >
          <h1>Example Form</h1>
          Try this form out for size!
          <div>
            <label htmlFor="name">Name:</label>
            <input type="text" name="name" />
          </div>
          {errors.name && <div className="error" style={{ color: 'red' }}>{errors.name[0]}</div>}
          <button type="submit">Submit</button>
        </Form>
        <pre>{this.state.history.map((v, i) => <div key={i}>{JSON.stringify({ errors: v.errors, values: v.values }))}</div>}</pre>
      </>
    );
  }
}

ReactDOM.render(<ExampleForm />, document.getElementById("root"));
