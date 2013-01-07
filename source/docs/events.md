---
layout: page
title: Events
date: 2012-11-01 18:13:30
---

[Global variable][1] `hexo` itself is a [EventEmitter][2] object. You can listen or emit events.

## Usage

Listen an event:

```
hexo.on('ready', function(){
  ...
});
```

Emit an event:

```
hexo.emit('event', [arg1], [arg2], [….]);
```

[Reference][2]

## Default events

### ready

Called after all configurations and plugins loaded completely.

### generateBefore

Called before generating.

### generateAfter

Called after generating.

### newPost

Called after a new post created. Return an argument `target` which means the absolute path of the new file.

### newPage

Called after a new page created. Return an argument `target` which means the absolute path of the new file.

### serverOn

Called after the server is on.

### previewOn

Called after the preview server is on.

[1]: global-variables.html
[2]: http://nodejs.org/api/events.html#events_class_events_eventemitter