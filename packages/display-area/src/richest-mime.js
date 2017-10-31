// @flow
import React from "react";

import { richestMimetype, transforms, displayOrder } from "@nteract/transforms";

type Props = {
  expanded: boolean,
  displayOrder: Array<string>,
  transforms: Object,
  bundle: Object,
  metadata: Object,
  theme: string,
  models?: Object
};

type ErrorProps = {
  children?: React$Node
};

type ErrorInfo = {
  componentStack: string
};

type State = {
  error: ?Error,
  info: ?ErrorInfo
};

type FallbackProps = {
  componentStack: string,
  error: Error
};

const Fallback = ({ componentStack, error }: FallbackProps) => (
  <div
    style={{
      backgroundColor: "ghostwhite",
      color: "black",
      fontWeight: "600",
      display: "block",
      padding: "10px",
      marginBottom: "20px"
    }}
  >
    <h3> Error: {error.toString()}</h3>
    <details>
      <summary>stack trace</summary>
      <pre>{componentStack}</pre>
    </details>
  </div>
);

class ErrorBoundary extends React.Component<ErrorProps, State> {
  constructor(props: ErrorProps) {
    super(props);
    this.state = {
      error: null,
      info: null
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <Fallback
          componentStack={this.state.info ? this.state.info.componentStack : ""}
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}

export default class RichestMime extends React.Component<Props> {
  static defaultProps = {
    transforms,
    displayOrder,
    theme: "light",
    metadata: {},
    bundle: {},
    models: {}
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    // eslint-disable-line class-methods-use-this
    if (
      nextProps &&
      nextProps.theme &&
      this.props &&
      nextProps.theme !== this.props.theme
    ) {
      return true;
    }
    // return false;
    return true;
  }

  render(): ?React$Element<any> | null {
    const mimetype = richestMimetype(
      this.props.bundle,
      this.props.displayOrder,
      this.props.transforms
    );

    if (!mimetype) {
      // If no mimetype is supported, don't return a component
      return null;
    }

    const Transform = this.props.transforms[mimetype];
    const data = this.props.bundle[mimetype];
    const metadata = this.props.metadata[mimetype];
    return (
      <ErrorBoundary>
        <Transform
          expanded={this.props.expanded}
          data={data}
          metadata={metadata}
          theme={this.props.theme}
          models={this.props.models}
        />
      </ErrorBoundary>
    );
  }
}
