title: Generating
prev: writing
next: tag-plugins
---
Generate static files with Hexo is quite easy and fast.

``` bash
$ hexo generate
```

### Watch for File Changes

Hexo can watch for file changes and regenerate files immediately. 

``` bash
$ hexo generate --watch
```

{% note info Restart Hexo after configuration changed %}
Hexo doesn't watch for configuration file changes. You have to restart Hexo to make the new configurations take effects.
{% endnote %}

### Multi-thread Generating

Hexo supports multi-thread generating since 2.0. To enable this feature, edit `_config.yml`.

``` yaml
multi_thread: true
```

You can change how many threads to use. Just edit `multi_thread` with the number of threads. The number of threads is the number of CPU cores by default. It's not recommended to set any value higher than it.

### Deploy After Generating

To deploy after generating, you can run one of the following commands. Both of them are equaled.

``` bash
$ hexo generate --deploy
$ hexo deploy --generate
```