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
import Field from "react-chart-editor/lib/components/fields/Field";
import Logo from "react-chart-editor/lib/components/widgets/Logo";
import NumericInput from "react-chart-editor/lib/components/widgets/NumericInput";
import DropdownWidget from "react-chart-editor/lib/components/widgets/Dropdown";
import TextInput from "react-chart-editor/lib/components/widgets/TextInput";

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
  constructor(props) {
    super(props);
    this.inputFile = React.createRef();
    this.exportWidth = 1024;
    this.exportHeight = 1024;
    this.exportFormat = "png";
    this.exportFileName = "imjoy-chart-export";
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
    const exportChart = async (format) => {
      format = format || this.exportFormat;
      const base64 = await plotly.toImage(this.props.divId, {
        format: format,
        height: this.exportHeight,
        width: this.exportWidth,
      });
      download(
        this.exportFileName + "." + format.replace("full-json", "json"),
        base64
      );
    };
    return (
      <PanelMenuWrapper menuPanelOrder={this.props.menuPanelOrder}>
        {logo ? logo : null}
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
          <PlotlyFold>
            <Field label="Width">
              <NumericInput
                value={this.exportWidth}
                onChange={(v) => {
                  this.exportWidth = v;
                  this.forceUpdate();
                }}
                onUpdate={(v) => {
                  this.exportWidth = v;
                  this.forceUpdate();
                }}
                units="px"
              />
            </Field>
            <Field label="Height">
              <NumericInput
                value={this.exportHeight}
                onChange={(v) => {
                  this.exportHeight = v;
                  this.forceUpdate();
                }}
                onUpdate={(v) => {
                  this.exportHeight = v;
                  this.forceUpdate();
                }}
                units="px"
              />
            </Field>

            <Field label="Format">
              <DropdownWidget
                options={[
                  { label: "PNG", value: "png" },
                  { label: "JPEG", value: "jpeg" },
                  { label: "WEBP", value: "webp" },
                  { label: "SVG", value: "svg" },
                  { label: "JSON", value: "full-json" },
                ]}
                value={this.exportFormat}
                onChange={(v) => {
                  this.exportFormat = v;
                  this.forceUpdate();
                }}
                clearable={false}
              />
            </Field>
            <Field label="File Name">
              <TextInput
                value={this.exportFileName}
                defaultValue={this.exportFileName}
                onUpdate={(v) => {
                  this.exportFileName = v;
                  this.forceUpdate();
                }}
              />
            </Field>

            <Field>
              <Button variant="primary" label="Export" onClick={exportChart} />
            </Field>
          </PlotlyFold>
        </LayoutPanel>
        <SingleSidebarItem>
          <input
            type="file"
            onChange={(e) => {
              this.props.handleLoadData(e.target.files[0]);
            }}
            ref={this.inputFile}
            style={{ display: "none" }}
          />
          <Button
            variant="primary"
            label="Load"
            onClick={() => {
              this.inputFile.current.click();
            }}
          />
        </SingleSidebarItem>

        <SingleSidebarItem>
          <Button
            variant="primary"
            label="save"
            onClick={async () => {
              if (this.props.handleSaveData)
                this.props.handleLoadData(this.props.data);
              else exportChart("full-json");
            }}
          />
        </SingleSidebarItem>
      </PanelMenuWrapper>
    );
  }
}
