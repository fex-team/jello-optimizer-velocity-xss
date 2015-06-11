jello-optimizer-velocity-xss
====================

自动将*内容区*的变量加 `$esc.html` 包裹。

在 `#script()#end` 中的用 `$esc.javascript` 包裹。

## 使用

安装

```bash
npm install -g jello-optimizer-velocity-xss
```

启用插件

```javascript
fis.config.set('modules.optimizer.vm', 'velocity-xss');

```

## 配置项

目前只有 `blacklist` 一个配置项。数组格式，元素为正则对象。

```javascript
fis.config.set('settings.optimizer.velocity-xss', {
  blacklist: [
    /^foo/i, // foo 打头的变量不进行转换。
  ]
});
```
