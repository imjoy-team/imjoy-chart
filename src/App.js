import React, { Component } from "react";
import plotly from "plotly.js/dist/plotly";
import PlotlyEditor from "react-chart-editor";
import CustomEditor from "./CustomEditor";
import "react-chart-editor/lib/react-chart-editor.css";
import { imjoyRPC } from "imjoy-rpc";
import * as Papa from "papaparse";
import { Uint64LE, Int64LE } from "int64-buffer";

const config = { editable: true };

function loadCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: typeof url === "string" && url.startsWith("http"),
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      error: (err, file, inputElem, reason) => {
        alert("Falied to load the table: " + reason.toString());
        reject(reason);
      },
      complete: (results) => {
        resolve(transpose(results.data));
      },
    });
  });
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

function randId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function cleanUpPoints(dataSources, points) {
  const data = [];
  for (let i = 0; i < points.length; i++) {
    const customdata = {};
    for (let k of Object.keys(dataSources)) {
      customdata[k] = dataSources[k][points[i].pointIndex];
    }
    data.push({
      pointIndex: points[i].pointIndex,
      x: points[i].x,
      y: points[i].y,
      z: points[i].z || undefined,
      customdata: customdata,
    });
  }
  return data;
}

const dtypeToTypedArray = {
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  float32: Float32Array,
  float64: Float64Array,
  array: Array,
};

