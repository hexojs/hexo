---
layout: page
title: Contribute
date: 2012-11-01 18:13:30
---

## Report Issues

You may have found some bugs when using Hexo, or have some questions and recommendations. Feel free to submit them on GitHub.

You can clone the **dev** branch on GitHub to try the new features. It's updated everyday!

```
npm install -g https://github.com/tommy351/hexo/archive/dev.tar.gz
```

[Report an issue][1]

## Write Docs

If you found there's an error in the docs, you can:

1. Fork this project
2. Create a new branch based on **site** branch
3. Edit the docs
4. Submit a pull request to **site** branch

If you want to help translate the docs, create a new folder in `source` folder and copy source files into it. For example:

``` plain
zh-TW
|-- docs
|-- index.md
|-- plugins
|-- themes
```

And add language setting in every posts like this:

``` plain
---
layout: page
title: 貢獻
lang: zh-TW
date: 2012-11-01 18:13:30
---
```

Please follow the [IETF format][3].

[Source code][2]

## Participate

If you want to participate in the development, you can:

1. Fork this project
2. Create a new branch
3. Submit a pull request to **dev** branch after the new feature is done

If you make an awesome plugin, you can submit a pull request, too. The plugin you developed may be a part of the main program!

[Source code][4]

[1]: https://github.com/tommy351/hexo/issues
[2]: https://github.com/tommy351/hexo/tree/site
[3]: http://www.w3.org/International/articles/language-tags/
[4]: https://github.com/tommy351/hexo