# 项目简介<br />
一个 Node 命令行程序，作用是将本地代码发布到远程服务器<br />
此程序需要 npm 服务器支持（自然是指私服了，天朝的网络环境关系，没法顺利发布到 npm 公服，阿门...）<br />
所以这里默认看这个程序的人，都对 npm 私服，包的发布已掌握，使用文档也是建立在此前提之上的~<br />
至于思路，很简单，代码里也有丰富的注释，有兴趣自行观摩即可，100来行，不多<br />

<br />

首先，安装 code-deploy
```
npm install code-deploy
```

<br /><br />

然后，在项目根目录创建一个 deployFile.js 文件（此项目下就有一个，作为范例），文件内容如下：
```
module.exports = {
    dev: {
        srvConfig: {
            host: '192.168.232.128',
            port: 22,
            username: 'root',
            password: '123456'
        },
        srvPath: '/data/web/test',
        localPath: 'dist'
    },
    test: {
        srvConfig: {
            host: '192.168.232.128',
            port: 22,
            username: 'root',
            password: '123456'
        },
        srvPath: '/data/web/test',
        localPath: 'dist'
    },
    prod: {
        srvConfig: {
            host: '192.168.232.128',
            port: 22,
            username: 'root',
            password: '123456'
        },
        srvPath: '/data/web/test',
        localPath: 'dist'
    }
};
```

<br /><br />

接下来就可以通过执行下面的命令来发布代码了
```
//发布到开发环境
deploy dev

//发布到测试环境
deploy test

//发布到生产环境
deploy prod
```

<br /><br />

# deployFile 配置说明<br />
### dev，test，prod 节点<br />
分别对应开发、测试、生产环境
<br /><br />

### srvConfig<br />
远程服务器基础配置
<br /><br />

### srvConfig.host<br />
远程服务器IP地址
<br /><br />

### srvConfig.port<br />
远程服务器端口号
<br /><br />

### srvConfig.username<br />
远程服务器登录用户名
<br /><br />

### srvConfig.password<br />
远程服务器登录密码
<br /><br />

### srvPath<br />
远程服务器发布目录
<br /><br />

### localPath<br />
本地待发布代码所在目录（基于根目录，如：根目录是 D:\code, localPath 为 dist，就是把 D:\code\dist 下的代码发布到远程服务器指定目录下，但不包含 dist 目录本身）
<br /><br />

