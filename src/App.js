import React, {Component} from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import CustomEditor from './CustomEditor';
import 'react-chart-editor/lib/react-chart-editor.css';
import { imjoyRPC } from 'imjoy-rpc';
import * as Papa from 'papaparse';

const config = {editable: true};

function loadCSV(url){
  return new Promise((resolve, reject)=>{
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      error: (err, file, inputElem, reason)=> {
          alert('Falied to load the table: ' + reason.toString())
          reject(reason)
      },
      complete: (results) => {
        resolve(transpose(results.data))
      }
  })
  })
  
}

function transpose(data) {
  let result = {};
  for (let row of data) {
    for (let [key, value] of Object.entries(row)) {
        result[key] = result[key] || [];
        result[key].push(value); 
    }
  }
  return result;
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

class App extends Component {
  constructor() {
    super();
    let load = getUrlParameter('load');
    if(load){
      loadCSV(load).then((data)=>{
        this.dataSources = data
        this.dataSourceOptions = Object.keys(this.dataSources).map(name => ({
          value: name,
          label: name,
        }));
        this.forceUpdate()
      })
    }
    else {
      this.dataSources = {
        col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
        col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
        col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
      };
  
      this.dataSourceOptions = Object.keys(this.dataSources).map(name => ({
        value: name,
        label: name,
      }));
    }
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
            if(ctx && ctx.data){
              self.state = ctx.data || {
                data: [],
                layout: {},
                frames: []
              };
              self.dataSources = ctx.data.data_sources || {};
              self.dataSourceOptions = ctx.data.data_sources_options || Object.keys(self.dataSources).map(name => ({
                value: name,
                label: name,
              }));
              if(self.state.data_sources)
                delete self.data.data_sources;
              if(self.state.data_sources_options)
                delete self.data.data_sources_options;
            }
            self.forceUpdate();
          },
          setState(state){
            self.state = state;
            self.forceUpdate();
          },
          getState(){
            return self.state;
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
          glByDefault
          showFieldTooltips
          advancedTraceTypeSelector
        >
          <CustomEditor 
            logoSrc={"./static/icons/favicon-96x96.png"}
            saveCallback={()=>{
              console.log('saving...',this.state)
            }}
          />
        </PlotlyEditor>
      </div>
    );
  }
}

export default App;
