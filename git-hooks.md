
### git-hooks
我们回到项目的根目录下。运行 ls -a 命令 ———— “-a”可以显示隐藏目录(目录名的第一位是.)。
我们可以看到，存在一个".git"名称的文件夹。
事实上，在我们项目中根目录下运行git命令时，git会根据它来工作。
接来下我们进入到这个文件夹，进一步查看它内部的内容。
```shell
cd .git
ls -a
```
我们发现它内部还挺有料！不慌，我们这节课仅仅只讲到其中的一个内容 ———— hooks
可以看到，当前目录下存在一个hooks文件夹，顾名思义，这个文件夹提供了git 命令相关的钩子。
继续往里看。
```shell
cd hooks
ls -a
```
ok，那我们我们可以看到有很多git命令相关的文件名。比如"pre-commit.sample pre-push.sample"。
回到正题——我们期望在git提交(commit)前，对我们的代码进行检测，如果不能通过检测，就无法提交我们的代码。
那么自然而然的，这个动作的时机应该是？————"pre commit",也就是 commit之前。
那么现在，我们查看一下pre-commit.sample的内容。
``shell
# cat命令可以查看一个文件的内容
cat pre-commit.sample
```
OK，它返回了这样的内容，是一串shell注释。翻译过来大概意思是，这是个示例钩子，然后我们看到了这一句话
```shell
# To enable this hook, rename this file to "pre-commit".
```
意思是要启用这个钩子的话，我们就把这个文件的后缀名去掉。
好的，下面我们直接新增一个新的文件
```shell
vim pre-commit
```
然后内容写入:
```shell
echo pre-commit执行啦
```
好的，现在验证一下，index.js中新增一点内容，然后add. commit. 注意此时我们要回到项目的根目录进行操作。




