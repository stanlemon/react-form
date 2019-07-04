import {
  includes,
  get,
  has,
  isEqual,
  isObject,
  zipObject,
  fill,
  range
} from "lodash";
import * as React from "react";
import * as Validator from "validator";

export interface Props {
  children?: React.ReactChild[];
  /**
   * Values to load into the form on render.
   *
   * Can be used for default values on fields.
   */
  values?: {};
  /**
   * Validation configuration, keyed by form field.
   * Methods should map to the Validator package's functions and use the 'msg' key to define
   * errors messages.
   *
   * For example:
   * ```js
   * const validate = {
   *   firstName: {
   *     notEmpty: {
   *       msg: "You must enter a first name for this form."
   *     }
   *   }
   * };
   * ```
   */
  validate?: {};
  /**
   * Error values to load into the form on render.
   */
  errors?: {};
  /**
   * Callback when a form is submitted, executed everytime before onSuccess() or onError().
   * @param values Form values that were submitted.
   */
  onSubmit?: (values: {}) => void;
  /**
   * Callback when a form is successfully submitted without errors.
   * Any values returned here will replace the values in the form. If you are creating new
   * records often you will want to blank out the form, which you can do by returning an empty
   * object.  Forms where the records are being edited will often just want to return the
   * values that were passed into this method.
   * @param values Form values that were submitted.
   */
  onSuccess?: (values: {}) => {};
  /**
   * Callback when a form is submitted with errors.
   * @param errors Form errors resulting from the submission.
   */
  onError?: (errors: {}) => void;
}

/**
 * Automatically handle processing forms and their errors declaratively.
 *
 * Design your forms just as you normally would, but wrap them in the <Form /> component to let
 * it handles value binding and validation. <Form/> makes it easy to do forms in React!
 */
export class Form extends React.Component<Props, {}> {
  static defaultProps = {
    values: {},
    errors: {},
    validate: {},
    onSubmit: (values: {}): {} => {
      return values;
    },
    onSuccess: (values: {}): void => {
      return;
    },
    onError: (errors: {}): void => {
      return;
    }
  };

  validators = {};
  values = [];
  state = {
    values: []
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const errors = {};
    const validators = {};

    Object.assign(validators, this.validators, this.props.validate);

    Object.keys(validators).forEach((field): void => {
      Object.keys(validators[field]).forEach((key): void => {
        let validator;
        // Magically prepend is for most validators
        if (
          key !== "notEmpty" &&
          key !== "contains" &&
          key !== "equals" &&
          key !== "matches" &&
          key.slice(0, 2) !== "is"
        ) {
          validator = `is${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        } else {
          validator = key;
        }

        if (
          key !== "notEmpty" &&
          !Object.prototype.hasOwnProperty.call(Validator, validator)
        ) {
          throw new Error(`Validator does not have ${validator}`);
        }

        const value = get(this.state.values, field, "");

        let args = [value];

        if (Array.isArray(validators[field][key])) {
          args = [value, ...validators[field][key]];
        } else if (
          isObject(validators[field][key]) &&
          has(validators[field][key], "args")
        ) {
          args = [value, ...validators[field][key].args];
        }

        let hasError = false;

        if (key === "notEmpty") {
          hasError = !!value.match(/^[\s\t\r\n]*$/);
        } else if (Validator[validator].apply(null, args) === false) {
          hasError = true;
        }

        if (hasError) {
          if (!Object.prototype.hasOwnProperty.call(errors, field)) {
            errors[field] = [];
          }

          const message =
            isObject(validators[field][key]) &&
            has(validators[field][key], "msg")
              ? validators[field][key].msg
              : key;

          errors[field].push(message);
        }
      });
    });

    // This ensure we always send every field property, though for those that
    // have not had a change trigger we simply send an empty string
    const newValues = Object.assign(
      zipObject(this.values, fill(range(this.values.length), "")),
      this.state.values
    );
    //this.setState({ values: newState });

    // Always call submit
    this.props.onSubmit(newValues);

    // If we have errors...
    if (Object.keys(errors).length > 0) {
      this.props.onError(errors);
      return;
    }

    // No errors!
    this.setState({
      values: this.props.onSuccess(newValues)
    });
  };

  handleChange(field, event): void {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    this.setState({
      values: Object.assign(this.state.values, { [field]: value })
    });
  }

  componentWillMount(): void {
    this.setState({
      values: get(this.props, "values", {})
    });
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (
      !isEqual(this.props.values, nextProps.values) &&
      Object.keys(nextProps.errors).length === 0
    ) {
      this.setState({ values: nextProps.values });
    }
  }

  render(): React.ReactNode {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.processChildren(this.props.children)}
      </form>
    );
  }

  processChildren(children: React.ReactChild[]): React.ReactChild[] {
    return React.Children.map(
      children,
      (child): React.ReactChild => {
        if (
          React.isValidElement(child) &&
          includes(["input", "textarea", "select"], child.type)
        ) {
          if (child.props.validate) {
            this.validators[child.props.name] = child.props.validate;
          }

          this.values.push(child.props.name);

          const value = get(this.state.values, child.props.name, "");

          return React.cloneElement(child, {
            [child.props.type === "checkbox" ? "checked" : "value"]: value,
            onChange: this.handleChange.bind(this, child.props.name)
          });
        } else if (
          React.isValidElement(child) &&
          React.Children.count(child) > 0
        ) {
          return React.cloneElement(
            child,
            {},
            this.processChildren(child.props.children)
          );
        }
        return child;
      }
    );
  }
}
