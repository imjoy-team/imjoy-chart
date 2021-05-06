import React from "react";
import plotly from "plotly.js/dist/plotly";
import {
  PlotlyFold,
  PanelMenuWrapper,
  Info,
  LayoutPanel,
  Button,
  SingleSidebarItem,
  DefaultEditor,
  GraphCreatePanel,
  GraphTransformsPanel,
  GraphSubplotsPanel,
  StyleLayoutPanel,
  StyleAxesPanel,
  StyleMapsPanel,
  StyleLegendPanel,
  StyleNotesPanel,
  StyleShapesPanel,
  StyleSlidersPanel,
  StyleImagesPanel,
  StyleTracesPanel,
  StyleColorbarsPanel,
  StyleUpdateMenusPanel,
} from "react-chart-editor";

import Logo from "react-chart-editor/lib/components/widgets/Logo";
import Drop from "react-dropzone";

import Field from "react-chart-editor/lib/components/fields/Field";

function download(filename, base64) {
  var element = document.createElement("a");
  element.setAttribute("href", base64);
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
export default class CustomEditor extends DefaultEditor {
  constructor(props, context) {
    super(props, context);

    this.state = {
      content:
        "Drop a file to upload here or click to choose a file from your computer.",
    };
  }

  async onDrop(accepted, rejected) {
    const _ = this.context.localize;
    if (accepted.length) {
      if (accepted.length > 1) {
        this.setState({
          content: (
            <div className="dropzone-container__message">
              <p>{_("Yikes! You can only upload one file at a time.")}</p>
            </div>
          ),
        });
        return;
      }

      try {
        this.setState({ content: _("Loading...") });
        await this.props.handleLoadData(accepted[0]);
      } catch (e) {
        throw e;
      } finally {
        this.setState({ content: _("File loaded.") });
      }
    }

    if (rejected.length) {
      this.setState({
        content: "Failed to load file",
      });
    }
  }

  render() {
    const _ = this.context.localize;
    const logo = this.props.logoSrc && <Logo src={this.props.logoSrc} />;

    const dataSources = [];
    if (this.props.dataSources) {
      for (const [index, value] of Object.entries(this.props.dataSources)) {
        dataSources.push(
          <li key={index}>
            {index}:{value.length}
          </li>
        );
      }
    }

    const onDrop = this.onDrop.bind(this);
    return (
      <PanelMenuWrapper menuPanelOrder={this.props.menuPanelOrder}>
        {logo ? logo : null}
        <LayoutPanel group={_("Data")} name={_("Import")}>
          <Field>
            <Drop
              onDrop={onDrop}
              activeClassName="dropzone-container--active"
              rejectClassName="dropzone-container--rejected"
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className="dropzone-container">
                  <input {...getInputProps()} />
                  <div className="dropzone-container__content">
                    {this.state.content}
                  </div>
                </div>
              )}
            </Drop>
          </Field>

          <Button
            variant="primary"
            label="Load from URL"
            onClick={() => {
              const url = prompt("Data URL");
              if (url) {
                this.props.handleLoadData(url);
              }
            }}
          />
        </LayoutPanel>
        <GraphCreatePanel group={_("Structure")} name={_("Traces")} />
        <GraphSubplotsPanel group={_("Structure")} name={_("Subplots")} />
        {this.hasTransforms() && (
          <GraphTransformsPanel group={_("Structure")} name={_("Transforms")} />
        )}
        <StyleLayoutPanel group={_("Style")} name={_("General")} />
        <StyleTracesPanel group={_("Style")} name={_("Traces")} />
        {this.hasAxes() && (
          <StyleAxesPanel group={_("Style")} name={_("Axes")} />
        )}
        {this.hasMaps() && (
          <StyleMapsPanel group={_("Style")} name={_("Maps")} />
        )}
        {this.hasLegend() && (
          <StyleLegendPanel group={_("Style")} name={_("Legend")} />
        )}
        {this.hasColorbars() && (
          <StyleColorbarsPanel group={_("Style")} name={_("Color Bars")} />
        )}
        <StyleNotesPanel group={_("Annotate")} name={_("Text")} />
        <StyleShapesPanel group={_("Annotate")} name={_("Shapes")} />
        <StyleImagesPanel group={_("Annotate")} name={_("Images")} />
        {this.hasSliders() && (
          <StyleSlidersPanel group={_("Control")} name={_("Sliders")} />
        )}
        {this.hasMenus() && (
          <StyleUpdateMenusPanel group={_("Control")} name={_("Menus")} />
        )}
        {this.props.children ? this.props.children : null}

        {/* ---custom widgets-- */}
        <LayoutPanel group={_("Annotate")} name={_("Info")}>
          <PlotlyFold name="PlotlyFold">
            <Info attr="title">
              <p>
                This custom editor demonstrates the general-purpose container
                and field components.
              </p>
              <p>
                This is an <code>Info</code> component.
              </p>
            </Info>
          </PlotlyFold>
        </LayoutPanel>
        <LayoutPanel group={_("Export")} name="image">
          <SingleSidebarItem>
            <Button
              variant="primary"
              label="Export PNG"
              onClick={async () => {
                const base64 = await plotly.toImage(this.props.divId, {
                  format: "png",
                  height: 2048,
                  width: 2048,
                });
                download("export.png", base64);
              }}
            />
            <Button
              variant="primary"
              label="Export SVG"
              onClick={async () => {
                const base64 = await plotly.toImage(this.props.divId, {
                  format: "svg",
                  height: 1024,
                  width: 1024,
                });
                download("export.svg", base64);
              }}
            />
          </SingleSidebarItem>
        </LayoutPanel>
        {this.props.saveCallback && (
          <SingleSidebarItem>
            <Button
              variant="primary"
              label="save"
              onClick={async () => {
                console.log(this.props.data);
              }}
            />
          </SingleSidebarItem>
        )}
      </PanelMenuWrapper>
    );
  }
}
