# ImJoy Chart Editor

Displaying and editing interactive charts with [ImJoy](https://imjoy.io) and [Plotly](https://plotly.com/).

## Quick start

In an ImJoy plugin you can create pass data sources to the chart editor with something like this:
```js
const editor = await api.createWindow({src: 'https://imjoy-team.github.io/imjoy-chart-editor/', fullscreen: true, data: {
    dataSources: { data1: [2,2,3,4,5,2,4], data2: [2,2,3,4,5,2,4] }
}})

await editor.addWidget({
    type: 'form', 
    name: 'my form',
    schema: {
        title: "Todo",
        type: "object",
        required: ["title"],
        properties: {
        title: {type: "string", title: "Title", default: "A new task"},
        done: {type: "boolean", title: "Done?", default: false}
        }
    },
    onSubmit(data){
        api.alert(data)
    }
})

await editor.addWidget({
    type:'image',
    name: 'my image',
    src: 'https://via.placeholder.com/150'
})

await editor.addWidget({
    type:'html',
    name: 'my html',
    body: 'a message'
})

await editor.addListener({_
    rintf: true,
    event:'plotly_click',
    callback: ()=>{
        editor.updateWidget({
            type:'html',
            name: 'my html',
            body: 'another message'
        })
    }
})

```
## Acknowledgements

This is built with [`create-react-app`](https://github.com/facebookincubator/create-react-app) from Plotly.