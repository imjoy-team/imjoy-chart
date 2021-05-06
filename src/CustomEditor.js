import React from 'react';
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
} from 'react-chart-editor';

import Logo from 'react-chart-editor/lib/components/widgets/Logo';

export default class CustomEditor extends DefaultEditor {
  render() {
    const _ = this.context.localize;
    const logo = this.props.logoSrc && <Logo src={this.props.logoSrc} />;
    return (
      <PanelMenuWrapper menuPanelOrder={this.props.menuPanelOrder}>
        {logo ? logo : null}
        <GraphCreatePanel group={_('Structure')} name={_('Traces')} />
        <GraphSubplotsPanel group={_('Structure')} name={_('Subplots')} />
        {this.hasTransforms() && (
          <GraphTransformsPanel group={_('Structure')} name={_('Transforms')} />
        )}
        <StyleLayoutPanel group={_('Style')} name={_('General')} />
        <StyleTracesPanel group={_('Style')} name={_('Traces')} />
        {this.hasAxes() && <StyleAxesPanel group={_('Style')} name={_('Axes')} />}
        {this.hasMaps() && <StyleMapsPanel group={_('Style')} name={_('Maps')} />}
        {this.hasLegend() && <StyleLegendPanel group={_('Style')} name={_('Legend')} />}
        {this.hasColorbars() && <StyleColorbarsPanel group={_('Style')} name={_('Color Bars')} />}
        <StyleNotesPanel group={_('Annotate')} name={_('Text')} />
        <StyleShapesPanel group={_('Annotate')} name={_('Shapes')} />
        <StyleImagesPanel group={_('Annotate')} name={_('Images')} />
        {this.hasSliders() && <StyleSlidersPanel group={_('Control')} name={_('Sliders')} />}
        {this.hasMenus() && <StyleUpdateMenusPanel group={_('Control')} name={_('Menus')} />}
        {this.props.children ? this.props.children : null}        
      
      {/* ---custom widgets-- */}
      <LayoutPanel group="Metadata" name="info">
        <PlotlyFold name="PlotlyFold">
          <Info attr="title">
            <p>
              This custom editor demonstrates the general-purpose container and field components.
            </p>
            <p>
              This is an <code>Info</code> component.
            </p>
          </Info>
        </PlotlyFold>
      </LayoutPanel>
      <SingleSidebarItem>
        <Button variant="primary" label="export" onClick={() => alert('save button clicked!')} />
      </SingleSidebarItem>
    </PanelMenuWrapper>
      
    );
  }
}
