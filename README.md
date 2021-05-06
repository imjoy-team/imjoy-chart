# ImJoy Chart Editor

Displaying and editing interactive charts with [ImJoy](https://imjoy.io) and [Plotly](https://plotly.com/).

## Quick start

In an ImJoy plugin you can create pass data sources to the chart editor with something like this:
```js
    await api.createWindow({src: 'https://imjoy-team.github.io/imjoy-chart-editor/', fullscreen: true, data: {
        data_sources: { data1: [2,2,3,4,5,2,4], data2: [2,2,3,4,5,2,4] }
    }})
```
## Acknowledgements

This is built with [`create-react-app`](https://github.com/facebookincubator/create-react-app) from Plotly.