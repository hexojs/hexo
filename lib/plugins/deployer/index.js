var deployer = hexo.extend.deployer;

deployer.register('git', require('./git'));
deployer.register('github', require('./github'));
deployer.register('heroku', require('./heroku'));
deployer.register('openshift', require('./openshift'));
deployer.register('rsync', require('./rsync'));