class App extends Component {
  constructor() {
    super();
    this.widgets = [];
    this.plotDivId = randId();
    this._initPromise = new Promise((resolve) => {
      this._initPromiseResolve = resolve;
    });
    let load = getUrlParameter("load");
    this.hideControls = !!getUrlParameter("hideControls");
    this.saveDataHandler = null;
    this.loadDataHandler = null;
    if (load) {
      this.loadData(load);
    } else {
      this.dataSources = {
        col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
        col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
        col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
      };

      this.dataSourceOptions = Object.keys(this.dataSources).map((name) => ({
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
      imjoyRPC.setupRPC({ name: "ImJoy Chart Editor" }).then((api) => {
        api.registerCodec({
          name: "ndarray",
          decoder(obj) {
            if (obj._rdtype === "int64") {
              const ret = new Uint32Array(
                new ArrayBuffer(obj._rvalue.byteLength / 2)
              );
              for (let i = 0; i < obj._rvalue.byteLength; i += 8) {
                ret[i / 8] = new Int64LE(obj._rvalue, i).toNumber();
              }
              return ret;
            }
            if (obj._rdtype === "uint64") {
              const ret = new Uint32Array(
                new ArrayBuffer(obj._rvalue.byteLength / 2)
              );
              for (let i = 0; i < obj._rvalue.byteLength; i += 8) {
                ret[i / 8] = new Uint64LE(obj._rvalue, i).toNumber();
              }
              return ret;
            }
            const arrayType = dtypeToTypedArray[obj._rdtype];
            return new arrayType(obj._rvalue);
          },
        });
        api.export({
          async setup() {
            console.log("imjoy-rpc initialized.");
            await self._initPromise;
          },
          async run(ctx) {
            if (ctx && ctx.config) {
              if (ctx.config.saveDataHandler !== undefined)
                self.saveDataHandler = ctx.config.saveDataHandler;
              if (ctx.config.loadDataHandler !== undefined)
                self.loadDataHandler = ctx.config.loadDataHandler;
              if (ctx.config.hideControls !== undefined)
                self.hideControls = ctx.config.hideControls;
            }
            if (ctx && ctx.data) {
              self.dataSources = ctx.data.dataSources || {};
              self.dataSourceOptions =
                ctx.data.dataSourceOptions ||
                Object.keys(self.dataSources).map((name) => ({
                  value: name,
                  label: name,
                }));
              if (self.state.dataSources) delete self.state.dataSources;
              if (self.state.dataSourceOptions)
                delete self.state.dataSourceOptions;
              self.setState(ctx.data);
            }
            self.forceUpdate();
          },
          async loadDataSource(file) {
            await self.loadData(file);
          },
          hideControls(hide) {
            self.hideControls = hide;
            self.forceUpdate();
          },
          setWidgets(widgets) {
            self.widgets = widgets;
            self.forceUpdate();
          },
          addWidget(widget) {
            self.widgets.push(widget);
            self.forceUpdate();
          },
          removeWidget() {
            const w = self.widgets.filter((wd) => wd.name === widget.name)[0];
            if (w) {
              // remove widget
              self.widgets.splice(self.widgets.indexOf(w), 1);
              self.forceUpdate();
            } else {
              throw new Error("Widget not found: " + widget.name);
            }
          },
          updateWidget(widget) {
            const w = self.widgets.filter((wd) => wd.name === widget.name)[0];
            if (w) {
              // replace widget
              self.widgets[self.widgets.indexOf(w)] = widget;
              self.forceUpdate();
            } else {
              throw new Error("Widget not found: " + widget.name);
            }
          },
          setState(state) {
            self.setState(state);
            self.forceUpdate();
          },
          getState() {
            return self.state;
          },
          addListener({ event, callback }) {
            document.getElementById(self.plotDivId).on(event, (data) => {
              if (data.points)
                callback(cleanUpPoints(self.dataSources, data.points));
              else {
                callback(data);
              }
            });
          },
          removeAllListeners(event) {
            document.getElementById(self.plotDivId).removeAllListeners(event);
          },
        });
      });
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this._initPromiseResolve();
    }, 0);
  }

  async loadData(file) {
    let data;
    if (file instanceof Blob) {
      data = await loadCSV(file);
    } else if (typeof file === "object") {
      data = file;
    } else {
      if (typeof file === "string" && file.startsWith("http")) {
        if (file.split("?")[0].endsWith(".json")) {
          const response = await fetch(file);
          const data = await response.json();
          if (data.data && data.layout) {
            this.setState(data);
            this.forceUpdate();
            return;
          } else {
            throw new Error("Invalid file type");
          }
        } else if (!file.split("?")[0].endsWith(".csv")) {
          throw new Error(
            "Invalid file extension, only .json and .csv are supported"
          );
        }
      } else if (file instanceof Blob) {
        if (file.name.endsWith(".json")) {
          const fr = new FileReader();
          fr.addEventListener("load", (e) => {
            const data = JSON.parse(fr.result);
            if (data.data && data.layout) {
              this.setState(data);
              this.forceUpdate();
            } else {
              throw new Error("Invalid file type");
            }
          });

          fr.readAsText(file);
        }
      }
      data = await loadCSV(file);
    }
    this.dataSources = data;
    this.dataSourceOptions = Object.keys(this.dataSources).map((name) => ({
      value: name,
      label: name,
    }));
    this.forceUpdate();
  }

  render() {
    return (
      <div className="app">
        {this.hideControls && (
          <div className="modebar-group">
            <a
              rel="tooltip"
              className="modebar-btn"
              style={{
                position: "absolute",
                cursor: "pointer",
                zIndex: 9,
                height: "2rem",
                width: "2rem",
                left: "0",
                top: "0",
              }}
              onClick={() => {
                this.hideControls = false;
                this.forceUpdate();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                height="2em"
                width="2em"
                viewBox="0 0 50 50"
                enableBackground="new 0 0 50 50"
              >
                <path d="M9.6 40.4l2.5-9.9L27 15.6l7.4 7.4-14.9 14.9-9.9 2.5zm4.3-8.9l-1.5 6.1 6.1-1.5L31.6 23 27 18.4 13.9 31.5z" />
                <path d="M17.8 37.3c-.6-2.5-2.6-4.5-5.1-5.1l.5-1.9c3.2.8 5.7 3.3 6.5 6.5l-1.9.5z" />
                <path d="M29.298 19.287l1.414 1.414-13.01 13.02-1.414-1.412z" />
                <path d="M11 39l2.9-.7c-.3-1.1-1.1-1.9-2.2-2.2L11 39z" />
                <path d="M35 22.4L27.6 15l3-3 .5.1c3.6.5 6.4 3.3 6.9 6.9l.1.5-3.1 2.9zM30.4 15l4.6 4.6.9-.9c-.5-2.3-2.3-4.1-4.6-4.6l-.9.9z" />
              </svg>
            </a>
          </div>
        )}
        <PlotlyEditor
          hideControls={this.hideControls}
          data={this.state.data}
          layout={this.state.layout}
          config={config}
          frames={this.state.frames}
          dataSources={this.dataSources}
          dataSourceOptions={this.dataSourceOptions}
          plotly={plotly}
          onUpdate={(data, layout, frames) => {
            this.setState({ data, layout, frames });
          }}
          useResizeHandler
          debug
          glByDefault
          showFieldTooltips
          advancedTraceTypeSelector
          divId={this.plotDivId}
        >
          <CustomEditor
            logoSrc={"./static/icons/favicon-96x96.png"}
            dataSources={this.dataSources}
            divId={this.plotDivId}
            data={this.state}
            widgets={this.widgets}
            handleSaveData={this.saveDataHandler}
            handleLoadData={this.loadDataHandler || this.loadData.bind(this)}
          />
        </PlotlyEditor>
      </div>
    );
  }
}

export default App;
