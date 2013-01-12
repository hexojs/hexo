---
layout: page
title: Install
date: 2012-11-01 18:13:30
---

Before installing Hexo, you should install [Git][2] & [Node.js][1] first.

## Contents

- [Windows](#windows)
- [Mac](#mac)
- [Linux](#linux)

<a id="windows"></a>
## Windows

### Git

Download & execute [msysgit][7].

### Node.js

It's very easy to install Node.js. Just [download][1] the installer and execute it.

### Hexo

Use [npm][3] to install.

``` bash
npm install -g hexo
```

<a id="mac"></a>
## Mac

### Git

Mac has already built-in an older version Git. If you want to update it, you can try the following way.

1. Use [Homebrew][5].
	
		brew install git
	
2. Use [MacPorts][6].

		sudo port install git-core
	
3. Use [Installer](http://code.google.com/p/git-osx-installer/).

If an error occurred, maybe it's because you didn't install the compiler first, please go to App Store, download & install Xcode.

### Node.js

There are many way to install Node.js in Mac. We use [nvm][4] to install it.

Execute the following command.

``` bash
git clone git://github.com/creationix/nvm.git ~/nvm
```

After the installation is done, add the following content in `~/.bash_profile` or `~/.bashrc` and open a new terminal window.

```
. ~/nvm/nvm.sh
```

Then you can install Node.js with [nvm][4]. It takes time to compile. Be patiently.

``` bash
nvm install v0.8.14
nvm use v0.8.14
nvm alias default v0.8.14
```

### Hexo

Use [npm][3] to install.

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

There are many way to install Node.js in Linux. We use [nvm][4] to install it.

Execute the following command.

``` bash
git clone git://github.com/creationix/nvm.git ~/nvm
```

After the installation is done, add the following content in `~/.bash_profile` or `~/.bashrc` and open a new terminal window.

``` plain
. ~/nvm/nvm.sh
```

Then you can install Node.js with [nvm][4]. It takes time to compile. Be patiently.

``` bash
nvm install v0.8.14
nvm use v0.8.14
nvm alias default v0.8.14
```

### Hexo

Use [npm][3] to install.

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