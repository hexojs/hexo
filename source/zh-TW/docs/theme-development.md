---
layout: page
title: 主題開發
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 結構

``` plain
|-- _config.yml
|-- languages
|-- layout
|-- source
```

### _config.yml

主題的設定檔案。

參考：[設定][1]

### languages

主題的語言檔案。

參考：[國際化（i18n）][2]

### layout

樣板資料夾。你可使用 [EJS][4] 或 [Swig][5] 處理模版檔案，或安裝 [Renderer 外掛][8] 以使用你喜愛的樣板引擎。

基礎布局：

- **archive** - 網誌彙整，若無此樣板則使用 **index** 布局。
- **category** - 分類彙整，若無此樣板則使用 **archive** 布局。
- **index** - 首頁
- **page** - 分頁，若無此樣板則使用 **index** 布局。
- **post** - 文章，若無此樣板則使用 **index** 布局。
- **tag** - 標籤彙整，若無此樣板則使用 **archive** 布局。

你也可以在主題中自定其他布局，例如`link`或`photo`之類的，若找不到自定的布局的話，則會根據 Generator 的不同，使用相對應的布局代替。

*（至少要有**index**布局）*

### source

原始檔資料夾，CSS、JavaScript等檔案（Asset）應放置於此資料夾。此資料夾內的檔案在經過處理後會被複製至`public`資料夾，檔案或資料夾名稱開頭為`.`（點）或`_`（底線）的會被忽略。

Hexo 內建 [Stylus][6] 及 [nib][7] 支援，你可安裝 [Renderer 外掛][8] 讓 Hexo 支援更多檔案格式。

## 參考

你可參考預設主題 [Light][3] 來製作主題。

[1]: configure.html
[2]: global-variables.html#i18n
[3]: https://github.com/tommy351/hexo-theme-light
[4]: https://github.com/visionmedia/ejs
[5]: http://paularmstrong.github.com/swig/
[6]: http://learnboost.github.com/stylus/
[7]: http://visionmedia.github.com/nib/
[8]: ../plugins/#renderer