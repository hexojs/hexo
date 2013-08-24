title: Events
prev: models
next: plugins
---
Hexo inherits EventEmitter of Node.js. You can subscribe or publish specified events. For example:

``` js
hexo.on('ready', function(){
  console.log('Hexo is ready to go!');
});
```

## Methods

All methods except `emit` returns the emitter itself, so calls can be chained.

### addListener(event, listener)
### on(event, listener)

Listens to the specific event.

### once(event, listener)

Listens to the specified event **only once**. After the event is fired, the listener will be removed.

### removeListener(event, listener)

Removes a listener from the specified event.

### removeAllListeners([event])

Removes all listeners.

### emit(event, [arg1], [arg2], […])

Fires the specified event. Returns `true` if event had listener, `false` otherwise.

## Events

### ready

Called once Hexo is initialized.

### generateBefore

Called before generating.

### generateAfter

Called after generating.

### processBefore

Called before processing.

### processAfter

Called after processing.

### new

Called after a new post file is created.

Argument | Description
--- | ---
`target` | Absolute path of the post file

### server

Called after server is on.

### exit

Called when Hexo exits.