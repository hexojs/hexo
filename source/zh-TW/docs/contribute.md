---
layout: page
title: 貢獻
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 回報錯誤

當你使用Hexo時，如果發現錯誤的話，請在GitHub上回報，如果有任何建議的話，也歡迎提出。

[回報問題][1]

## 撰寫文件

當發現文件有不足或訛誤時，你可以：

1. Fork 本專案
2. 根據 **site** 分支建立新分支
3. 修改文件
4. 發送 Pull Request 到 **site** 分支

如果想要幫忙翻譯文件，請在`source`文件夾開一個新的資料夾，並將原始檔案複製進去。例如：

``` plain
zh-TW
|-- docs
|-- index.md
|-- plugins
|-- themes
```

並在每個文章新增語言參數，例如：

``` plain
---
layout: page
title: 貢獻
lang: zh-TW
date: 2012-11-01 18:13:30
---
```

語言碼請依照 [IETF 格式][3] 命名。

[原始碼][2]

## 參與開發

如果你想要參與開發，你可以：

1. Fork 本專案
2. 開新分支
3. 新功能開發完成後，發送 Pull Request 到 **dev** 分支

如果你開發了很棒的外掛的話，也可以發送 Pull Request，也許你開發的外掛能夠併入主程式！

[原始碼][4]

[1]: https://github.com/tommy351/hexo/issues
[2]: https://github.com/tommy351/hexo/tree/site
[3]: http://www.w3.org/International/articles/language-tags/
[4]: https://github.com/tommy351/hexo