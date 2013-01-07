---
layout: page
title: 安裝
lang: zh-TW
date: 2012-11-01 18:13:30
---

在安裝 Hexo 之前，必須先安裝 [Git][2] 和 [Node.js][1]。

## 目錄

- [Windows](#windows)
- [Mac](#mac)
- [Linux](#linux)

<a id="windows"></a>
## Windows

### Git

下載 [msysgit][7] 並執行即可完成安裝。

### Node.js

在 Windows 環境下安裝 Node.js 非常簡單，僅須 [下載][1] 安裝檔案並執行即可完成安裝。

### Hexo

利用 [npm][3] 即可安裝。

``` bash
npm install -g hexo
```

<a id="mac"></a>
## Mac

### Git

Mac 已內建 Git，雖然版本較舊，不過還是能用，如果你想要使用較新版的 Git 的話，可參考以下方式安裝。

1. 使用 [Homebrew][5]。
	
		brew install git
	
2. 使用 [MacPorts][6]。

		sudo port install git-core
	
3. 使用 [安裝程式][8]。

如果出現錯誤情況，可能是尚未安裝編譯工具，請至 App Store 下載 Xcode。

### Node.js

Mac 環境下有很多安裝方式可供選擇，以下使用 [nvm][4] 來安裝。

執行以下指令。

``` bash
git clone git://github.com/creationix/nvm.git ~/nvm
```

安裝完畢後，在`~/.bash_profile`或`~/.bashrc`加入以下內容並重開一個新的終端機視窗。

``` bash
. ~/nvm/nvm.sh
```

之後即可使用 [nvm][4] 來安裝 Node.js 了，編譯可能需要花些時間，請耐心等候。

``` bash
nvm install v0.8.14
nvm use v0.8.14
nvm alias default v0.8.14
```

### Hexo

利用 [npm][3] 即可安裝。

``` bash
npm install -g hexo
```

<a id="linux"></a>
## Linux

### Git

**Ubuntu, Debian:**

``` bash
sudo apt-get install git-core
```

**Fedora, Red Hat, CentOS:**

``` bash
sudo yum install git-core
```

### Node.js

Linux 環境下有很多安裝方式可供選擇，以下使用 [nvm][4] 來安裝。

執行以下指令。

``` bash
git clone git://github.com/creationix/nvm.git ~/nvm
```

安裝完畢後，在`~/.bash_profile`或`~/.bashrc`加入以下內容並重開一個新的終端機視窗。

``` plain
. ~/nvm/nvm.sh
```

之後即可使用 [nvm][4] 來安裝 Node.js 了，編譯可能需要花些時間，請耐心等候。

``` bash
nvm install v0.8.14
nvm use v0.8.14
nvm alias default v0.8.14
```

### Hexo

利用 [npm][3] 即可安裝。

``` bash
npm install -g hexo
```

[1]: http://nodejs.org/
[2]: http://git-scm.com/
[3]: http://npmjs.org/
[4]: https://github.com/creationix/nvm
[5]: http://mxcl.github.com/homebrew/
[6]: http://www.macports.org/
[7]: http://code.google.com/p/msysgit/
[8]: http://code.google.com/p/git-osx-installer/