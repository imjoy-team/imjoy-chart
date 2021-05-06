import React, {Component} from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import CustomEditor from './CustomEditor';
import 'react-chart-editor/lib/react-chart-editor.css';
import { imjoyRPC } from 'imjoy-rpc';

const config = {editable: true};

class App extends Component {
  constructor() {
    super();

    this.dataSources = {
      col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
      col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
      col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
    };

    this.dataSourceOptions = Object.keys(this.dataSources).map(name => ({
      value: name,
      label: name,
    }));

    this.state = {
      data: [],
      layout: {},
      frames: [],
    };
    // if inside an iframe, setup imjoy rpc
    if (window.self !== window.top) {
      const self = this;
      imjoyRPC.setupRPC({name: 'ImJoy Chart Editor'}).then((api)=>{
        api.export({
          setup(){
            console.log("imjoy-rpc initialized.")
          },
          run(ctx){
            if(ctx && ctx.config){
              self.state = ctx.config;
            }
            if(ctx && ctx.data){
              self.dataSources = ctx.data.sources;
              self.dataSourceOptions = ctx.data.options || Object.keys(self.dataSources).map(name => ({
                value: name,
                label: name,
              }));
            }
            self.forceUpdate();
          }
        })
      })
    }
  }

  render() {
    return (
      <div className="app">
        <PlotlyEditor
          data={this.state.data}
          layout={this.state.layout}
          config={config}
          frames={this.state.frames}
          dataSources={this.dataSources}
          dataSourceOptions={this.dataSourceOptions}
          plotly={plotly}
          onUpdate={(data, layout, frames) => this.setState({data, layout, frames})}
          useResizeHandler
          debug
          advancedTraceTypeSelector
        >
          <CustomEditor logoSrc={"./static/icons/favicon-96x96.png"}/>
        </PlotlyEditor>
      </div>
    );
  }
}

export default App;
