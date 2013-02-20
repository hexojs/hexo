---
layout: page
title: 贡献
lang: zh-CN
date: 2013-02-18 18:40:43
---

## 汇报错误

当你使用Hexo时，如果发现错误的话，请在GitHub上汇报，如果有任何建议的话，也欢迎提出。

你可从GitHub上复制**dev**分支尝鲜，几乎每天都有新玩意！

```
npm install -g https://github.com/tommy351/hexo/archive/dev.tar.gz
```

[汇报问题][1]

## 撰写文件

当发现文件有不足或错误时，你可以：

1. Fork 本专案
2. 根据 **site** 分支建立新分支
3. 修改文件
4. 发送 Pull Request 到 **site** 分支

如果想要帮忙翻译文件，请在`source`文件夹开一个新的文件夹，并将原始文件复制进去。例如：

``` plain
zh-CN
|-- docs
|-- index.md
|-- plugins
|-- themes
```

并在每个文章新增语言参数，例如：

``` plain
---
layout: page
title: 贡献
lang: zh-CN
date: 2013-02-19 09:56:45
---
```

语言码请依照 [IETF 格式][3] 命名。

[原始码][2]

## 参与开发

如果你想要参与开发，你可以：

1. Fork 本专案
2. 开新分支
3. 新功能开发完成后，发送 Pull Request 到 **dev** 分支

如果你开发了很棒的插件的话，也可以发送 Pull Request，也许你开发的插件能够合并主程序！

[原码][4]

[1]: https://github.com/tommy351/hexo/issues
[2]: https://github.com/tommy351/hexo/tree/site
[3]: http://www.w3.org/International/articles/language-tags/
[4]: https://github.com/tommy351/hexo