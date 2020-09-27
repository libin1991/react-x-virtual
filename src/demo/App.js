import React from 'react';
import VirtualList from '../lib';
import { getRandSize } from './util'

const {
  Header: VirtualHeader,
  Footer: VirtualFooter,
  Section: VirtualSection
} = VirtualList

class ContentTextBox extends React.Component {
  render() {
    return (
      <div className="ContentTextBox">
        <p>Header { this.props.tag }</p>
      </div>
    );
  }
}

class Row extends React.Component {
  render() {
    const { style, index, virtualIndex } = this.props;
    return (
      <div className="Row" style={ style } key={ index }>
        <p className="virtual-index">
          { virtualIndex }
        </p>
        <p className="item-index">
          ({ index })
        </p>
      </div>
    );
  }
}

class App extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      scrollToIndex: 10,
      actionScrollToIndex: 0,
      scrollEventThrottle: 30,
    };
    this.initialScrollIndex = 120;
    this.estimatedItemSize = 150;
    this.getVarItemSize = () => getRandSize(80, this.estimatedItemSize);
    this.vlistRef = React.createRef(null);
  }

  changeScrollIndex = event => {
    const index = Number(event.target.value);

    console.log('changeScrollIndex', index);
    this.setState({
      scrollToIndex: index,
    });
  };

  changeActionScrollIndex = event => {
    const index = Number(event.target.value);

    console.log('changeScrollIndex', index);
    this.setState({
      actionScrollToIndex: index,
    });
  };

  changeScrollEventThrottle = event => {
    const t = Number(event.target.value);

    if (t < 0) {
      return;
    }
    console.log('changeScrollEventThrottle', t);
    this.setState({
      scrollEventThrottle: t,
    });
  };

  handleScrollTo = () => {
    console.log(this.vlistRef);
    const index = this.state.actionScrollToIndex;
    this.vlistRef.current.scrollToPosition({
      position: index,
      smooth: true,
      alignTo: 'top',
    });
  };

  handleOnStartScroll = (event, ...args) => {
    console.log('OnStartScroll', event, ...args);
  };

  handleOnEndScroll = (event, ...args) => {
    console.log('OnEndScroll', event, ...args);
  };

  handleOnScrollToUpper = (event, ...args) => {
    console.log('OnScrollToUpper', event, ...args);
  };

  handleOnScrollToLower = (event, ...args) => {
    console.log('OnScrollToLower', event, ...args);
  };

  handleOnScroll = (event, ...args) => {
    console.log('OnScroll', event, ...args);
  };

  handleOnClick = e => {
    console.log('My Click');
  };

  render() {
    const {
      // itemCount,
      scrollToIndex,
      scrollEventThrottle
    } = this.state;

    return (
      <div className="list-demo-container">
        <div className="form">
          <div className="field">
            <p className="opt-label">scrollTo:</p>
            <input
              type="number"
              className="opt-input"
              placeholder="scrollIndex..."
              value={ scrollToIndex }
              onChange={ this.changeScrollIndex }
            />
          </div>
          <div className="field">
            <p className="opt-label">scrollEventThrottle:</p>
            <input
              type="number"
              className="opt-input"
              placeholder="scrollEventThrottle..."
              value={ scrollEventThrottle }
              onChange={ this.changeScrollEventThrottle }
            />
          </div>
          <div className="field">
            <p className="opt-label">Action:scrollTo:</p>
            <div className="action-wrapper">
              <input
                type="number"
                className="opt-input"
                placeholder="scrollIndex..."
                onChange={ this.changeActionScrollIndex }
              />
              <button className="opt-button" onClick={ this.handleScrollTo }>
                ScrollTo
              </button>
            </div>
          </div>
        </div>

        <VirtualList
          ref={ this.vlistRef }
          className="VirtualList"
          scrollX
          width={ 600 }
          height={ 200 }
          initialRows={ 8 }
          initialScrollIndex={ this.initialScrollIndex }
          scrollTo={ scrollToIndex }
          scrollEventThrottle={ scrollEventThrottle }
          onScroll={ this.handleOnScroll }
          onStartScroll={ this.handleOnStartScroll }
          onEndScroll={ this.handleOnEndScroll }
          onScrollToLower={ this.handleOnScrollToLower }
          onScrollToUpper={ this.handleOnScrollToUpper }
          lowerThreshold={ 100 }
          upperThreshold={ 100 }
          scrollToAlignment="end"
          itemSize={ this.getVarItemSize }
        >
          <VirtualSection itemCount={ 2050 }>
            <VirtualHeader width={ 100 }>
              <div className="ContentTextBox">
                <p>First Header</p>
              </div>
            </VirtualHeader>
            <Row>First Section Row</Row>
            <VirtualFooter width={ 120 }>
              <ContentTextBox tag="section-1" />
            </VirtualFooter>
          </VirtualSection>

          <VirtualSection itemCount={ 1500 }>
            <VirtualHeader width={ 150 }>
              <ContentTextBox tag="section-2" />
            </VirtualHeader>
            <Row>Second Section Row</Row>
            <VirtualFooter width={ 100 }>
              <ContentTextBox tag="section-2" />
            </VirtualFooter>
          </VirtualSection>
        </VirtualList>
      </div>
    );
  }
}


export default App;
