/* eslint-disable max-lines-per-function */
import * as React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Form } from "./Form";

interface TestFormErrors {
  name?: string[];
}

interface TestFormFields {
  name?: string;
}

interface TestFormState {
  errors: TestFormErrors;
  fields: TestFormFields;
}

interface TestFormProps {
  callback(data: TestFormState): void;
}

class TestForm extends React.Component<TestFormProps, TestFormState> {
  static validate = {
    name: {
      notEmpty: {
        msg: "You must enter a name for this form."
      }
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      fields: {}
    };
  }

  onSubmit = (
    errors: TestFormErrors,
    fields: TestFormFields
  ): TestFormState => {
    const data = { errors, fields };
    this.setState(data);
    this.props.callback(data);
    return data;
  };

  render(): React.ReactElement {
    const { fields, errors } = this.state;

    return (
      <Form
        handler={this.onSubmit}
        values={fields}
        errors={errors}
        validate={TestForm.validate}
      >
        {/* This test id is used for our lookup later when firing our event */}
        <div>
          <input data-testid="input-name" type="text" name="name" />
        </div>
        {errors.name && (
          <div data-testid="input-name-error" className="error">
            {errors.name[0]}
          </div>
        )}
        <button type="submit">Submit</button>
      </Form>
    );
  }
}

describe("<Form />", (): void => {
  afterEach(cleanup);

  it("Submitting a form with a value returns it without errors", (): void => {
    let data = {};

    const callback = (state: TestFormState): void => {
      data = state;
    };

    const component = <TestForm callback={callback} />;
    const result = render(component);

    const name = "Stan Lemon";

    // Update our text input
    fireEvent.change(result.getByTestId("input-name"), {
      target: { value: name }
    });

    // Submit the form
    fireEvent.click(result.getByText("Submit"));

    // We should have gotten back the name value
    expect(data).toMatchObject({
      errors: {},
      fields: {
        name
      }
    });
  });

  it("Submitting a form with no value returns an error", (): void => {
    let data = {};

    const callback = (state: TestFormState): void => {
      data = state;
    };

    const component = <TestForm callback={callback} />;
    const result = render(component);

    // Submit the form
    fireEvent.click(result.getByText("Submit"));

    // Our error message should appear in the dom
    expect(
      result.getByText(TestForm.validate.name.notEmpty.msg)
    ).not.toBeNull();

    // We should have gotten back the name value
    expect(data).toMatchObject({
      errors: {
        name: [TestForm.validate.name.notEmpty.msg]
      },
      fields: {
        name: ""
      }
    });
  });
});
