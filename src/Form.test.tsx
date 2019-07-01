/* eslint-disable max-lines-per-function */
import * as React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Form } from "./Form";

describe("<Form />", (): void => {
  afterEach(cleanup);

  it("Submitting a form with a value returns it without errors", (): void => {
    // Use this in our assertions later on
    let data = {};

    const onSubmit = (errors: {}, fields: {}): {} => {
      data = { errors, fields };
      return data;
    };

    const component = render(
      <Form handler={onSubmit} fields={{}} errors={{}} validate={{}}>
        {/* This test id is used for our lookup later when firing our event */}
        <input data-testid="input-name" type="text" name="name" />
        <button type="submit">Submit</button>
      </Form>
    );

    const name = "Stan Lemon";

    // Update our text input
    fireEvent.change(component.getByTestId("input-name"), {
      target: { value: name }
    });

    // Submit the form
    fireEvent.click(component.getByText("Submit"));

    // We should have gotten back the name value
    expect(data).toMatchObject({
      errors: {},
      fields: {
        name
      }
    });
  });
});
