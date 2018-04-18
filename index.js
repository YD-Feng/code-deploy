#!/usr/bin/env node

/*
* 下面的代码是基于 Linux（Ubuntu） 系统写的，涉及 Linux 的权限，命令，环境部署方面的知识。
* 如果你已经对这些只是有所掌握，那么你在运行下面代码的过程中应该不会遇到太大的问题
* 否则很可能在运行的过程中碰到各种报错，那应该是环境的问题，和代码本身无关哈... 囧rz...
* */

var q = require('q'),
    path = require('path'),
    colors = require('colors'),
    walk = require('walk'),
    Client = require('ssh2').Client,//依赖库引入

    config = require(path.join(process.cwd(), 'deployFile')),//发布配置
    env = process.argv[2] || 'dev',

    conn = new Client();//连接客户端实例

var srvConfig = config[env].srvConfig,//服务器连接
    srvPath = config[env].srvPath,//服务器目录（目标目录）
    localPath = config[env].localPath;//本地目录（源目录）

//成功连接回调
conn.on('ready', function () {
    console.log(colors.magenta('连接服务器【' + srvConfig.host + '】成功\r\n'));

    conn.exec('rm -rf ' + srvPath, function (err, stream) {
        if (err) throw err;
        console.log(colors.red('移除服务端部署目录\r\n'));

        //请求 SFTP 子系统
        conn.sftp(function (err, sftp) {
            if (err) throw err;

            var dirList = [],
                fileList = [],
                dirPromiseList = [],
                filePromiseList = [],
                dir = path.join(srvPath).replace(/\\/g, '/');

            dirList.push(dir);

            //遍历本地目录（源目录）
            walk.walkSync(localPath, {
                listeners: {
                    //遍历本地目录（源目录） 遍历到目录时...
                    directory: function (root, dirStats, next) {

                        var dir = path.join(srvPath, root.replace(localPath, ''), dirStats.name).replace(/\\/g, '/');

                        //缓存所有目录
                        dirList.push(dir);

                        next();
                    },

                    //遍历本地目录（源目录） 遍历到文件时...
                    file: function (root, fileStats, next) {
                        console.info(root);
                        var _localPath = path.join(root, fileStats.name).replace(/\\/g, '/'),
                            _remotePath = path.join(srvPath, root.replace(localPath, ''), fileStats.name).replace(/\\/g, '/');

                        //缓存所有文件路径与对应的远程文件信息路径
                        fileList.push({
                            localPath: _localPath,
                            remotePath: _remotePath
                        });

                        next();
                    },

                    //遍历本地目录（源目录） 结束后...
                    end: function () {

                        //先在远程服务器创建目录
                        dirList.forEach(function (dir) {
                            var def = q.defer();
                            dirPromiseList.push(def.promise);
                            sftp.mkdir(dir.toString(), function (err) {
                                console.log(colors.green('创建目录 —— ' + dir));
                                def.resolve();
                            });
                        });

                        q.all(dirPromiseList).then(function () {

                            console.log('\r');
                            //目录创建完后，再上传文件
                            fileList.forEach(function (file) {
                                var def = q.defer();
                                filePromiseList.push(def.promise);

                                console.info(file.localPath)

                                sftp.fastPut(file.localPath, file.remotePath, function (err, result) {
                                    if (err) throw err;
                                    console.log(colors.yellow('上传文件 —— ' + file.localPath));
                                    def.resolve();
                                });
                            });

                            q.all(filePromiseList).then(function () {
                                //文件上传完后，断开 SSH 连接
                                conn.end();
                            });

                        })
                    },

                    //遍历本地目录（源目录） 发生错误时...
                    errors: function (root, nodeStatsArray, next) {
                        nodeStatsArray.forEach(function (n) {
                            console.error('[ERROR] ' + n.name);
                            console.error(n.error.message || (n.error.code + ': ' + n.error.path));
                        });

                        next();
                    }
                }
            });

        });
    });
});

//断开 SSH 连接的回调
conn.on('end', function () {
    console.log(colors.magenta('\r\n发布完成'));
});

//创建 SSH 连接
conn.connect(srvConfig);