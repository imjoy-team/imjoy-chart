# ImJoy Chart Editor

Displaying and editing interactive charts with Plotly.

This is built with [`create-react-app`](https://github.com/facebookincubator/create-react-app) from Plotly.

## Quick start

In an ImJoy plugin you can create pass data sources to the chart editor with something like this:
```js
    await api.createWindow({src: 'http://localhost:3002/', fullscreen: true, data: {
        sources: { data1: [2,2,3,4,5,2,4], data2: [2,2,3,4,5,2,4] }
    }})
```
