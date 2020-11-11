### 安装

```
tnpm run init
```

### 调试

```
tnpm run dev
```

如果需要调试 Oasis 引擎源码，请先 link 再进行调试，即：

```
tnpm run link
tnpm run dev

# link 只需要一次，以后只需要 dev 即可
tnpm run dev
```

如果需要取消 link ，运行：

```
tnpm run reinstall
```

如果需要监听引擎源码的变化，即同时调试引擎和游乐场，运行：

```
tnpm run dev:watch
```

> 注意： 默认 Oasis 引擎仓库在 ../oasis3d，若不是，请自行修改 script

### 发布

push 到 master 分支后会自动进行校验和发布，如果需要手动 build，可执行：

```
npm run build
```

### 缩略图模式

在案例下添加一张 avatar.jpg | avatar.png ,即可自动切换缩略图模式

### 连通 Riddle 等代码平台

在项目下新建 `code.json`,目前只支持 [riddle](https://riddle.alibaba-inc.com/),配置如下：

```
{
    "riddle":"https://*****"
}
```

### 注意

目前 build 使用 snowpack 是因为 vite 还不支持 mpa 打包，但是已在开发中，后续将统一使用 vite 环境
