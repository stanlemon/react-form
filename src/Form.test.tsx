/* eslint-disable max-lines-per-function */
import * as React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Form } from "./Form";

// Extend React's HTMLAttributes to support the 'validate' property that this component optionally allows
declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    validate?: {};
  }
}

interface TestFormErrors {
  firstName?: string[];
  lastName?: string[];
}

interface TestFormValues {
  firstName?: string;
  lastName?: string;
}

interface TestFormState {
  errors: TestFormErrors;
  values: TestFormValues;
}

interface TestFormProps {
  onSubmit(values: TestFormValues): void;
  onSuccess(values: TestFormValues): TestFormValues;
  onError(errors: TestFormErrors): void;
}

class TestForm extends React.Component<TestFormProps, TestFormState> {
  static validate = {
    firstName: {
      notEmpty: {
        msg: "You must enter a first name for this form."
      }
    },
    lastName: {
      notEmpty: {
        msg: "You must enter a last name for this form."
      }
    }
  };

  constructor(props: TestFormProps) {
    super(props);

    this.state = {
      errors: {},
      values: {}
    };
  }

  onSubmit = (values: TestFormValues): void => {
    return this.props.onSubmit(values);
  };

  onSuccess = (values: TestFormValues): TestFormValues => {
    this.setState({ values, errors: {} });
    return this.props.onSuccess(values);
  };

  onError = (errors: TestFormErrors): void => {
    this.setState({ errors });
    this.props.onError(errors);
  };

  render(): React.ReactElement {
    const { values, errors } = this.state;

    return (
      <Form
        onSubmit={this.onSubmit}
        onSuccess={this.onSuccess}
        onError={this.onError}
        values={values}
        errors={errors}
        // Only put the first name validator here, because the last name is inlined
        validate={{ firstName: TestForm.validate.firstName }}
      >
        <h1>Test Form</h1>
        This is a test form, and this paragraph is a similar react text node.
        {/* This test id is used for our lookup later when firing our event */}
        <div>
          <input data-testid="input-first-name" type="text" name="firstName" />
        </div>
        {errors.firstName && (
          <div data-testid="input-first-name-error" className="error">
            {errors.firstName[0]}
          </div>
        )}
        <div>
          <input
            data-testid="input-last-name"
            type="text"
            name="lastName"
            validate={{
              notEmpty: {
                msg: "You must enter a last name for this form."
              }
            }}
          />
        </div>
        {errors.lastName && (
          <div data-testid="input-last-name-error" className="error">
            {errors.lastName[0]}
          </div>
        )}
        <button type="submit">Submit</button>
      </Form>
    );
  }
}

describe("<Form />", (): void => {
  afterEach(cleanup);

  const firstName = "Stan";
  const lastName = "Lemon";

  let data = {
    errors: {},
    values: {}
  };

  const onSubmit = (values: TestFormValues): void => {
    data.values = values;
    return;
  };
  const onSuccess = (values: TestFormValues): TestFormValues => {
    // Returning an empty object will essentially reset the form on submit,
    // useful for forms that create new records. Forms editing existing
    // records should return values.
    return {};
  };
  const onError = (errors: TestFormErrors): void => {
    data.errors = errors;
  };

  beforeEach((): void => {
    data = { errors: {}, values: {} };
  });

  // Happy path
  it("Submitting a form without errors", (): void => {
    const component = (
      <TestForm onSubmit={onSubmit} onSuccess={onSuccess} onError={onError} />
    );
    const result = render(component);

    // Update our text inputs
    fireEvent.change(result.getByTestId("input-first-name"), {
      target: { value: firstName }
    });
    fireEvent.change(result.getByTestId("input-last-name"), {
      target: { value: lastName }
    });

    // Submit the form
    fireEvent.click(result.getByText("Submit"));

    // We should have gotten back correct value
    expect(data).toMatchObject({
      errors: {},
      values: {
        firstName,
        lastName
      }
    });

    // With a successful submit, the form should now be cleared
    expect(result.getByTestId("input-first-name").getAttribute("value")).toBe(
      ""
    );
    expect(result.getByTestId("input-last-name").getAttribute("value")).toBe(
      ""
    );
  });

  it("Submitting a form with errors", (): void => {
    const component = (
      <TestForm onSubmit={onSubmit} onSuccess={onSuccess} onError={onError} />
    );
    const result = render(component);

    // Submit the form
    fireEvent.click(result.getByText("Submit"));

    // Our error message should appear in the dom
    expect(
      result.getByText(TestForm.validate.firstName.notEmpty.msg)
    ).not.toBeNull();

    // Our error message should appear in the dom
    expect(
      result.getByText(TestForm.validate.lastName.notEmpty.msg)
    ).not.toBeNull();

    // We should have gotten back empty values
    expect(data).toMatchObject({
      errors: {
        firstName: [TestForm.validate.firstName.notEmpty.msg],
        lastName: [TestForm.validate.lastName.notEmpty.msg]
      },
      values: {
        firstName: "",
        lastName: ""
      }
    });

    // Now fill in the first name, form is still invalid, but the first name value should be preserved after submit
    fireEvent.change(result.getByTestId("input-first-name"), {
      target: { value: firstName }
    });

    // Submit the form
    fireEvent.click(result.getByText("Submit"));

    // Our first name error message should NOT appear in the dom
    expect(
      result.queryByText(TestForm.validate.firstName.notEmpty.msg)
    ).toBeNull();

    // Our last name error message should appear in the dom
    expect(
      result.getByText(TestForm.validate.lastName.notEmpty.msg)
    ).not.toBeNull();

    // First name should still have the value we entered into it
    expect(result.getByTestId("input-first-name").getAttribute("value")).toBe(
      firstName
    );

    // We should have gotten back the first name value and a last name error
    expect(data).toMatchObject({
      errors: {
        lastName: [TestForm.validate.lastName.notEmpty.msg]
      },
      values: {
        firstName: firstName,
        lastName: ""
      }
    });

    // Last name should still be empty
    expect(result.getByTestId("input-last-name").getAttribute("value")).toBe(
      ""
    );

    // An error about last name should exist
    expect(
      result.queryByText(TestForm.validate.lastName.notEmpty.msg)
    ).not.toBeNull();

    // Fill in the last name
    fireEvent.change(result.getByTestId("input-last-name"), {
      target: { value: lastName }
    });

    // Submit the form
    fireEvent.click(result.getByText("Submit"));

    // We should not have any errors and get both of our values
    expect(data).toMatchObject({
      errors: {},
      values: {
        firstName: firstName,
        lastName: lastName
      }
    });

    // An error about first name should not exist
    expect(
      result.queryByText(TestForm.validate.firstName.notEmpty.msg)
    ).toBeNull();

    // An error about last name should not exist
    expect(
      result.queryByText(TestForm.validate.lastName.notEmpty.msg)
    ).toBeNull();

    // First name should be empty
    expect(result.getByTestId("input-first-name").getAttribute("value")).toBe(
      ""
    );

    // Last name should be empty
    expect(result.getByTestId("input-last-name").getAttribute("value")).toBe(
      ""
    );
  });
});
