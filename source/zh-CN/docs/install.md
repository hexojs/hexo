---
layout: page
title: 安装
lang: zh-CN
date: 2013-02-18 19:41:43
---

在安装 Hexo 之前，必须先安装 [Git][2] 和 [Node.js][1]。

## 目录

- [Windows](#windows)
- [Mac](#mac)
- [Linux](#linux)

<a id="windows"></a>
## Windows

### Git

下载 [msysgit][7] 并执行即可完成安装。

### Node.js

在 Windows 环境下安装 Node.js 非常简单，仅须 [下载][1] 安装文件并执行即可完成安装。

### Hexo

利用 [npm][3] 即可安装。

``` bash
npm install -g hexo
```

<a id="mac"></a>
## Mac

### Git

Mac 已内建 Git，虽然版本较旧，不过还是能用，如果你想要使用较新版的 Git 的话，可参考以下方式安装。

1. 使用 [Homebrew][5]。

		brew install git

2. 使用 [MacPorts][6]。

		sudo port install git-core

3. 使用 [安装程式][8]。

如果出现错误情况，可能是尚未安装编译工具，请至 App Store 下载 Xcode。

### Node.js

Mac 环境下有很多安装方式可供选择，以下使用 [nvm][4] 来安装。

执行以下指令。

``` bash
git clone git://github.com/creationix/nvm.git ~/nvm
```

安装完毕后，在`~/.bash_profile`或`~/.bashrc`加入以下内容并重开一个新的终端视窗。

``` bash
. ~/nvm/nvm.sh
```

之后即可使用 [nvm][4] 来安装 Node.js 了，编译可能需要花些时间，请耐心等候。

``` bash
nvm install v0.8.14
nvm use v0.8.14
nvm alias default v0.8.14
```

### Hexo

利用 [npm][3] 即可安装。

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

Linux 环境下有很多安装方式可供选择，以下使用 [nvm][4] 来安装。

执行以下指令。

``` bash
git clone git://github.com/creationix/nvm.git ~/nvm
```

安装完毕后，在`~/.bash_profile`或`~/.bashrc`加入以下内容并重开一个新的终端视窗。

``` plain
. ~/nvm/nvm.sh
```

之后即可使用 [nvm][4] 来安装 Node.js 了，编译可能需要花些时间，请耐心等候。

``` bash
nvm install v0.8.14
nvm use v0.8.14
nvm alias default v0.8.14
```

### Hexo

利用 [npm][3] 即可安装。

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