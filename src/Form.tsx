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
  children?: React.ReactElement<{}>[] | JSX.Element[];
  fields: {};
  validate?: {};
  errors?: {};
  handler(errors: {}, fields: {}): {};
}

export class Form extends React.Component<Props, {}> {
  static defaultProps = {
    fields: {},
    errors: {},
    validate: {},
    handler: (): {} => {
      return {};
    }
  };

  validators = {};
  fields = [];
  state = {
    fields: []
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

        const value = get(this.state.fields, field, "");

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
    const newState = this.props.handler(
      errors,
      Object.assign(
        zipObject(this.fields, fill(range(this.fields.length), "")),
        this.state.fields
      )
    );

    if (isObject(newState)) {
      this.setState({ fields: newState });
    }
  };

  handleChange(field, event): void {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    this.setState({
      fields: Object.assign(this.state.fields, { [field]: value })
    });
  }

  componentWillMount(): void {
    this.setState({
      fields: get(this.props, "fields", {})
    });
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (
      !isEqual(this.props.fields, nextProps.fields) &&
      Object.keys(nextProps.errors).length === 0
    ) {
      this.setState({ fields: nextProps.fields });
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

          this.fields.push(child.props.name);

          const value = get(this.state.fields, child.props.name, "");

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
