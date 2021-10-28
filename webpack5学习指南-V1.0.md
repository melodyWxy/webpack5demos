#  〇、课程介绍

# 一、基础应用篇

## 1.1 为什么需要 Webpack

想要理解为什么要使用 webpack，我们先回顾下历史，在打包工具出现之前，我们是如何在 web 中使用 JavaScript 的。在浏览器中运行 JavaScript 有两种方法：

**第一种方式**，引用一些脚本来存放每个功能，比如下面这个文档：

>**01-why-webpack/index-1.html**
>
>```html
><!DOCTYPE html>
><html lang="en">
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
></head>
><body>
>  <!-- HTML 代码 -->
>  <div>我的HTML代码</div>
>
>  <!-- 引入外部的 JavaScript 文件 -->
>  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
>  <script src="https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.core.min.js"></script>
>  <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.0.2/js/bootstrap.min.js"></script>
>
>  <!-- 引入我自己的 JavaScript 文件 -->
>  <script src="./scripts/common.js"></script>
>  <script src="./scripts/user.js"></script>
>  <script src="./scripts/authentication.js"></script>
>  <script src="./scripts/product.js"></script>
>  <script src="./scripts/inventory.js"></script>
>  <script src="./scripts/payment.js"></script>
>  <script src="./scripts/checkout.js"></script>
>  <script src="./scripts/shipping.js"></script>
></body>
></html>
>```

此解决方案很难扩展，因为加载太多脚本会导致网络瓶颈。同时如果你不小心更改了JavaScript文件的加载顺序，这个项目可能要崩溃。

**第二种方式**，使用一个包含所有项目代码的大型 `.js` 文件, 对上面的文档做改进：

> **01-why-webpack/index-2.html**
>
> ```html
> <!DOCTYPE html>
> <html lang="en">
> <head>
>   <meta charset="UTF-8">
>   <meta http-equiv="X-UA-Compatible" content="IE=edge">
>   <meta name="viewport" content="width=device-width, initial-scale=1.0">
>   <title>千锋大前端教研院-Webpack5学习指南</title>
> </head>
> <body>
>   <!-- HTML 代码 -->
>   <div>我的HTML代码</div>
> 
>   <!-- 引入我自己的 JavaScript 文件 -->
>   <script src="./scripts/bundle.33520ba89e.js"></script>
> </body>
> </html>
> ```

这种方式解决了方式一的问题，但会导致作用域、文件大小、可读性和可维护性方面的问题。如何解决这些问题，请往下阅读。

### 1.1.1 如何解决作用域问题

早先前，我们使用 `Grunt` 和 `Gulp` 两个工具来管理我们项目的资源。

<img src="./images/grunt-logo.png" width="200" style="display: inline-block;"/>
<img src="./images/gulp-logo.png" width="200" style="display: inline-block;"/>

这两个工具称为任务执行器，它们将所有项目文件拼接在一起。利用了`立即调用函数表达式(IIFE) - Immediately invoked function expressions`, 解决了大型项目的作用域问题；当脚本文件被封装在 IIFE 内部时，你可以安全地拼接或安全地组合所有文件，而不必担心作用域冲突。

什么是IIFE，参见下面的代码：

> - 当函数变成立即执行的函数表达式时，表达式中的变量不能从外部访问。
>
> ```js
> (function () {
> 	var name = "Barry";
> })();
> // 无法从外部访问变量 name
> name // 抛出错误："Uncaught ReferenceError: name is not defined"
> ```
>
> - 将 IIFE 分配给一个变量，不是存储 IIFE 本身，而是存储 IIFE 执行后返回的结果。
>
> ```js
> var result = (function () {
>  var name = "Barry";
>  return name;
> })();
> // IIFE 执行后返回的结果：
> result; // "Barry"
> ```

`Grunt`，`Gulp` 解决了作用域问题。但是，修改一个文件意味着必须重新构建整个文件。拼接可以做到很容易地跨文件重用脚本，却使构建结果的优化变得更加困难。如何判断代码是否实际被使用？

即使你只用到 lodash 中的某个函数，也必须在构建结果中加入整个库，然后将它们压缩在一起。大规模地实现延迟加载代码块及无用代码的去除，需要开发人员手动地进行大量工作。

> **01-why-webpack/index-3.html**
>
> ```html
> <!DOCTYPE html>
> <html lang="en">
> <head>
>   <meta charset="UTF-8">
>   <meta http-equiv="X-UA-Compatible" content="IE=edge">
>   <meta name="viewport" content="width=device-width, initial-scale=1.0">
>   <script src="https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
>   <title>千锋大前端教研院-Webpack5学习指南</title>
> </head>
> <body>
>   <script>
>      // 这里我们只使用了一个join函数，确要引入整个lodash库
>      const str = _.join(['千锋大前端教研院', 'Webpack5学习指南'], '-')
>      console.log(str)
>   </script>
> </body>
> </html>
> ```

### 1.1.2 如何解决代码拆分问题

感谢 `Node.js`，**JavaScript 模块**诞生了！

Node.js 是一个 JavaScript 运行时，可以在浏览器环境之外的计算机和服务器中使用。webpack 运行在 Node.js 中。

当 Node.js 发布时，一个新的时代开始了，它带来了新的挑战。既然不是在浏览器中运行 JavaScript，现在已经没有了可以添加到浏览器中的 html 文件和 script 标签。那么 Node.js 应用程序要如何加载新的代码文件呢？

CommonJS 问世并引入了 `require` 机制，它允许你在当前文件中加载和使用某个模块。导入需要的每个模块，这一开箱即用的功能，帮助我们解决了代码拆分的问题。

<img src="./images/common-js.jpeg" />

`Node.js` 已经成为一种语言、一个平台和一种快速开发和创建快速应用程序的方式，接管了整个 `JavaScript` 世界。

但 CommonJS 没有浏览器支持。没有 [live binding(实时绑定)](https://medium.com/webpack/the-state-of-javascript-modules-4636d1774358)。循环引用存在问题。同步执行的模块解析加载器速度很慢。虽然 CommonJS 是 Node.js 项目的绝佳解决方案，但浏览器不支持模块，我们似乎又遇到了新问题。

### 1.1.3 如何让浏览器支持模块

在早期，我们应用`Browserify`和 `RequireJS`  等打包工具编写能够在浏览器中运行的 CommonJS 模块:

<img src="./images/browserify.png" align="left" width="300"/>

<img src="./images/require-logo.png" align="left">



目前，我们还有一个选择，就是来自 Web 项目的好消息是，模块正在成为 ECMAScript 标准的官方功能。然而，浏览器支持不完整，版本迭代速度也不够快，还是推荐上面两个早期模块实现。早期的任务构建工具基于 Google 的 Closure 编译器，要求我们手动在顶部声明所有的依赖，开发体验不好。

### 1.1.4 Webpack 搞定这一切

是否可以有一种方式，不仅可以让我们编写模块，而且还支持任何模块格式（至少在我们到达 ESM 之前），并且可以同时处理 `resource` 和 `assets`？

这就是 `webpack` 存在的原因。它是一个工具，可以打包你的 JavaScript 应用程序（支持 ESM 和 CommonJS），可以扩展为支持许多不同的静态资源，例如：`images`, `fonts` 和 `stylesheets`。

`webpack` 关心性能和加载时间；它始终在改进或添加新功能，例如：异步地加载和预先加载代码文件，以便为你的项目和用户提供最佳体验。

![image-20210921075333974](./images/image-webpack.png)



### 1.1.5 Webpack 与竞品

- Webpack

`Webpack` 为处理资源管理和分割代码而生，可以包含任何类型的文件。灵活，插件多。

- Parcel

`Parcel` 是 0 配置工具， 用户一般无需再做其他配置即可开箱即用。

- Rollup

`Rollup` 用标准化的格式（es6）来写代码，通过减少死代码尽可能地缩小包体积。一般只用来打包JS。

**小结论：**

构建一个简单的应用并让它快速运行起来？使用 Parcel。

构建一个类库只需要导入很少第三方库？使用 Rollup。

构建一个复杂的应用，需要集成很多第三方库？需要代码分拆，使用静态资源文件，还有 CommonJS 依赖？使用 webpack。

- Vite

在刚刚结束的 VueConf2021 中，除了 Vue 3.0 以外，另外一个亮点就是下一代构建工具 Vite 了。

在尤雨溪分享的【 **Vue 3 生态进展和计划**】的演讲中，尤大神还特意提到 **Vite 将成为 Vue 的现代标配**。甚至最近新推出的 Petite Vue 从开发、编译、发布、Demo几乎全都是使用 Vite 完成。

<img src="./images/vite.png" align="left">

Vite 这种基于 ESmodule 的构建方式会日益受到用户青睐，不仅因为 Vite 按需编译，热模块替换等特性，还有其丝滑的开发体验以及和 Vue 3 的完美结合。

按照这种说法，也许有人会问：是不是马上 **Webpack 就要被取代了， Vite 的时代就要到来了呢？**

**Webpack、Vite** 作为前端热门的工程化构建工具，它们都有各自的适用场景，并不存在“取代”这一说法。



## 1.2 小试 Webpack

### 1.2.1 开发准备

在进入Webpack世界之前，我们先来用原生的方法构建一个Web应用。

一个JavaScript文件，编写一段通用的函数`helloWorld`：

> 02-setup-app/src/hello-world.js
>
> ```js
> function helloWorld() {
>   	console.log('Hello world')
> }
> ```

再创建一个JavaScript文件，调用这个函数：

>02-setup-app/src/index.js
>
>```js
>helloWorld()
>```

最后创建一个 html 页面去引用这两个JS文件：

> 02-setup-app/index.html
>
> ```html
> <!DOCTYPE html>
> <html lang="en">
> <head>
>   <meta charset="UTF-8">
>   <meta http-equiv="X-UA-Compatible" content="IE=edge">
>   <meta name="viewport" content="width=device-width, initial-scale=1.0">
>   <title>千锋大前端教研院-Webpack5学习指南</title>
> </head>
> <body>
>     <!-- 注意这里的js文件的引用顺序要正确 -->
>     <script src="./src/index.js"></script>
>     <script src="./src/hello-world.js"></script>
> </body>
> </html>
> ```

正常同步的 JavaScript 代码是按照在页面上加载的顺序执行的，上面html文件先引用 `index.js`文件，后引用 `hello-world.js` 文件，由于两个文件的代码存在先定义后才能调用的顺序关系，所以浏览器运行后会报以下错误：

<img src="./images/img-02-01.png" width="500" align="left" />

调整 JS 文件的引用顺序：

```html
<body>
  <!-- 注意这里的js文件的引用顺序要正确 -->
  <script src="./src/hello-world.js"></script>
  <script src="./src/index.js"></script>
</body>
```

在浏览器运行后输出如下：

<img src="./images/img-02-02.png" width="500" align="left" />

如果页面引用的JS文件很少，我们可以手动的来调整顺序，但页面一旦引用大量的JS文件，调整顺序的心智负担和工作量可想而知，如何解决？我们就要有请 `Webpack`了。

### 1.2.2 安装 Webpack

- **前提条件**

在开始之前，请确保安装了 [Node.js](https://nodejs.org/en/) 的最新版本。使用 Node.js 最新的长期支持版本(LTS - Long Term Support)，是理想的起步。 使用旧版本，你可能遇到各种问题，因为它们可能缺少 webpack 功能， 或者缺少相关 package。

<img src="./images/img-02-03.png" width="600" align="left" />

你可以选择下载适合自己平台的安装包，自行安装即可，本文不再赘述。

- **本地安装**

最新的 webpack 正式版本是：

[![GitHub release](https://img.shields.io/npm/v/webpack.svg?label=webpack&style=flat-square&maxAge=3600)](https://github.com/webpack/webpack/releases)

要安装最新版本或特定版本，请运行以下命令之一：

```bash
npm install --save-dev webpack
# 或指定版本
npm install --save-dev webpack@<version>
```

>**提示：**
>
>是否使用 `--save-dev` 取决于你的应用场景。假设你仅使用 webpack 进行构建操作，那么建议你在安装时使用 `--save-dev` 选项，因为可能你不需要在生产环境上使用 webpack。如果需要应用于生产环境，请忽略 `--save-dev` 选项。

如果你使用 webpack v4+ 版本，并且想要在命令行中调用 `webpack`，你还需要安装 [CLI](https://webpack.docschina.org/api/cli/)。

```bash
npm install --save-dev webpack-cli
```

对于大多数项目，我们建议本地安装。这可以在引入重大更新(breaking change)版本时，更容易分别升级项目。 通常会通过运行一个或多个 [npm scripts](https://docs.npmjs.com/misc/scripts) 以在本地 `node_modules` 目录中查找安装的 webpack， 来运行 webpack：

```json
"scripts": {
  "build": "webpack --config webpack.config.js"
}
```

>**提示：**
>
>想要运行本地安装的 webpack，你可以通过 `node_modules/.bin/webpack` 来访问它的二进制版本。另外，如果你使用的是 npm v5.2.0 或更高版本，则可以运行 `npx webpack` 来执行。

- **全局安装**

通过以下 NPM 安装方式，可以使 `webpack` 在全局环境下可用：

```bash
npm install --global webpack
```

> **提示：**
>
> **不推荐** 全局安装 webpack。这会将你项目中的 webpack 锁定到指定版本，并且在使用不同的 webpack 版本的项目中， 可能会导致构建失败。

- **最新体验版本**

如果你热衷于使用最新版本的 webpack，你可以使用以下命令安装 beta 版本， 或者直接从 webpack 的仓库中安装：

```bash
npm install --save-dev webpack@next
# 或特定的 tag/分支
npm install --save-dev webpack/webpack#<tagname/branchname>
```

>**提示：**
>
>安装这些最新体验版本时要小心！它们可能仍然包含 bug，因此不应该用于生产环境。

- **我们的安装**

根据以上的各种情景，在我们的项目中安装 Webpack：

```shell
# 当前目录: 任意你的目录/webpack5
[felix] webpack5 $ npm install webpack webpack-cli
```

### 1.2.3 运行 Webpack

Webpack安装好了以后，就可以在项目环境里运行了。在运行之前，我们先修改一下代码：

>03-try-webpack/src/hello-world.js
>
>```js
>function helloWorld() {
>     	console.log('Hello world')
>}
>
>// 导出函数模块
>export default helloWorld
>```

>03-try-webpack/src/index.js
>
>```js
>// 导入函数模块
>import helloWorld from './hello-world.js'
>
>helloWorld()
>```

>03-try-webpack/index.html
>
>```html
><!DOCTYPE html>
><html lang="en">
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
></head>
><body>
>  	<script src="./src/index.js"></script>
></body>
></html>
>```

进入项目目录，运行 Webpack，结果如下：

```shell
[felix] 03-try-webpack $ npx webpack
asset main.js 50 bytes [emitted] [minimized] (name: main)
orphan modules 81 bytes [orphan] 1 module
./src/index.js + 1 modules 135 bytes [built] [code generated]

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

webpack 5.54.0 compiled with 1 warning in 197 ms
```

在这里，我们在没有任何配置的情况下运行 Webpack<font style="color: #666">（通常你会为 Webpack 提供一个配置文件，现在，自Webpack4 开始，可以使用默认配置来打包文件了）</font>。

这里还有一个警告：“mode” 选项尚未设置。我们将在本课程后面讨论“mode”选项。

从结果来看，webpack 为我们生成了一个main.js文件，具体见下图：

<img src="./images/img-02-04.png" style="zoom:50%;" align="left" />

我们来看一下 `main.js`里有什么：

>03-try-webpack/dist/main.js
>
>```js
>(()=>{"use strict";console.log("Hello world")})();
>```

生成的代码非常简洁。这时你可能不禁会问，这个代码是从哪些文件里生成出来的呢？回到终端，我们再运行一下命令：

```shell
[felix] 03-try-webpack $ npx webpack --stats detailed
PublicPath: auto
asset main.js 50 bytes {179} [compared for emit] [minimized] (name: main)
Entrypoint main 50 bytes = main.js
chunk {179} (runtime: main) main.js (main) 180 bytes [entry] [rendered]
  > ./src  main
orphan modules 103 bytes [orphan] 1 module
./src/index.js + 1 modules [860] 180 bytes {179} [depth 0] [built] [code generated]
  [no exports]
  [no exports used]

......
```

我们看到， `asset main.js` 是从入口 `> ./src  main` 生成的。那么，我们能自己配置这个入口吗？请看下一节，自定义 Webpack 配置。

### 1.2.4 自定义 Webpack 配置
实际上，`webpack-cli` 给我们提供了丰富的终端命令行指令，可以通过 `webpack --help`来查看：

```shell
[felix] 03-try-webpack $ npx webpack --help
Usage: webpack [entries...] [options]
Alternative usage to run commands: webpack [command] [options]

The build tool for modern web applications.

Options:
  -c, --config <value...>                Provide path to a webpack configuration file e.g. ./webpack.config.js.
  --config-name <value...>               Name of the configuration to use.
  -m, --merge                            Merge two or more configurations using 'webpack-merge'.
  --env <value...>                       Environment passed to the configuration when it is a function.
  --node-env <value>                     Sets process.env.NODE_ENV to the specified value.
  --progress [value]                     Print compilation progress during build.
  -j, --json [value]                     Prints result as JSON or store it in a file.
  -d, --devtool <value>                  Determine source maps to use.
  --no-devtool                           Do not generate source maps.
  --entry <value...>                     The entry point(s) of your application e.g. ./src/main.js.
  --mode <value>                         Defines the mode to pass to webpack.
  --name <value>                         Name of the configuration. Used when loading multiple configurations.
  -o, --output-path <value>              Output location of the file generated by webpack e.g. ./dist/.
  --stats [value]                        It instructs webpack on how to treat the stats e.g. verbose.
  --no-stats                             Disable stats output.
  -t, --target <value...>                Sets the build target e.g. node.
  --no-target                            Negative 'target' option.
  -w, --watch                            Watch for files changes.
  --no-watch                             Do not watch for file changes.
  --watch-options-stdin                  Stop watching when stdin stream has ended.
  --no-watch-options-stdin               Do not stop watching when stdin stream has ended.

Global options:
  --color                                Enable colors on console.
  --no-color                             Disable colors on console.
  -v, --version                          Output the version number of 'webpack', 'webpack-cli' and 'webpack-dev-server' and
                                         commands.
  -h, --help [verbose]                   Display help for commands and options.

Commands:
  build|bundle|b [entries...] [options]  Run webpack (default command, can be omitted).
  configtest|t [config-path]             Validate a webpack configuration.
  help|h [command] [option]              Display help for commands and options.
  info|i [options]                       Outputs information about your system.
  serve|server|s [entries...]            Run the webpack dev server. To see all available options you need to install
                                         'webpack-dev-server'.
  version|v [commands...]                Output the version number of 'webpack', 'webpack-cli' and 'webpack-dev-server' and
                                         commands.
  watch|w [entries...] [options]         Run webpack and watch for files changes.

To see list of all supported commands and options run 'webpack --help=verbose'.

Webpack documentation: https://webpack.js.org/.
CLI documentation: https://webpack.js.org/api/cli/.
Made with ♥ by the webpack team.
```

可是命令行不方便也不直观，而且还不利于保存配置的内容。因此，webpack 还给我们提供了通过配置文件，来自定义配置参数的能力。

>03-try-webpack/webpack.config.js
>
>```js
>module.exports = {
>      entry: './src/index.js',
>
>      output: {
>          filename: 'bundle.js',
>
>          // 输出文件夹必须定义为绝对路径
>          path: './dist'
>      },
>
>  	mode: 'none'
>}
>```
>

在项目目录下运行 `npx webpack`, 可以通过配置文件来帮我们打包文件。

```shell
[felix] 03-try-webpack $ npx webpack
[webpack-cli] Invalid configuration object. Webpack has been initialized using a configuration object that does not match the API schema.
 - configuration.output.path: The provided value "./dist" is not an absolute path!
   -> The output directory as **absolute path** (required).
```
我们发现，打包并没有成功，因为 webpack 要求我们打包配置 `output.path` 的路径必须为绝对路径，通过 `path` 模块来定义输出路径为绝对路径：

>03-try-webpack/webpack.config.js
>
>```js
>const path = require('path')
>module.exports = {
>      entry: './src/index.js',
>
>      output: {
>          filename: 'bundle.js',
>
>          // 输出文件夹必须定义为绝对路径
>          path: path.resolve(__dirname, './dist')
>      },
>
>     	mode: 'none'
>}
>```
>

再次输入打包命令：

```shell
[felix] 03-try-webpack $ npx webpack
asset bundle.js 3.15 KiB [emitted] (name: main)
runtime modules 670 bytes 3 modules
cacheable modules 180 bytes
  ./src/index.js 77 bytes [built] [code generated]
  ./src/hello-world.js 103 bytes [built] [code generated]
webpack 5.54.0 compiled successfully in 81 ms
```

打包成功！

### 1.2.5 重新运行项目

项目文件通过 webpack 打包好了，可是我们在浏览器运行 `index.html`提示如下错误：
![image-20210925222921661](./images/img-02-05.png)

这是因为页面引用的JS代码，在浏览器里不能正确解析了，我们得去引用打包好了的JS才对。修改`index.html`

>03-try-webpack/index.html
>
>```html
><!DOCTYPE html>
><html lang="en">
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
></head>
><body>
>  <!-- <script src="./src/index.js"></script> -->
>  <!-- 引用打包好的 JS 文件 -->
>  <script src="./dist/bundle.js"></script>
></body>
></html>
>```

在浏览器里再次运行 `index.html`:

![image-20210925223323608](./images/img-02-06.png)

大功告成！

## 1.3 自动引入资源

到目前为止，我们都是在 `index.html` 文件中手动引入所有资源，然而随着应用程序增长，如果继续手动管理 `index.html` 文件，就会变得困难起来。然而，通过一些插件可以使这个过程更容易管控。

### 1.3.1 什么是插件

**插件** 是 webpack 的 核心 功能。插件可以用于执行一些特定的任务，包括：打包优化，资源管理，注入环境变量等。Webpack 自身也是构建于你在 webpack 配置中用到的 **相同的插件系统** 之上！

想要使用一个插件，你只需要 `require()` 它，然后把它添加到 `plugins` 数组中。多数插件可以通过选项(option)自定义。你也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时需要通过使用 `new` 操作符来创建一个插件实例。

Webpack 提供很多开箱即用的 [插件](https://webpack.docschina.org/plugins/)。

### 1.3.2 使用 HtmlWebpackPlugin

首先安装插件：

```shell
npm install --save-dev html-webpack-plugin
```

并且调整 `webpack.config.js` 文件：

```js
plugins: [
  // 实例化 html-webpack-plugin 插件
  new HtmlWebpackPlugin()
]
```

>04-manage-output/webpack.config.js
>
>```js
>//...
>module.exports = {
>    //...
>       
>    plugins: [
>         // 实例化 html-webpack-plugin 插件
>         new HtmlWebpackPlugin()
>    ]
>     }
>     ```

打包：

```shell
[felix] 04-manage-output $ npx webpack
```

<img src="./images/img-1.2.2.png" alt="image-20211001090617266" style="zoom:67%;" align="left"/>

打包生产的 `index.html`内容如下：
>04-manage-output/dist/index.html
>
>```html
><!DOCTYPE html>
><html>
>  <head>
>    <meta charset="utf-8">
>    <title>Webpack App</title>
>  <meta name="viewport" content="width=device-width, initial-scale=1"><script defer src="bundle.js"></script></head>
>  <body>
>  </body>
></html>
>```

打包后，我们发现这个 `dist/index.html` 似乎与先前的 `index.html` 并没有关系，`HtmlWebpackPlugin` 会默认生成它自己的 `index.html` 文件，并且所有的 bundle（bundle.js） 会自动添加到 html 中。

能否基于原有的 `index.html` 文件打包生成新的 `index.html`呢？可以通过阅读 [`HtmlWebpackPlugin`](https://github.com/jantimon/html-webpack-plugin)  插件提供的全部的功能和选项来找到答案。

首先删除 `index.html` 手工引入的 `js`文件：

>04-manage-output/index.html
>
>```html
><!DOCTYPE html>
><html lang="en">
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
></head>
><body>
></body>
></html>
>```

再次调整 `webpack.config.js` 文件：

```js
plugins: [
   // 实例化 html-webpack-plugin 插件
   new HtmlWebpackPlugin({
     template: './index.html', // 打包生成的文件的模板
     filename: 'app.html', // 打包生成的文件名称。默认为index.html
     // 设置所有资源文件注入模板的位置。可以设置的值 true|'head'|'body'|false，默认值为 true
     inject: 'body' 
   })
]
```

>04-manage-output/webpack.config.js
>
>```js
>//...
>module.exports = {
>//...
>     
> plugins: [
>         // 实例化 html-webpack-plugin 插件
>         new HtmlWebpackPlugin({
>      template: './index.html', // 打包生成的文件的模板
>           filename: 'app.html', // 打包生成的文件名称。默认为index.html
>           inject: 'body' // 设置所有资源文件注入模板的位置。可以设置的值 true|'head'|'body'|false，默认值为 true
>         })
> ]
>     }
>```

打包：

```shell
[felix] 04-manage-output $ npx webpack
asset bundle.js 3.15 KiB [compared for emit] (name: main)
asset app.html 414 bytes [emitted]
runtime modules 670 bytes 3 modules
cacheable modules 180 bytes
  ./src/index.js 77 bytes [built] [code generated]
  ./src/hello-world.js 103 bytes [built] [code generated]
webpack 5.54.0 compiled successfully in 95 ms
```

<img src="./images/img-1.2.2-2.png" alt="image-20211001094925170" style="zoom:67%;" align="left" />

查看 `app.html` 内容：

>04-manage-output/dist/index.html
>
>```js
><!DOCTYPE html>
><html lang="en">
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
></head>
><body>
><script defer src="bundle.js"></script></body>
></html>
>```

这次打包应用到了我们的模板文件 `index.html`, 并且生成了新的文件 `app.html`, 文件里自动引用的 `bundle.js `也从 `<header>`迁移到了`<body>`里。

### 1.3.3 清理dist

仔细留意一下，我们发现 `dist/index.html`仍旧存在，这个文件是上次生成的残留文件，已经没有用了。可见，webpack 将生成文件并放置在 `/dist` 文件夹中，但是它不会追踪哪些文件是实际在项目中用到的。通常比较推荐的做法是，在每次构建前清理 `/dist` 文件夹，这样只会生成用到的文件。让我们使用 [`output.clean`](https://webpack.docschina.org/configuration/output/#outputclean) 配置项实现这个需求。

```js
output: {
    // 打包前清理 dist 文件夹
    clean: true
}
```

>04-manage-output/webpack.config.js
>  ```js
> //...
> module.exports = {
>   //...
>     
>   output: {
>         //...
>     
>     // 打包前清理 dist 文件夹
>         clean: true
>       },
>     
>       //...
>     }
>     ```
> 

再次打包：

<img src="./images/img-1.2.3.png" alt="image-20211001114327455" style="zoom:67%;" align="left"/>

检查 `/dist` 文件夹。现在只会看到构建后生成的文件，而没有旧文件！

最后，在浏览器里运行我们打包好的页面：

<img src="./images/img-1.2.3.1.png" alt="image-20211001115318792" style="zoom:67%;" />

## 1.4 搭建开发环境

截止目前，我们只能通过复制`dist/index.html` 完整物理路径到浏览器地址栏里访问页面。现在来看看如何设置一个开发环境，使我们的开发体验变得更轻松一些。

### 1.4.1 mode 选项

在开始前，我们先将 [`mode` 设置为 `'development'`](https://webpack.docschina.org/configuration/mode/#mode-development)

```js
module.exports = {
  // 开发模式
  mode: 'development',
}
```

>05-development/webpack.config.js
>
>```js
>//...
>module.exports = {
> //...
>     
> // 开发模式
>      mode: 'development',
>     
> //...
>     }
>     ```

### 1.4.2 使用 source map

当 webpack 打包源代码时，可能会很难追踪到 error(错误) 和 warning(警告) 在源代码中的原始位置。例如，如果将三个源文件（`a.js`, `b.js` 和 `c.js`）打包到一个 bundle（`bundle.js`）中，而其中一个源文件包含一个错误，那么堆栈跟踪就会直接指向到 `bundle.js`。你可能需要准确地知道错误来自于哪个源文件，所以这种提示这通常不会提供太多帮助。

为了更容易地追踪 error 和 warning，JavaScript 提供了 [source maps](http://blog.teamtreehouse.com/introduction-source-maps) 功能，可以将编译后的代码映射回原始源代码。如果一个错误来自于 `b.js`，source map 就会明确的告诉你。

在本篇中，我们将使用 `inline-source-map` 选项：

```js

module.exports = {
  // 在开发模式下追踪代码
  devtool: 'inline-source-map',
}
```

>05-development/webpack.config.js
>
>```js
>//...
>module.exports = {
> //...
>     
> // 在开发模式下追踪代码
>      devtool: 'inline-source-map',
>     
> //...
>     }
>     ```

现在，让我们来做一些调试，在 `src/hello-world.js` 文件中生成一个错误：

>05-development/src/hello-world.js
>
>```js
>function helloWorld() {
>      // console 单词拼写错误
>      cosnole.log('Hello world')
>}
>
>// 导出函数模块
>export default helloWorld
>```

再次编译：

```shell
[felix] 05-development $ npx webpack
```

现在，在浏览器中打开生成的 `index.html` 文件，并且在控制台查看显示的错误。错误如下：

![image-20211003084150096](./images/img-1.3.2-1.png)

在浏览器里点击 `hellow-world.js:3`, 查看具体错误：

![image-20211003084318213](./images/img-1.3.2-2.png)

我们可以精确定位错误的行数。

### 1.4.3 使用 watch mode(观察模式)

在每次编译代码时，手动运行 `npx webpack` 会显得很麻烦。

我们可以在 webpack 启动时添加 "watch" 参数。如果其中一个文件被更新，代码将被重新编译，所以你不必再去手动运行整个构建。

```shell
[felix] 05-development $ npx webpack --watch
```

<img src="./images/img-1.3.3.png" alt="image-20211003085748023" style="zoom: 50%;" align="left"/>

现在命令行中，光标停留在尾部，监测文件的变化。修改 `hello-world.js`文件：

>05-development/src/hello-world.js
>
>```js
>function helloWorld() {
>  	console.log('Hello world')
>}
>
>// 导出函数模块
>export default helloWorld
>```

<img src="./images/img-1.3.3-2.png" alt="image-20211003091919018" style="zoom: 50%;" align="left" />

现在，保存文件并检查 terminal(终端) 窗口。应该可以看到 webpack 自动地重新编译修改后的模块！

唯一的缺点是，为了看到修改后的实际效果，你需要刷新浏览器。如果能够自动刷新浏览器就更好了，因此接下来我们会尝试通过 `webpack-dev-server` 实现此功能。

### 1.4.4 使用 webpack-dev-server

`webpack-dev-server` 为你提供了一个基本的 web server，并且具有 live reloading(实时重新加载) 功能。先安装：

```shell
npm install --save-dev webpack-dev-server
```

修改配置文件，告知 dev server，从什么位置查找文件：

```js
module.exports = {
	// dev-server
  devServer: {
    static: './dist'
  }
}
```

>05-development/webpack.config.js
>
>```js
>//...
>module.exports = {
>	//...
>      
>  	// dev-server
>      	devServer: {
>          static: './dist'
>  	}
>     }
>     ```

以上配置告知 `webpack-dev-server`，将 `dist` 目录下的文件作为 web 服务的根目录。

>提示：
>
>webpack-dev-server 在编译之后不会写入到任何输出文件。而是将 bundle 文件保留在内存中，然后将它们 serve 到 server 中，就好像它们是挂载在 server 根路径上的真实文件一样。

执行命令：

<img src="./images/img-1.3.4-2.png" alt="image-20211003093717309" style="zoom:50%;" align="left"/>

在浏览器里可以直接访问页面：

<img src="./images/img-1.3.4.png" alt="image-20211003093518571" style="zoom:50%;" align="left"/>

修改一下 `hello-world.js`文件：

>05-development/src/hello-world.js
>
>```js
>function helloWorld() {
>  	console.log('Hello world~~~')
>}
>
>// 导出函数模块
>export default helloWorld
>```

这时我们不用刷新浏览器页面，在控制台上能看到 `Hello world~~~`自动更新了。

<img src="./images/img-1.3.4.2.png" alt="image-20211003093917769" style="zoom:50%;" align="left"/>

## 1.5 资源模块

目前为止，我们的项目可以在控制台上显示 "Hello world~~~"。现在我们尝试混合一些其他资源，比如 images，看看 webpack 如何处理。

在 webpack 出现之前，前端开发人员会使用 [grunt](https://gruntjs.com/) 和 [gulp](https://gulpjs.com/) 等工具来处理资源，并将它们从 `/src` 文件夹移动到 `/dist` 或 `/build` 目录中。webpack 最出色的功能之一就是，除了引入 JavaScript，还可以内置的资源模块 [Asset Modules](https://webpack.docschina.org/guides/asset-modules/) *引入任何其他类型的文件*。

资源模块(asset module)是一种模块类型，它允许我们应用Webpack来打包其他资源文件（如字体，图标等）

资源模块类型(asset module type)，通过添加 4 种新的模块类型，来替换所有这些 loader：

- `asset/resource` 发送一个单独的文件并导出 URL。
- `asset/inline` 导出一个资源的 data URI。
- `asset/source` 导出资源的源代码。
- `asset` 在导出一个 data URI 和发送一个单独的文件之间自动选择。

### 1.5.1 Resource 资源

修改 `webpack.config.js`配置：

```js
// 配置资源文件
  module: {
    rules: [{
      test: /\.png/,
      type: 'asset/resource'
    }]
  },
```

>06-asset-modules/webpack.config.js
>
>```js
>const path = require('path')
>const HtmlWebpackPlugin = require('html-webpack-plugin')
>module.exports = {
>      //...
>
>      // 配置资源文件
>       module: {
>         rules: [{
>           test: /\.png/,
>           type: 'asset/resource'
>         }]
>       },
>     	 //...
>     }
>```

准备资源文件，在入口文件中引入，并显示在页面上：

<img src="./images/img-1.4.1-1.png" alt="image-20211003104641137" style="zoom: 50%;" align="left" />

>06-asset-modules/src/index.js
>
>```js
>// 导入函数模块
>import helloWorld from './hello-world.js'
>import imgsrc from './assets/img-1.png'
>
>helloWorld()
>
>const img = document.createElement('img')
>img.src = imgsrc
>document.body.appendChild(img)
>```

执行打包命令：

```shell
[felix] 06-asset-modules $ npx webpack
asset 8ec2798f81f4745a7c9b.png 101 KiB [emitted] [immutable] [from: src/assets/img-1.png] (auxiliary name: main)
asset bundle.js 10.5 KiB [emitted] (name: main)
asset app.html 326 bytes [emitted]
runtime modules 1.72 KiB 5 modules
cacheable modules 388 bytes (javascript) 101 KiB (asset)
  ./src/index.js 208 bytes [built] [code generated]
  ./src/hello-world.js 138 bytes [built] [code generated]
  ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
webpack 5.54.0 compiled successfully in 114 ms
```

发现图片(.png)文件已经打包到了dis目录下：

<img src="./images/img-1.4.1-2.png" alt="image-20211003105056870" style="zoom:50%;" align="left" />

执行启动服务命令：

<img src="./images/img-1.4.1-3.png" alt="image-20211003105414484" style="zoom:50%;" />

打开浏览器：

<img src="./images/img-1.4.1-4.png" alt="image-20211003105807364" style="zoom:50%;" align="left" />

- 自定义输出文件名

  默认情况下，`asset/resource` 模块以 `[contenthash][ext][query]` 文件名发送到输出目录。

  可以通过在 webpack 配置中设置 [`output.assetModuleFilename`](https://webpack.docschina.org/configuration/output/#outputassetmodulefilename) 来修改此模板字符串：
  
  ```
  output: {
     assetModuleFilename: 'images/[contenthash][ext][query]'
  },
  ```

>06-asset-modules/webpack.config.js
>
>```js
>//...
>module.exports = {
>  //...
>    
>  output: {
>        //...
>     
>     assetModuleFilename: 'images/[contenthash][ext][query]'
>       },
>     
>  //...
>     }
>     ```

执行编译：

```shell
[felix] 06-asset-modules $ npx webpack
assets by status 101 KiB [cached] 1 asset
asset bundle.js 10.5 KiB [compared for emit] (name: main)
asset app.html 326 bytes [compared for emit]
runtime modules 1.72 KiB 5 modules
cacheable modules 356 bytes (javascript) 101 KiB (asset)
  ./src/index.js 208 bytes [built] [code generated]
  ./src/hello-world.js 106 bytes [built] [code generated]
  ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
webpack 5.54.0 compiled successfully in 125 ms
```

<img src="./images/img-1.4.1-5.png" alt="image-20211003115500915" style="zoom:50%;" align="left" />



另一种自定义输出文件名的方式是，将某些资源发送到指定目录，修改配置：

```js
rules: [{
  test: /\.png/,
  type: 'asset/resource',

  // 优先级高于 assetModuleFilename
  generator: {
    filename: 'images/[contenthash][ext][query]'
  }
}]
```

>06-asset-modules/webpack.config.js
>
>```js
>//...
>module.exports = {
>  //...
>  
>  output: {
>      //...
>     
>    // 配置资源文件
>         module: {
>            rules: [
>         {
>                test: /\.png/,
>                type: 'asset/resource',
>
>                // 优先级高于 assetModuleFilename
>              generator: {
>             filename: 'images/[contenthash][ext][query]'
>               }
>             }
>       ],
>        },
>    
>    //...
>    }
>    ```

执行编译：

```shell
[felix] 06-asset-modules $ npx webpack
assets by status 102 KiB [cached] 2 assets
assets by path . 10.5 KiB
  asset bundle.js 10.5 KiB [compared for emit] (name: main)
  asset app.html 71 bytes [compared for emit]
runtime modules 1.72 KiB 5 modules
cacheable modules 356 bytes (javascript) 101 KiB (asset)
  ./src/index.js 208 bytes [built] [code generated]
  ./src/hello-world.js 106 bytes [built] [code generated]
  ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
webpack 5.54.0 compiled successfully in 113 ms
```

<img src="./images/img-1.4.1-5.png" alt="image-20211003115500915" style="zoom:50%;" align="left" />

输出结果与 `assetModuleFilename` 设置一样。

### 1.5.2 inline 资源

修改 `webpack.config.js`配置：

```js
// 配置资源文件
  module: {
    [
      {
        test: /\.svg/,
        type: 'asset/inline'
      }
    ],
  }
```

>06-asset-modules/webpack.config.js
>
>```js
>//...
>module.exports = {
>  //...
>    
>  // 配置资源文件
>      module: {
>        rules: [
>           //...
>           {
>              test: /\.svg/,
>              type: 'asset/inline'
>           }
>     		],
>       },
>     
>    	//...
>}
>    ```

执行启动服务命令：

![image-20211003213650735](./images/img-1.4.2-1.png)

打开浏览器：

![image-20211003213936854](./images/img-1.4.2-2.png)

可见， `.svg` 文件都将作为 data URI 注入到 bundle 中。

- 自定义 data URI 生成器

webpack 输出的 data URI，默认是呈现为使用 Base64 算法编码的文件内容。

如果要使用自定义编码算法，则可以指定一个自定义函数来编码文件内容。

安装自定义函数模块：

```shell
[felix] webpack5 $ npm install mini-svg-data-uri -D
```

修改配置文件：

```js
const svgToMiniDataURI = require('mini-svg-data-uri')

rules: [
  {
    test: /\.svg/,
    type: 'asset/inline',
    generator: {
      dataUrl: content => {
        content = content.toString();
        return svgToMiniDataURI(content);
      }
    }
  }
]
```

>06-asset-modules/webpack.config.js
>
>```js
>//...
>const svgToMiniDataURI = require('mini-svg-data-uri')
>
>module.exports = {
>  //...
>  
>  // 配置资源文件
>    module: {
>        rules: [
>     //...
>         {
>           test: /\.svg/,
>       type: 'asset/inline',
>           generator: {
>             dataUrl: content => {
>           content = content.toString();
>               return svgToMiniDataURI(content);
>           }
>       }
>       }
>      ],
>  },
>  
>    //...
>}
>  ```

现在，所有 `.svg` 文件都将通过 `mini-svg-data-uri` 包进行编码。重新启动服务，在浏览器查看效果：

![image-20211003221026972](./images/img-1.4.2-3.png)

### 1.5.3 source 资源

source资源，导出资源的源代码。修改配置文件，添加：

```js
module: {
  rules: [
    test: /\.txt/,
		type: 'asset/source'
  ]
}
```

>06-asset-modules/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>    //...
>  
>      // 配置资源文件
>    module: {
>        rules: [
>            //...
>
>            {
>              test: /\.txt/,
>               type: 'asset/source'
>            }
>          ],
>    },
>    
>      //...
>}
>  ```

在assets里创建一个 `example.txt`文件：

>06-asset-modules/src/assets/example.txt
>
>```
>hello webpack
>```

在入口文件里引入一个 `.txt`文件，添加内容：

```js
import exampleText from './assets/example.txt'

const block = document.createElement('div')
block.style.cssText = `width: 200px; height: 200px; background: aliceblue`
block.textContent = exampleText
document.body.appendChild(block)
```

>06-asset-modules/src/index.js
>
>```js
>// 导入函数模块
>//...
>import exampleText from './assets/example.txt'
>
>//...
>
>const block = document.createElement('div')
>block.style.cssText = `width: 200px; height: 200px; background: aliceblue`
>block.textContent = exampleText
>document.body.appendChild(block)
>
>//...
>```

启动服务，打开浏览器：

<img src="./images/img-1.4.3-1.png" alt="image-20211004072019253" style="zoom: 33%;" align="left"/>

所有 `.txt` 文件将原样注入到 bundle 中。



### 1.5.4 通用资源类型

通用资源类型 `asset` ,  在导出一个 data URI 和发送一个单独的文件之间自动选择。

修改配置文件：

```js
module: {
  rules: [
    test: /\.jpg/,
		type: 'asset'
  ]
}
```

现在，webpack 将按照默认条件，自动地在 `resource` 和 `inline` 之间进行选择：小于 8kb 的文件，将会视为 `inline` 模块类型，否则会被视为 `resource` 模块类型。

可以通过在 webpack 配置的 module rule 层级中，设置 [`Rule.parser.dataUrlCondition.maxSize`](https://webpack.docschina.org/configuration/module/#ruleparserdataurlcondition) 选项来修改此条件：

```js
rules: [
  {
    test: /\.jpg/,
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 4 * 1024 // 4kb
      }
    }
  }
]
```

>06-asset-modules/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>  //...
>
>    // 配置资源文件
>  module: {
>      rules: [
>          //...
>
>          {
>            test: /\.jpg/,
>        			type: 'asset',
>            	parser: {
>              dataUrlCondition: {
>            		maxSize: 4 * 1024 // 4kb
>             }
>          }
>     	 }
>      ],
>    },
>
>    //...
>  }
>```

在 `assets`目录下创建 `.jpg` 文件，然后在入口文件中引入：

```js
import jpgMap from './assets/qianfeng-sem.jpg'

const img3 = document.createElement('img')
img3.style.cssText = 'width: 600px; height: 240px; display: block'
img3.src = jpgMap
document.body.appendChild(img3)
```

>06-asset-modules/src/index.js
>
>```js
>// 导入函数模块
>//...
>import jpgMap from './assets/qianfeng-sem.jpg'
>
>//...
>const img3 = document.createElement('img')
>img3.style.cssText = 'width: 600px; height: 240px; display: block'
>img3.src = jpgMap
>document.body.appendChild(img3)
>```

启动服务，打开浏览器：

<img src="./images/img-1.4.4-2.png" alt="image-20211004075125478" style="zoom:33%;" align="left"/>

执行编译命令：

```shell
[felix] 06-asset-modules $ npx webpack
assets by status 101 KiB [cached] 1 asset
assets by status 653 KiB [emitted]
  asset images/33120e6c4bd92df7bec8.jpg 637 KiB [emitted] [immutable] [from: src/assets/qianfeng-sem.jpg] (auxiliary name: main)
  asset bundle.js 15.7 KiB [emitted] (name: main)
asset app.html 326 bytes [compared for emit]
runtime modules 1.72 KiB 5 modules
cacheable modules 4.03 KiB (javascript) 738 KiB (asset)
  asset modules 3.1 KiB (javascript) 738 KiB (asset)
    ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
    ./src/assets/webpack-logo.svg 2.99 KiB [built] [code generated]
    ./src/assets/example.txt 25 bytes [built] [code generated]
    ./src/assets/qianfeng-sem.jpg 42 bytes (javascript) 637 KiB (asset) [built] [code generated]
  javascript modules 949 bytes
    ./src/index.js 843 bytes [built] [code generated]
    ./src/hello-world.js 106 bytes [built] [code generated]
webpack 5.54.0 compiled successfully in 139 ms
```

<img src="./images/img-1.4.4-3.png" alt="image-20211004075657443" style="zoom:50%;" align="left"/>

发现当前的 `.jpg`文件被打包成了单独的文件，因为此文件大小超过了 `4kb`。

## 1.6 管理资源

在上一章，我们讲解了四种资源模块引入外部资源。除了资源模块，我们还可以通过loader引入其他类型的文件。

### 1.6.1 什么是loader

webpack 只能理解 JavaScript 和 JSON 文件，这是 webpack 开箱可用的自带能力。**loader** 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 [模块](https://webpack.docschina.org/concepts/modules)，以供应用程序使用，以及被添加到依赖图中。

在 webpack 的配置中，**loader** 有两个属性：

1. `test` 属性，识别出哪些文件会被转换。
2. `use` 属性，定义出在进行转换时，应该使用哪个 loader。

```js
const path = require('path');

module.exports = {
  output: {
    filename: 'my-first-webpack.bundle.js',
  },
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
};
```

以上配置中，对一个单独的 module 对象定义了 `rules` 属性，里面包含两个必须属性：`test` 和 `use`。这告诉 webpack 编译器(compiler) 如下信息：

> “嘿，webpack 编译器，当你碰到「在 `require()`/`import` 语句中被解析为 '.txt' 的路径」时，在你对它打包之前，先 **use(使用)** `raw-loader` 转换一下。”

### 1.6.2 加载CSS

为了在 JavaScript 模块中 `import` 一个 CSS 文件，你需要安装 [style-loader](https://webpack.docschina.org/loaders/style-loader) 和 [css-loader](https://webpack.docschina.org/loaders/css-loader)，并在 [`module` 配置](https://webpack.docschina.org/configuration/module) 中添加这些 loader：

```shell
[felix] webpack5 $ npm install --save-dev style-loader css-loader
```

修改配置文件：

```js
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>  //...
>
>    // 配置资源文件
>  module: {
>      rules: [
>          //...
>
>          {
>            test: /\.css$/i,
>        		  use: ['style-loader', 'css-loader'],
>          },
>        ],
>  },
>    
>    //...
>}
>  ```

模块 loader 可以链式调用。链中的每个 loader 都将对资源进行转换。链会逆序执行。第一个 loader 将其结果（被转换后的资源）传递给下一个 loader，依此类推。最后，webpack 期望链中的最后的 loader 返回 JavaScript。

应保证 loader 的先后顺序：[`'style-loader'`](https://webpack.docschina.org/loaders/style-loader) 在前，而 [`'css-loader'`](https://webpack.docschina.org/loaders/css-loader) 在后。如果不遵守此约定，webpack 可能会抛出错误。webpack 根据正则表达式，来确定应该查找哪些文件，并将其提供给指定的 loader。在这个示例中，所有以 `.css` 结尾的文件，都将被提供给 `style-loader` 和 `css-loader`。

这使你可以在依赖于此样式的 js 文件中 `import './style.css'`。现在，在此模块执行过程中，含有 CSS 字符串的 `<style>` 标签，将被插入到 html 文件的 `<head>` 中。

我们尝试一下，通过在项目中添加一个新的 `style.css` 文件，并将其 import 到我们的 `index.js` 中：

<img src="./images/img-1.5.2-1.png" alt="image-20211004090930829" style="zoom:50%;" align="left"/>

>07-manage-assets/src/style.css
>
>```css
>.hello {
>  	color: #f9efd4;
>}
>```

 在入口文件里导入 `.css`文件：

```js
import './style.css'

document.body.classList.add('hello')
```

>07-manage-assets/src/index.js
>
>```js
>// 导入函数模块
>//...
>import './style.css'
>
>//...
>
>document.body.classList.add('hello')
>```

启动服务，打开浏览器：

```shell
[felix] 07-manage-assets $ npx webpack serve --open
```

<img src="./images/img-1.5.2-2.png" alt="image-20211004093257741" />

你应该看到页面背景颜色是浅黄色。要查看 webpack 做了什么，请检查页面（不要查看页面源代码，它不会显示结果，因为 `<style>` 标签是由 JavaScript 动态创建的），并查看页面的 head 标签，包含 style 块元素，也就是我们在 `index.js` 中 import 的 css 文件中的样式。

现有的 loader 可以支持任何你可以想到的 CSS 风格 - [sass](https://webpack.docschina.org/loaders/sass-loader) 和 [less](https://webpack.docschina.org/loaders/less-loader) 等。安装less-loader：

```shell
[felix] webpack5 $ npm install less less-loader --save-dev
```

修改配置文件：

```js
module: {
    rules: [
      {
        test: /\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader'],
      }
    ],
  },
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>  //...
>
>    // 配置资源文件
>  module: {
>      rules: [
>          //...
>
>          {
>            test: /\.less$/i,
>        use: ['style-loader', 'css-loader', 'less-loader'],
>          },
>    
>      //...
>        ],
>    },
>
>    //...
>  }
>```

在项目`src`目录下创建 `style.less`文件：

```less
@color: red;
.world {
  color: @color;
}
```

在入口文件中引入 `.less` 文件：

```js
import './style.less'

document.body.classList.add('world')
```

>07-manage-assets/src/index.js
>
>```js
>// 导入模块
>//...
>import './style.less'
>
>//...
>
>document.body.classList.add('world')
>```

![image-20211004100531396](./images/img-1.5.2-3.png)

由预览的效果可见，页面的文字都添加了“红色”的样式。

### 1.6.3 抽离和压缩CSS

在多数情况下，我们也可以进行压缩CSS，以便在生产环境中节省加载时间，同时还可以将CSS文件抽离成一个单独的文件。实现这个功能，需要 `mini-css-extract-plugin`这个插件来帮忙。安装插件：

```shell
[felix] webpack5 $ npm install mini-css-extract-plugin --save-dev
```

本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。

本插件基于 webpack v5 的新特性构建，并且需要 webpack 5 才能正常工作。

之后将 loader 与 plugin 添加到你的 `webpack` 配置文件中：

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module: {
	rules: [
		{
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
    },
	]
}
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>const MiniCssExtractPlugin = require("mini-css-extract-plugin")
>
>module.exports = {
>  //...
>
>    // 配置资源文件
>  module: {
>      rules: [
>          {
>        test: /\.css$/i,
>            use: [MiniCssExtractPlugin.loader, 'css-loader'],
>          },
>
>          //...
>        ],
>  },
>    
>    //...
>}
>  ```

执行编译：

```shell
[felix] 07-manage-assets $ npx webpack
```

<img src="./images/img-1.5.2-4.png" alt="image-20211004102451643" style="zoom:50%;" align="left"/>

*单独的 `mini-css-extract-plugin` 插件不会将这些 CSS 加载到页面中*。这里*[`html-webpack-plugin`](https://github.com/jantimon/html-webpack-plugin) 帮助我们自动生成* `link` *标签或者在创建* `index.html` *文件时使用* `link` *标签。*

>07-manage-assets/dist/app.html
>
>```html
><!DOCTYPE html>
><html lang="en">
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
><link href="main.css" rel="stylesheet"></head>
><body>
><script defer src="bundle.js"></script></body>
></html>
>```

这时，`link`标签已经生成出来了，把我们打包好的 `main.css` 文件加载进来。我们发现，`main.css`文件被打包抽离到 `dist` 根目录下，能否将其打包到一个单独的文件夹里呢？修改配置文件：

```js
plugins: [
  new MiniCssExtractPlugin({
    filename: 'styles/[contenthash].css'
  })
],
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>
>const MiniCssExtractPlugin = require("mini-css-extract-plugin")
>
>module.exports = {
>  //...
>  
>  plugins: [
>      //...
>    
>    new MiniCssExtractPlugin({
>          filename: 'styles/[contenthash].css'
>        })
>  ],
>    
>      //...
>}
>    ```

再次执行编译：

```shell
[felix] 07-manage-assets $ npx webpack
```

查看打包完成后的目录和文件：

<img src="./images/img-1.5.3.1.png" alt="image-20211004104521902" style="zoom:50%;" align="left"/>

>07-manage-assets/dist/app.html
>
>```html
><!DOCTYPE html>
><html lang="en">
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
><link href="styles/c8d1b95f617a81aa500c.css" rel="stylesheet"></head>
><body>
><script defer src="bundle.js"></script></body>
></html>
>```

现在，`app.html`文件引用的路径同样更新了。

打开查看 `.css` 文件：

>07-manage-assets/dist/styles/c8d1b95f617a81aa500c.css
>
>```css
>/*!******************************************************************!*\
>  !*** css ../node_modules/css-loader/dist/cjs.js!./src/style.css ***!
>  \******************************************************************/
>.hello {
>  	background-color: #f9efd4;
>}
>
>/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLzRhMDUzMTlkYWM5MDJlMjc5ODM5LmNzcyIsIm1hcHBpbmdzIjoiOzs7QUFBQTtFQUNFLHlCQUF5QjtBQUMzQixDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL3N0eWxlLmNzcyJdLCJzb3VyY2VzQ29udGVudCI6WyIuaGVsbG8ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjllZmQ0O1xufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==*/
>```

发现文件并没有压缩和优化，为了压缩输出文件，请使用类似于 [css-minimizer-webpack-plugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/) 这样的插件。安装插件：

```shell
[felix] webpack5 $ npm install css-minimizer-webpack-plugin --save-dev
```

配置插件：

```js
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
	// 生产模式
  mode: 'production',
  
  // 优化配置
	optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
}
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>
>const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
>
>module.exports = {
>  //...
>
>    // 开发模式
>  mode: 'production',
>  
>      //...
>
>      optimization: {
>        minimizer: [
>      			new CssMinimizerPlugin(),
>        ],
>      },
>}
>    ```

再次执行编译：

```shell
[felix] 07-manage-assets $ npx webpack
```

查看打包完成后的目录和文件：

<img src="./images/img-1.5.5-3.png" alt="image-20211004133259345" style="zoom:50%;" align="left"/>

查看 `47d76d536c66efaf7a55.css`文件：

>07-manage-assets/dist/styles/47d76d536c66efaf7a55.css
>
>```css
>.hello{background-color:#f9efd4}
>/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLzQ3ZDc2ZDUzNmM2NmVmYWY3YTU1LmNzcyIsIm1hcHBpbmdzIjoiQUFBQSxPQUNFLHdCQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL3N0eWxlLmNzcyJdLCJzb3VyY2VzQ29udGVudCI6WyIuaGVsbG8ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjllZmQ0O1xufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==*/
>```

`css`文件优化成功！

### 1.6.4 加载 images 图像

假如，现在我们正在下载 CSS，但是像 background 和 icon 这样的图像，要如何处理呢？在 webpack 5 中，可以使用内置的 [Asset Modules](https://webpack.docschina.org/guides/asset-modules/)，我们可以轻松地将这些内容混入我们的系统中，这个我们在"资源模块"一节中已经介绍了。这里再补充一个知识点，在 `css`文件里也可以直接引用文件，修改 `style.css` 和入口 `index.js`：

```css
.block-bg {
  background-image: url(./assets/webpack-logo.svg) ;
}
```

```js
block.style.cssText = `width: 200px; height: 200px; background-color: #2b3a42`
block.classList.add('block-bg')
```

>07-manage-assets/src/style.css
>
>```css
>.hello {
>  	background-color: #f9efd4;
>}
>
>.block-bg {
>  	background-image: url(./assets/webpack-logo.svg) ;
>}
>```

>07-manage-assets/src/index.js
>
>```js
>// 导入模块
>//...
>import './style.css'
>
>
>//...
>block.style.cssText = `width: 200px; height: 200px; background-color: #2b3a42`
>block.textContent = exampleText
>block.classList.add('block-bg')
>document.body.appendChild(block)
>
>//...
>```

启动服务，打开浏览器：

![image-20211004111444479](./images/img-1.5.4-1.png)

我们看到，通过样式把背景图片加到了页面中。

### 1.6.5 加载 fonts 字体

那么，像字体这样的其他资源如何处理呢？使用 Asset Modules 可以接收并加载任何文件，然后将其输出到构建目录。这就是说，我们可以将它们用于任何类型的文件，也包括字体。让我们更新 `webpack.config.js` 来处理字体文件：

```js
module: {
	rules: [
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    },
	]
}
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>    //...
>
>    // 配置资源文件
>      module: {
>        rules: [
>             //...
>             {
>                test: /\.(woff|woff2|eot|ttf|otf)$/i,
>                type: 'asset/resource',
>              },
>            ],
>          },
>     
>   //...
>     }
>  ```

在项目中添加一些字体文件：

<img src="./images/img-1.5.2-5.png" alt="image-20211004114523074" style="zoom:50%;" align="left"/>

配置好 loader 并将字体文件放在合适的位置后，你可以通过一个 `@font-face` 声明将其混合。本地的 `url(...)` 指令会被 webpack 获取处理，就像它处理图片一样：

```css
@font-face {
  font-family: 'iconfont';
  src: url('./assets/iconfont.ttf') format('truetype');
}

.icon {
  font-family: "iconfont" !important;
  font-size: 30px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

>07-manage-assets/src/style.css
>
>```css
>@font-face {
>    font-family: 'iconfont';
>    src: url('./assets/iconfont.ttf') format('truetype');
>}
>
>.hello {
>    background-color: #f9efd4;
>}
>
>.icon {
>    font-family: "iconfont" !important;
>    font-size: 30px;
>    font-style: normal;
>    -webkit-font-smoothing: antialiased;
>    -moz-osx-font-smoothing: grayscale;
>}
>
>.block-bg {
>    background-image: url(./assets/webpack-logo.svg);
>}
>```

```js
const span = document.createElement('span')
span.classList.add('icon')
span.innerHTML = '&#xe668;'
document.body.appendChild(span)
```

>07-manage-assets/src/index.js
>
>```js
>// 导入模块
>//...
>
>const span = document.createElement('span')
>span.classList.add('icon')
>span.innerHTML = '&#xe668;'
>document.body.appendChild(span)
>```

启动服务，打开浏览器：

![image-20211004121830739](./images/img-1.5.5-1.png)

我们再打包一下，看看输出的文件：

```shell
[felix] 07-manage-assets $ npx webpack
```

<img src="./images/img-1.5.5-2.png" alt="image-20211004122156414" style="zoom:50%;" align="left"/>

再看一下打包好的 `styles/.css`文件：

>07-manage-assets/dist/styles/4a9cff551c7a105e1554.css
>
>```css
>/*!******************************************************************!*\
>  !*** css ../node_modules/css-loader/dist/cjs.js!./src/style.css ***!
>  \******************************************************************/@font-face{font-family:iconfont;src:url(../images/65b194f1f711865371d1.ttf) format("truetype")}.hello{background-color:#f9efd4}.icon{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-family:iconfont!important;font-size:16px;font-style:normal}.block-bg{background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 3046.7 875.7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m387 0 387 218.9v437.9L387 875.7 0 656.8V218.9z' fill='%23fff'/%3E%3Cpath d='M704.9 641.7 399.8 814.3V679.9l190.1-104.6zm20.9-18.9V261.9l-111.6 64.5v232zM67.9 641.7 373 814.3V679.9L182.8 575.3zM47 622.8V261.9l111.6 64.5v232zm13.1-384.3L373 61.5v129.9L172.5 301.7l-1.6.9zm652.6 0-312.9-177v129.9l200.5 110.2 1.6.9z' fill='%238ed6fb'/%3E%3Cpath d='M373 649.3 185.4 546.1V341.8L373 450.1zm26.8 0 187.6-103.1V341.8L399.8 450.1zM198.1 318.2l188.3-103.5 188.3 103.5-188.3 108.7z' fill='%231c78c0'/%3E%3Cpath d='M1164.3 576.3h82.5l84.1-280.2h-80.4l-49.8 198.8-53.1-198.8H1078l-53.6 198.8-49.3-198.8h-80.4l83.6 280.2h82.5l52-179.5zM1335.2 437c0 84.1 57.3 146.3 147.4 146.3 69.7 0 107.2-41.8 117.9-61.6l-48.8-37c-8 11.8-30 34.3-68.1 34.3-41.3 0-71.3-26.8-72.9-64.3H1608c.5-5.4.5-10.7.5-16.1 0-91.6-49.3-149.5-136.1-149.5-79.9 0-137.2 63.2-137.2 147.9zm77.7-30.6c3.2-32.1 25.7-56.8 60.6-56.8 33.8 0 58.4 22.5 60 56.8zm223.5 169.9h69.7v-28.9c7.5 9.1 35.4 35.9 83.1 35.9 80.4 0 137.2-60.5 137.2-146.8 0-86.8-52.5-147.3-132.9-147.3-48.2 0-76.1 26.8-83.1 36.4V188.9h-73.9v387.4zm71.8-139.3c0-52.5 31.1-82.5 71.8-82.5 42.9 0 71.8 33.8 71.8 82.5 0 49.8-30 80.9-71.8 80.9-45 0-71.8-36.5-71.8-80.9zm247 239.5h73.9V547.3c7 9.1 34.8 35.9 83.1 35.9 80.4 0 132.9-60.5 132.9-147.3 0-85.7-56.8-146.8-137.2-146.8-47.7 0-75.6 26.8-83.1 36.4V296h-69.7v380.5zm71.8-241.1c0-44.5 26.8-80.9 71.8-80.9 41.8 0 71.8 31.1 71.8 80.9 0 48.8-28.9 82.5-71.8 82.5-40.7 0-71.8-30-71.8-82.5zm231.5 54.1c0 58.9 48.2 93.8 105 93.8 32.2 0 53.6-9.6 68.1-25.2l4.8 18.2h65.4V398.9c0-62.7-26.8-109.8-116.8-109.8-42.9 0-85.2 16.1-110.4 33.2l27.9 50.4a165.2 165.2 0 0 1 74.5-19.8c32.7 0 50.9 16.6 50.9 41.3v18.2c-10.2-7-32.2-15.5-60.6-15.5-65.4-.1-108.8 37.4-108.8 92.6zm73.9-2.2c0-23 19.8-39.1 48.2-39.1s48.8 14.5 48.8 39.1c0 23.6-20.4 38.6-48.2 38.6s-48.8-15.5-48.8-38.6zm348.9 30.6c-46.6 0-79.8-33.8-79.8-81.4 0-45 29.5-82 77.2-82a95.2 95.2 0 0 1 65.4 26.8l20.9-62.2a142.6 142.6 0 0 0-88.4-30c-85.2 0-149 62.7-149 147.9s62.2 146.3 149.5 146.3a141 141 0 0 0 87.3-30l-19.8-60.5c-12.4 10.1-34.9 25.1-63.3 25.1zm110.9 58.4h73.9V431.6l93.8 144.7h86.8L2940.6 423l98.6-127h-83.1l-90 117.9v-225h-73.9z' fill='%23f5fafa'/%3E%3C/svg%3E")}
>/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLzRhOWNmZjU1MWM3YTEwNWUxNTU0LmNzcyIsIm1hcHBpbmdzIjoiQUFBQTs7cUVBRXFFLENDRnJFLFdBQ0Usb0JBQXVCLENBQ3ZCLDhEQUNGLENBRUEsT0FDRSx3QkFDRixDQUVBLE1BSUUsa0NBQW1DLENBQ25DLGlDQUFrQyxDQUpsQyw4QkFBa0MsQ0FDbEMsY0FBZSxDQUNmLGlCQUdGLENBRUEsVUFDRSw0d0VBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vNGE5Y2ZmNTUxYzdhMTA1ZTE1NTQuY3NzIiwid2VicGFjazovLy8uL3NyYy9zdHlsZS5jc3MiXSwic291cmNlc0NvbnRlbnQiOlsiLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIGNzcyAuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3NyYy9zdHlsZS5jc3MgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbkBmb250LWZhY2Uge1xuICBmb250LWZhbWlseTogJ2ljb25mb250JztcbiAgc3JjOiB1cmwoLi4vaW1hZ2VzLzY1YjE5NGYxZjcxMTg2NTM3MWQxLnR0ZikgZm9ybWF0KCd0cnVldHlwZScpO1xufVxuXG4uaGVsbG8ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjllZmQ0O1xufVxuXG4uaWNvbiB7XG4gIGZvbnQtZmFtaWx5OiBcImljb25mb250XCIgIWltcG9ydGFudDtcbiAgZm9udC1zaXplOiAxNnB4O1xuICBmb250LXN0eWxlOiBub3JtYWw7XG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xuICAtbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlO1xufVxuXG4uYmxvY2stYmcge1xuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNjc3ZnIHZpZXdCb3g9JzAgMCAzMDQ2LjcgODc1LjcnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyclM2UlM2NwYXRoIGQ9J20zODcgMCAzODcgMjE4Ljl2NDM3LjlsLTM4NyAyMTguOS0zODctMjE4Ljl2LTQzNy45eicgZmlsbD0nd2hpdGUnLyUzZSUzY3BhdGggZD0nbTcwNC45IDY0MS43LTMwNS4xIDE3Mi42di0xMzQuNGwxOTAuMS0xMDQuNnptMjAuOS0xOC45di0zNjAuOWwtMTExLjYgNjQuNXYyMzJ6bS02NTcuOSAxOC45IDMwNS4xIDE3Mi42di0xMzQuNGwtMTkwLjItMTA0LjZ6bS0yMC45LTE4Ljl2LTM2MC45bDExMS42IDY0LjV2MjMyem0xMy4xLTM4NC4zIDMxMi45LTE3N3YxMjkuOWwtMjAwLjUgMTEwLjMtMS42Ljl6bTY1Mi42IDAtMzEyLjktMTc3djEyOS45bDIwMC41IDExMC4yIDEuNi45eicgZmlsbD0nJTIzOGVkNmZiJy8lM2UlM2NwYXRoIGQ9J20zNzMgNjQ5LjMtMTg3LjYtMTAzLjJ2LTIwNC4zbDE4Ny42IDEwOC4zem0yNi44IDAgMTg3LjYtMTAzLjF2LTIwNC40bC0xODcuNiAxMDguM3ptLTIwMS43LTMzMS4xIDE4OC4zLTEwMy41IDE4OC4zIDEwMy41LTE4OC4zIDEwOC43eicgZmlsbD0nJTIzMWM3OGMwJy8lM2UlM2NwYXRoIGQ9J20xMTY0LjMgNTc2LjNoODIuNWw4NC4xLTI4MC4yaC04MC40bC00OS44IDE5OC44LTUzLjEtMTk4LjhoLTY5LjZsLTUzLjYgMTk4LjgtNDkuMy0xOTguOGgtODAuNGw4My42IDI4MC4yaDgyLjVsNTItMTc5LjV6bTE3MC45LTEzOS4zYzAgODQuMSA1Ny4zIDE0Ni4zIDE0Ny40IDE0Ni4zIDY5LjcgMCAxMDcuMi00MS44IDExNy45LTYxLjZsLTQ4LjgtMzdjLTggMTEuOC0zMCAzNC4zLTY4LjEgMzQuMy00MS4zIDAtNzEuMy0yNi44LTcyLjktNjQuM2gxOTcuM2MuNS01LjQuNS0xMC43LjUtMTYuMSAwLTkxLjYtNDkuMy0xNDkuNS0xMzYuMS0xNDkuNS03OS45IDAtMTM3LjIgNjMuMi0xMzcuMiAxNDcuOXptNzcuNy0zMC42YzMuMi0zMi4xIDI1LjctNTYuOCA2MC42LTU2LjggMzMuOCAwIDU4LjQgMjIuNSA2MCA1Ni44em0yMjMuNSAxNjkuOWg2OS43di0yOC45YzcuNSA5LjEgMzUuNCAzNS45IDgzLjEgMzUuOSA4MC40IDAgMTM3LjItNjAuNSAxMzcuMi0xNDYuOCAwLTg2LjgtNTIuNS0xNDcuMy0xMzIuOS0xNDcuMy00OC4yIDAtNzYuMSAyNi44LTgzLjEgMzYuNHYtMTM2LjdoLTczLjl2Mzg3LjR6bTcxLjgtMTM5LjNjMC01Mi41IDMxLjEtODIuNSA3MS44LTgyLjUgNDIuOSAwIDcxLjggMzMuOCA3MS44IDgyLjUgMCA0OS44LTMwIDgwLjktNzEuOCA4MC45LTQ1IDAtNzEuOC0zNi41LTcxLjgtODAuOXptMjQ3IDIzOS41aDczLjl2LTEyOS4yYzcgOS4xIDM0LjggMzUuOSA4My4xIDM1LjkgODAuNCAwIDEzMi45LTYwLjUgMTMyLjktMTQ3LjMgMC04NS43LTU2LjgtMTQ2LjgtMTM3LjItMTQ2LjgtNDcuNyAwLTc1LjYgMjYuOC04My4xIDM2LjR2LTI5LjVoLTY5Ljd2MzgwLjV6bTcxLjgtMjQxLjFjMC00NC41IDI2LjgtODAuOSA3MS44LTgwLjkgNDEuOCAwIDcxLjggMzEuMSA3MS44IDgwLjkgMCA0OC44LTI4LjkgODIuNS03MS44IDgyLjUtNDAuNyAwLTcxLjgtMzAtNzEuOC04Mi41em0yMzEuNSA1NC4xYzAgNTguOSA0OC4yIDkzLjggMTA1IDkzLjggMzIuMiAwIDUzLjYtOS42IDY4LjEtMjUuMmw0LjggMTguMmg2NS40di0xNzcuNGMwLTYyLjctMjYuOC0xMDkuOC0xMTYuOC0xMDkuOC00Mi45IDAtODUuMiAxNi4xLTExMC40IDMzLjJsMjcuOSA1MC40YTE2NS4yIDE2NS4yIDAgMCAxIDc0LjUtMTkuOGMzMi43IDAgNTAuOSAxNi42IDUwLjkgNDEuM3YxOC4yYy0xMC4yLTctMzIuMi0xNS41LTYwLjYtMTUuNS02NS40LS4xLTEwOC44IDM3LjQtMTA4LjggOTIuNnptNzMuOS0yLjJjMC0yMyAxOS44LTM5LjEgNDguMi0zOS4xczQ4LjggMTQuNSA0OC44IDM5LjFjMCAyMy42LTIwLjQgMzguNi00OC4yIDM4LjZzLTQ4LjgtMTUuNS00OC44LTM4LjZ6bTM0OC45IDMwLjZjLTQ2LjYgMC03OS44LTMzLjgtNzkuOC04MS40IDAtNDUgMjkuNS04MiA3Ny4yLTgyYTk1LjIgOTUuMiAwIDAgMSA2NS40IDI2LjhsMjAuOS02Mi4yYTE0Mi42IDE0Mi42IDAgMCAwIC04OC40LTMwYy04NS4yIDAtMTQ5IDYyLjctMTQ5IDE0Ny45czYyLjIgMTQ2LjMgMTQ5LjUgMTQ2LjNhMTQxIDE0MSAwIDAgMCA4Ny4zLTMwbC0xOS44LTYwLjVjLTEyLjQgMTAuMS0zNC45IDI1LjEtNjMuMyAyNS4xem0xMTAuOSA1OC40aDczLjl2LTE0NC43bDkzLjggMTQ0LjdoODYuOGwtMTA2LjEtMTUzLjMgOTguNi0xMjdoLTgzLjFsLTkwIDExNy45di0yMjVoLTczLjl6JyBmaWxsPSclMjNmNWZhZmEnLyUzZSUzYy9zdmclM2VcIikgO1xufVxuIiwiQGZvbnQtZmFjZSB7XG4gIGZvbnQtZmFtaWx5OiAnaWNvbmZvbnQnO1xuICBzcmM6IHVybCgnLi9hc3NldHMvaWNvbmZvbnQudHRmJykgZm9ybWF0KCd0cnVldHlwZScpO1xufVxuXG4uaGVsbG8ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjllZmQ0O1xufVxuXG4uaWNvbiB7XG4gIGZvbnQtZmFtaWx5OiBcImljb25mb250XCIgIWltcG9ydGFudDtcbiAgZm9udC1zaXplOiAxNnB4O1xuICBmb250LXN0eWxlOiBub3JtYWw7XG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xuICAtbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlO1xufVxuXG4uYmxvY2stYmcge1xuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoLi9hc3NldHMvd2VicGFjay1sb2dvLnN2ZykgO1xufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==*/
>```

由于在前面我们应用了如下配置，使生产环境css 文件也进行了压缩处理。我们可以注释它：

```js
optimization: {
   // minimize: true,
}
```

### 1.6.6 加载数据

此外，可以加载的有用资源还有数据，如 JSON 文件，CSV、TSV 和 XML。类似于 NodeJS，JSON 支持实际上是内置的，也就是说 `import Data from './data.json'` 默认将正常运行。要导入 CSV、TSV 和 XML，你可以使用 [csv-loader](https://github.com/theplatapi/csv-loader) 和 [xml-loader](https://github.com/gisikw/xml-loader)。让我们处理加载这三类文件：

```shell
[felix] webpack5 $ npm install --save-dev csv-loader xml-loader
```

添加配置：

```js
module: {
	rules: [
    {
      test: /\.(csv|tsv)$/i,
      use: ['csv-loader'],
    },
    {
      test: /\.xml$/i,
      use: ['xml-loader'],
    },
	]
}
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>    //...
>
>    // 配置资源文件
>    module: {
>         rules: [
>           //...
>  
>           {
>             test: /\.(csv|tsv)$/i,
>             use: ['csv-loader'],
>           },
>           {
>             test: /\.xml$/i,
>             use: ['xml-loader'],
>           },
>         ],
>      },
>
>      //...
>  }
>```

现在，你可以 `import` 这四种类型的数据(JSON, CSV, TSV, XML)中的任何一种，所导入的 `Data` 变量，将包含可直接使用的已解析 JSON：

创建两个文件：

>07-manage-assets/src/assets/data.xml
>
>```xml
><?xml version="1.0" encoding="UTF-8"?>
><note>
>  <to>Mary</to>
>  <from>John</from>
>  <heading>Reminder</heading>
>  <body>Call Cindy on Tuesday</body>
></note>
>```

>07-manage-assets/src/assets/data.csv
>
>```
>to,from,heading,body
>Mary,John,Reminder,Call Cindy on Tuesday
>Zoe,Bill,Reminder,Buy orange juice
>Autumn,Lindsey,Letter,I miss you
>```

在入口文件里加载数据模块，并在控制台上打印导入内容：

```js
import Data from './assets/data.xml'
import Notes from './assets/data.csv'

console.log(Data)
console.log(Notes)
```

>07-manage-assets/src/index.js
>
>```js
>// 导入模块
>//...
>
>import Data from './assets/data.xml'
>import Notes from './assets/data.csv'
>
>//...
>
>console.log(Data)
>console.log(Notes)
>```

查看开发者工具中的控制台，你应该能够看到导入的数据会被打印出来！

```shell
[felix] 07-manage-assets $ npx webpack serve
```

![image-20211004151141055](./images/img-1.5.6-1.png)

由此可见，`data.xml`文件转化为一个JS对象，`data.cvs`转化为一个数组。

### 1.6.7 自定义 JSON 模块 parser

通过使用 [自定义 parser](https://webpack.docschina.org/configuration/module/#ruleparserparse) 替代特定的 webpack loader，可以将任何 `toml`、`yaml` 或 `json5` 文件作为 JSON 模块导入。

假设你在 `src` 文件夹下有一个 `data.toml`、一个 `data.yaml` 以及一个 `data.json5` 文件：

>07-manage-assets/src/assets/json/data.toml
>
>```toml
>title = "TOML Example"
>
>[owner]
>name = "Tom Preston-Werner"
>organization = "GitHub"
>bio = "GitHub Cofounder & CEO\nLikes tater tots and beer."
>dob = 1979-05-27T07:32:00Z
>```

>07-manage-assets/src/assets/json/data.yaml
>
>```yaml
>title: YAML Example
>owner:
>  name: Tom Preston-Werner
>  organization: GitHub
>  bio: |-
>    GitHub Cofounder & CEO
>    Likes tater tots and beer.
>  dob: 1979-05-27T07:32:00.000Z
>```

>07-manage-assets/src/assets/json/data.json5
>
>```json
>{
>    // comment
>    title: 'JSON5 Example',
>    owner: {
>        name: 'Tom Preston-Werner',
>        organization: 'GitHub',
>        bio: 'GitHub Cofounder & CEO\n\
>  Likes tater tots and beer.',
>        dob: '1979-05-27T07:32:00.000Z',
>    },
>}
>```

首先安装 `toml`，`yamljs` 和 `json5` 的 packages：

```shell
[felix] webpack5 $ npm install toml yamljs json5 --save-dev
```

并在你的 webpack 中配置它们：

```js
const toml = require('toml');
const yaml = require('yamljs');
const json5 = require('json5');

module.exports = {
  module: {
    rules: [
      {
        test: /\.toml$/i,
        type: 'json',
        parser: {
          parse: toml.parse,
        },
      },
      {
        test: /\.yaml$/i,
        type: 'json',
        parser: {
          parse: yaml.parse,
        },
      },
      {
        test: /\.json5$/i,
        type: 'json',
        parser: {
          parse: json5.parse,
        },
      },
    ]
  }
}
```

>07-manage-assets/webpack.config.js
>
>```js
>//...
>
>const toml = require('toml')
>const yaml = require('yamljs')
>const json5 = require('json5')
>
>module.exports = {
>    //...
>
>    // 配置资源文件
>      module: {
>        rules: [
>           //...
>    
>           {
>             test: /\.toml$/i,
>             type: 'json',
>             parser: {
>               parse: toml.parse,
>             },
>           },
>           {
>             test: /\.yaml$/i,
>             type: 'json',
>             parser: {
>               parse: yaml.parse,
>             },
>           },
>           {
>             test: /\.json5$/i,
>             type: 'json',
>             parser: {
>               parse: json5.parse,
>             },
>           },
>         ],
>       },
>     
>       //...
>     }
>```

在主文件中引入模块，并打印内容：

```js
import toml from './data.toml';
import yaml from './data.yaml';
import json from './data.json5';

console.log(toml.title); // output `TOML Example`
console.log(toml.owner.name); // output `Tom Preston-Werner`

console.log(yaml.title); // output `YAML Example`
console.log(yaml.owner.name); // output `Tom Preston-Werner`

console.log(json.title); // output `JSON5 Example`
console.log(json.owner.name); // output `Tom Preston-Werner`
```

>07-manage-assets/src/index.js
>
>```js
>// 导入模块
>//...
>import toml from './assets/json/data.toml'
>import yaml from './assets/json/data.yaml'
>import json from './assets/json/data.json5'
>
>//...
>
>console.log(toml.title); // output `TOML Example`
>console.log(toml.owner.name); // output `Tom Preston-Werner`
>
>console.log(yaml.title); // output `YAML Example`
>console.log(yaml.owner.name); // output `Tom Preston-Werner`
>
>console.log(json.title); // output `JSON5 Example`
>console.log(json.owner.name); // output `Tom Preston-Werner`
>```

启动服务，打开浏览器：

```shell
[felix] 07-manage-assets $ npx webpack serve
```

![image-20211004153342199](/Users/felix/Library/Application Support/typora-user-images/image-20211004153342199.png)

现在，`toml`、`yaml`和`json5`几个类型的文件都正常输出了结果。

 ## 1.7 使用 babel-loader

前面的章节里，我们应用 `less-loader`编译过 less 文件，应用 `xml-loader`编译过 xml 文件，那 js 文件需要编译吗？我们来做一个实验，修改 `hello-world.js`文件：

>08-babel-loader/src/hello-world.js
>
>```js
>function getString() {
>    return new Promise((resolve, reject) => {
>        setTimeout(() => {
>           resolve('Hello world~~~')
>        }, 2000)
>    })
>}
>
>async function helloWorld() {
>    let string = await getString()
>    console.log(string)
>}
>
>// 导出函数模块
>export default helloWorld
>```

执行编译：

```shell
[felix] 08-babel-loader $ npx webpack
```

<img src="./images/img-1.6.1-1.png" alt="image-20211005074522172" style="zoom:50%;" align="left"/>

查看 bundle.js 文件：

>08-babel-loader/dist/bundle.js
>
>```js
>//...
>
>/***/
>"./src/hello-world.js":
>/*!****************************!*\
>!*** ./src/hello-world.js ***!
>\****************************/
>/***/
>((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
>
>    "use strict";
>    __webpack_require__.r(__webpack_exports__);
>    /* harmony export */
>    __webpack_require__.d(__webpack_exports__, {
>        /* harmony export */
>        "default": () => (__WEBPACK_DEFAULT_EXPORT__)
>        /* harmony export */
>    });
>
>    function getString() {
>        return new Promise((resolve, reject) => {
>           setTimeout(() => {
>             resolve('Hello world~~~')
>           }, 2000)
>        })
>    }
>
>    async function helloWorld() {
>        let string = await getString()
>        console.log(string)
>    }
>
>    // 导出函数模块
>    /* harmony default export */
>    const __WEBPACK_DEFAULT_EXPORT__ = (helloWorld);
>
>    /***/
>}),
>
>//...
>```

我们发现，编写的ES6代码原样输出了。启动服务，打开浏览器：

```shell
[felix] 08-babel-loader $ npx webpack serve
```

<img src="./images/img-1.5.6-2.png" alt="image-20211005075532323" style="zoom:50%;" />

`Hello world~~`两秒后正常输出，说明浏览器能够运行我们的ES6代码。但如果浏览器版本过低，就很难保证代码正常运行了。

### 1.7.1 为什么需要 babel-loader

webpack 自身可以自动加载JS文件，就像加载JSON文件一样，无需任何 loader。可是，加载的JS文件会原样输出，即使你的JS文件里包含ES6+的代码，也不会做任何的转化。这时我们就需要Babel来帮忙。Babel 是一个 JavaScript 编译器，可以将ES6+转化成ES5。在Webpack里使用Babel，需要使用 `babel-loader`。

### 1.7.2  使用 babel-loader

安装：

```shell
npm install -D babel-loader @babel/core @babel/preset-env
```

- `babel-loader`: 在webpack里应用 babel 解析ES6的桥梁
- `@babel/core`:  babel核心模块
- `@babel/preset-env`:  babel预设，一组 babel 插件的集合

在 webpack 配置中，需要将 `babel-loader` 添加到 `module` 列表中，就像下面这样：

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
}
```

执行编译：

```shell
[felix] 08-babel-loader $ npx webpack
```

查看 bundle.js 文件：

>08-babel-loader/dist/bundle.js
>
>```js
>/***/
>"./src/hello-world.js":
>/*!****************************!*\
>!*** ./src/hello-world.js ***!
>\****************************/
>/***/
>((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
>
>  "use strict";
>  __webpack_require__.r(__webpack_exports__);
>  /* harmony export */
>  __webpack_require__.d(__webpack_exports__, {
>    /* harmony export */
>    "default": () => (__WEBPACK_DEFAULT_EXPORT__)
>    /* harmony export */
>  });
>
>  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
>    try {
>      var info = gen[key](arg);
>      var value = info.value;
>    } catch (error) {
>      reject(error);
>      return;
>    }
>    if (info.done) {
>      resolve(value);
>    } else {
>      Promise.resolve(value).then(_next, _throw);
>    }
>  }
>
>  function _asyncToGenerator(fn) {
>    return function () {
>      var self = this,
>        args = arguments;
>      return new Promise(function (resolve, reject) {
>        var gen = fn.apply(self, args);
>
>        function _next(value) {
>          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
>        }
>
>        function _throw(err) {
>          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
>        }
>        _next(undefined);
>      });
>    };
>  }
>
>  function getString() {
>    return new Promise(function (resolve, reject) {
>      setTimeout(function () {
>        resolve('Hello world~~~');
>      }, 2000);
>    });
>  }
>
>  function helloWorld() {
>    return _helloWorld.apply(this, arguments);
>  } // 导出函数模块
>
>
>  function _helloWorld() {
>    _helloWorld = _asyncToGenerator( /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
>      var string;
>      return regeneratorRuntime.wrap(function _callee$(_context) {
>        while (1) {
>          switch (_context.prev = _context.next) {
>            case 0:
>              _context.next = 2;
>              return getString();
>
>            case 2:
>              string = _context.sent;
>              console.log(string);
>
>            case 4:
>            case "end":
>              return _context.stop();
>          }
>        }
>      }, _callee);
>    }));
>    return _helloWorld.apply(this, arguments);
>  }
>
>  /* harmony default export */
>  const __WEBPACK_DEFAULT_EXPORT__ = (helloWorld);
>
>  /***/
>}),
>```

从编译完的结果可以看出，`async/await` 的ES6语法被 `babel`编译了。

### 1.7.3 regeneratorRuntime 插件

此时执行编译，在浏览器里打开项目发现报了一个致命错误：

<img src="./images/img-1.6.3-1.png" alt="image-20211007070359238" style="zoom:50%;" align="left"/>

`regeneratorRuntime`是webpack打包生成的全局辅助函数，由babel生成，用于兼容async/await的语法。

`regeneratorRuntime is not defined`这个错误显然是未能正确配置babel。

正确的做法需要添加以下的插件和配置：

```shell
# 这个包中包含了regeneratorRuntime，运行时需要
npm install --save @babel/runtime

# 这个插件会在需要regeneratorRuntime的地方自动require导包，编译时需要
npm install --save-dev @babel/plugin-transform-runtime

# 更多参考这里
https://babeljs.io/docs/en/babel-plugin-transform-runtime
```

接着改一下babel的配置：

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            [
              '@babel/plugin-transform-runtime'
            ]
          ]
        }
      }
    }
  ]
}
```

>08-babel-loade/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>  //...
>
>  // 配置资源文件
>  module: {
>    rules: [{
>        test: /\.js$/,
>        exclude: /node_modules/,
>          use: {
>          loader: 'babel-loader',
>            options: {
>                presets: ['@babel/preset-env'],
>            plugins: [
>                  [
>                    '@babel/plugin-transform-runtime'
>              ]
>                ]
>              }
>        }
>          },
>  
>      //...
>      ],
>    },
>
>    //...
>  }
>```

启动服务，打开浏览器：

<img src="./images/img-1.6.3-2.png" alt="image-20211007071943719" style="zoom:50%;"/>

成功运行。

## 1.8 代码分离

代码分离是 webpack 中最引人注目的特性之一。此特性能够把代码分离到不同的 bundle 中，然后可以按需加载或并行加载这些文件。代码分离可以用于获取更小的 bundle，以及控制资源加载优先级，如果使用合理，会极大影响加载时间。

常用的代码分离方法有三种：

- **入口起点**：使用 [`entry`](https://webpack.docschina.org/configuration/entry-context) 配置手动地分离代码。
- **防止重复**：使用 [Entry dependencies](https://webpack.docschina.org/configuration/entry-context/#dependencies) 或者 [`SplitChunksPlugin`](https://webpack.docschina.org/plugins/split-chunks-plugin) 去重和分离 chunk。
- **动态导入**：通过模块的内联函数调用来分离代码。

### 1.8.1 入口起点

这是迄今为止最简单直观的分离代码的方式。不过，这种方式手动配置较多，并有一些隐患，我们将会解决这些问题。先来看看如何从 main bundle 中分离 another module(另一个模块)：

在 `src`目录下创建 `another-module.js`文件：

>09-code-splitting/src/another-module.js
>
>```js
>import _ from 'lodash'
>
>console.log(_.join(['Another', 'module', 'loaded!'], ' '))
>```

这个模块依赖了 `lodash`，需要安装一下：

```shell
[felix] webpack5 $ npm install lodash --save-dev
```

修改配置文件：

```js
 module.exports = {
   entry: {
     index: './src/index.js',
     another: './src/another-module.js',
   },
   output: {
     filename: '[name].bundle.js'
   },
 }
```

>09-code-splitting/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>    entry: {
>        index: './src/index.js',
>        another: './src/another-module.js',
>    },
>
>    output: {
>        filename: '[name].bundle.js'
>         //...
>       },
>    
>      //...
>}
>  ```

执行编译：

```shell
[felix] 09-code-splitting $ npx webpack
assets by status 744 KiB [cached] 4 assets
assets by status 1.44 MiB [emitted]
  asset another.bundle.js 1.38 MiB [emitted] (name: another)
  asset index.bundle.js 65.1 KiB [emitted] (name: index)
  asset app.html 441 bytes [emitted]
Entrypoint index 68.9 KiB (740 KiB) = styles/4a9cff551c7a105e1554.css 3.81 KiB index.bundle.js 65.1 KiB 3 auxiliary assets
Entrypoint another 1.38 MiB = another.bundle.js
runtime modules 3.23 KiB 12 modules
cacheable modules 549 KiB (javascript) 738 KiB (asset) 2.65 KiB (css/mini-extract)
  javascript modules 546 KiB
    modules by path ../node_modules/ 540 KiB 9 modules
    modules by path ./src/ 5.48 KiB 8 modules
  asset modules 3.1 KiB (javascript) 738 KiB (asset)
    ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
    ./src/assets/webpack-logo.svg 2.99 KiB [built] [code generated]
    ./src/assets/example.txt 25 bytes [built] [code generated]
    ./src/assets/qianfeng-sem.jpg 42 bytes (javascript) 637 KiB (asset) [built] [code generated]
  json modules 565 bytes
    ./src/assets/json/data.toml 188 bytes [built] [code generated]
    ./src/assets/json/data.yaml 188 bytes [built] [code generated]
    ./src/assets/json/data.json5 189 bytes [built] [code generated]
  css ../node_modules/css-loader/dist/cjs.js!./src/style.css 2.65 KiB [built] [code generated]
webpack 5.54.0 compiled successfully in 854 ms
```

*asset another.bundle.js 1.38 MiB [emitted] (name: another)* , 我们发现 `lodash.js`也被打包到 `another.bundle.js` 中。

<img src="./images/img-1.7.1-1.png" alt="image-20211005132302209" style="zoom:50%;" align="left"/>

查看 `app.html`：

>09-code-splitting/dist/app
>
>```html
><!DOCTYPE html>
><html lang="en">
>
><head>
>  <meta charset="UTF-8">
>  <meta http-equiv="X-UA-Compatible" content="IE=edge">
>  <meta name="viewport" content="width=device-width, initial-scale=1.0">
>  <title>千锋大前端教研院-Webpack5学习指南</title>
>  <link href="styles/4a9cff551c7a105e1554.css" rel="stylesheet">
></head>
>
><body>
>  <script defer src="index.bundle.js"></script>
>  <script defer src="another.bundle.js"></script>
></body>
>
></html>
>```

两个入口的 `bundle`文件都被链接到了 `app.html`中。

我们再来修改一下 `index.js`文件：

```js
import _ from 'lodash'

console.log(_.join(['index', 'module', 'loaded!'], ' '))
```

>09-code-splitting/src/index.js
>
>```js
>// 导入模块
>//...
>import _ from 'lodash'
>
>//...
>
>console.log(_.join(['index', 'module', 'loaded!'], ' '))
>```

执行编译：

```shell
[felix] 09-code-splitting $ npx webpack
assets by status 744 KiB [cached] 4 assets
assets by path . 2.82 MiB
  asset index.bundle.js 1.44 MiB [emitted] (name: index)
  asset another.bundle.js 1.38 MiB [compared for emit] (name: another)
  asset app.html 441 bytes [compared for emit]
Entrypoint index 1.44 MiB (740 KiB) = styles/4a9cff551c7a105e1554.css 3.81 KiB index.bundle.js 1.44 MiB 3 auxiliary assets
Entrypoint another 1.38 MiB = another.bundle.js
runtime modules 3.35 KiB 13 modules
cacheable modules 549 KiB (javascript) 738 KiB (asset) 2.65 KiB (css/mini-extract)
  javascript modules 546 KiB
    modules by path ../node_modules/ 540 KiB 9 modules
    modules by path ./src/ 5.57 KiB 8 modules
  asset modules 3.1 KiB (javascript) 738 KiB (asset)
    ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
    ./src/assets/webpack-logo.svg 2.99 KiB [built] [code generated]
    ./src/assets/example.txt 25 bytes [built] [code generated]
    ./src/assets/qianfeng-sem.jpg 42 bytes (javascript) 637 KiB (asset) [built] [code generated]
  json modules 565 bytes
    ./src/assets/json/data.toml 188 bytes [built] [code generated]
    ./src/assets/json/data.yaml 188 bytes [built] [code generated]
    ./src/assets/json/data.json5 189 bytes [built] [code generated]
  css ../node_modules/css-loader/dist/cjs.js!./src/style.css 2.65 KiB [built] [code generated]
webpack 5.54.0 compiled successfully in 898 ms
```

观察一下：

```shell
assets by path . 2.82 MiB
  asset index.bundle.js 1.44 MiB [emitted] (name: index)
  asset another.bundle.js 1.38 MiB [compared for emit] (name: another)
  asset app.html 441 bytes [compared for emit]
```

我们发现：`index.bundle.js` 文件大小也骤然增大了，可以 `lodash.js`也被打包到了 `index.bundle.js`中了。

正如前面提到的，这种方式的确存在一些隐患：

- 如果入口 chunk 之间包含一些重复的模块，那些重复模块都会被引入到各个 bundle 中。
- 这种方法不够灵活，并且不能动态地将核心应用程序逻辑中的代码拆分出来。

以上两点中，第一点对我们的示例来说无疑是个问题，因为之前我们在 `./src/index.js` 中也引入过 `lodash`，这样就在两个 bundle 中造成重复引用。

### 1.8.2 防止重复

- **入口依赖**

  配置 [`dependOn` option](https://webpack.docschina.org/configuration/entry-context/#dependencies) 选项，这样可以在多个 chunk 之间共享模块：

  ```js
  module.exports = {
    entry: {
      index: {
        import: './src/index.js',
        dependOn: 'shared',
      },
      another: {
        import: './src/another-module.js',
        dependOn: 'shared',
      },
      shared: 'lodash',
    }
  }
  ```

  >09-code-splitting/webpack.config.js
  >
  >```js
  >//...
  >
  >module.exports = {
  >  entry: {
  >    index: {
  >      import: './src/index.js',
  >      dependOn: 'shared',
  >    },
  >    another: {
  >      import: './src/another-module.js',
  >        dependOn: 'shared',
  >        },
  >         shared: 'lodash',
  >       },
  >    
  >      //...
  >     }
  >     ```
  
  执行编译：
  
  >```js
  >[felix] 09-code-splitting $ npx webpack
  >assets by status 744 KiB [cached] 4 assets
  >assets by status 1.45 MiB [emitted]
  >  asset shared.bundle.js 1.39 MiB [emitted] (name: shared)
  >  asset index.bundle.js 57.1 KiB [emitted] (name: index)
  >  asset another.bundle.js 1.53 KiB [emitted] (name: another)
  >  asset app.html 487 bytes [emitted]
  >Entrypoint index 60.9 KiB (740 KiB) = styles/4a9cff551c7a105e1554.css 3.81 KiB index.bundle.js 57.1 KiB 3 auxiliary assets
  >Entrypoint another 1.53 KiB = another.bundle.js
  >Entrypoint shared 1.39 MiB = shared.bundle.js
  >runtime modules 4.47 KiB 9 modules
  >cacheable modules 549 KiB (javascript) 738 KiB (asset) 2.65 KiB (css/mini-extract)
  >  javascript modules 546 KiB
  >    modules by path ../node_modules/ 540 KiB 9 modules
  >    modules by path ./src/ 5.57 KiB 8 modules
  >  asset modules 3.1 KiB (javascript) 738 KiB (asset)
  >    ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
  >    ./src/assets/webpack-logo.svg 2.99 KiB [built] [code generated]
  >    ./src/assets/example.txt 25 bytes [built] [code generated]
  >    ./src/assets/qianfeng-sem.jpg 42 bytes (javascript) 637 KiB (asset) [built] [code generated]
  >  json modules 565 bytes
  >    ./src/assets/json/data.toml 188 bytes [built] [code generated]
  >    ./src/assets/json/data.yaml 188 bytes [built] [code generated]
  >    ./src/assets/json/data.json5 189 bytes [built] [code generated]
  >  css ../node_modules/css-loader/dist/cjs.js!./src/style.css 2.65 KiB [built] [code generated]
  >webpack 5.54.0 compiled successfully in 1237 ms
  >```
  
  观察一下：
  
  ```shell
  assets by status 1.45 MiB [emitted]
    asset shared.bundle.js 1.39 MiB [emitted] (name: shared)
    asset index.bundle.js 57.1 KiB [emitted] (name: index)
    asset another.bundle.js 1.53 KiB [emitted] (name: another)
    asset app.html 487 bytes [emitted]
  ```
  
  `index.bundle.js`与`another.bundle.js`共享的模块`lodash.js`被打包到一个单独的文件`shared.bundle.js`中。
  
- **SplitChunksPlugin**

  [`SplitChunksPlugin`](https://webpack.docschina.org/plugins/split-chunks-plugin) 插件可以将公共的依赖模块提取到已有的入口 chunk 中，或者提取到一个新生成的 chunk。让我们使用这个插件，将之前的示例中重复的 `lodash` 模块去除：

   ```js
   entry: {
   	index: './src/index.js',
     another: './src/another-module.js'
   },
       
   optimization: {
     splitChunks: {
     	chunks: 'all',
     },
   },
   ```

  >09-code-splitting/webpack.config.js
  >
  >```js
  >//...
  >
  >module.exports = {
  >  // entry: {
  >  //   index: {
  >  //     import: './src/index.js',
  >  //     dependOn: 'shared',
  >  //   },
  >  //   another: {
  >  //     import: './src/another-module.js',
  >    //     dependOn: 'shared',
  >    //   },
  >    //   shared: 'lodash',
  >    // },
  >    entry: {
  >      index: './src/index.js',
  >      another: './src/another-module.js'
  >    },
  >  
  >    //...
  >  
  >    optimization: {
  >        //...
  >    
  >      splitChunks: {
  >        chunks: 'all',
  >      }
  >      },
  >}
  >    ```
  
  执行编译：
  
  ```shell
  [felix] 09-code-splitting $ npx webpack
  assets by status 744 KiB [cached] 4 assets
  assets by status 1.46 MiB [emitted]
    asset vendors-node_modules_lodash_lodash_js.bundle.js 1.37 MiB [emitted] (id hint: vendors)
    asset index.bundle.js 75.3 KiB [emitted] (name: index)
    asset another.bundle.js 17.2 KiB [emitted] (name: another)
    asset app.html 518 bytes [emitted]
  Entrypoint index 1.45 MiB (740 KiB) = vendors-node_modules_lodash_lodash_js.bundle.js 1.37 MiB styles/4a9cff551c7a105e1554.css 3.81 KiB index.bundle.js 75.3 KiB 3 auxiliary assets
  Entrypoint another 1.39 MiB = vendors-node_modules_lodash_lodash_js.bundle.js 1.37 MiB another.bundle.js 17.2 KiB
  runtime modules 8.1 KiB 17 modules
  cacheable modules 549 KiB (javascript) 738 KiB (asset) 2.65 KiB (css/mini-extract)
    javascript modules 546 KiB
      modules by path ../node_modules/ 540 KiB 9 modules
      modules by path ./src/ 5.57 KiB 8 modules
    asset modules 3.1 KiB (javascript) 738 KiB (asset)
      ./src/assets/img-1.png 42 bytes (javascript) 101 KiB (asset) [built] [code generated]
      ./src/assets/webpack-logo.svg 2.99 KiB [built] [code generated]
      ./src/assets/example.txt 25 bytes [built] [code generated]
      ./src/assets/qianfeng-sem.jpg 42 bytes (javascript) 637 KiB (asset) [built] [code generated]
    json modules 565 bytes
      ./src/assets/json/data.toml 188 bytes [built] [code generated]
      ./src/assets/json/data.yaml 188 bytes [built] [code generated]
      ./src/assets/json/data.json5 189 bytes [built] [code generated]
    css ../node_modules/css-loader/dist/cjs.js!./src/style.css 2.65 KiB [built] [code generated]
  webpack 5.54.0 compiled successfully in 914 ms
  ```
  
  观察一下：
  
  ```shell
  assets by status 1.46 MiB [emitted]
    asset vendors-node_modules_lodash_lodash_js.bundle.js 1.37 MiB [emitted] (id hint: vendors)
    asset index.bundle.js 75.3 KiB [emitted] (name: index)
    asset another.bundle.js 17.2 KiB [emitted] (name: another)
    asset app.html 518 bytes [emitted]
  ```
  
  使用 [`optimization.splitChunks`](https://webpack.docschina.org/plugins/split-chunks-plugin/#optimization-splitchunks) 配置选项之后，现在应该可以看出，`index.bundle.js` 和 `another.bundle.js` 中已经移除了重复的依赖模块。需要注意的是，插件将 `lodash` 分离到单独的 chunk，并且将其从 main bundle 中移除，减轻了大小。

### 1.8.3 动态导入

当涉及到动态代码拆分时，webpack 提供了两个类似的技术。第一种，也是推荐选择的方式是，使用符合 [ECMAScript 提案](https://github.com/tc39/proposal-dynamic-import) 的 [`import()` 语法](https://webpack.docschina.org/api/module-methods/#import-1) 来实现动态导入。第二种，则是 webpack 的遗留功能，使用 webpack 特定的 [`require.ensure`](https://webpack.docschina.org/api/module-methods/#requireensure)。让我们先尝试使用第一种……

创建 `async-module.js`文件：

<img src="./images/img-1.7.3-1.png" alt="image-20211007074451722" style="zoom:50%;" align="left"/>

内容如下：

>09-code-splitting/src/async-module.js
>
>```js
>function getComponent() {
>      return import('lodash')
>         .then(({
>           default: _
>         }) => {
>           const element = document.createElement('div')
>
>           element.innerHTML = _.join(['Hello', 'webpack'], ' ')
>           return element
>         })
>         .catch((error) => 'An error occurred while loading the component')
>}
>
>getComponent().then((component) => {
>      document.body.appendChild(component)
>})
>```

在入口文件中导入：

```js
import './async-module'
```

>09-code-splitting/src/index.js
>
>```js
>// 导入模块
>//...
>import './async-module'
>
>//...
>```

执行编译：

```shell
[felix] 09-code-splitting $ npx webpack
assets by status 744 KiB [cached] 4 assets
assets by status 1.53 MiB [compared for emit]
  assets by chunk 1.46 MiB (id hint: vendors)
    asset vendors-node_modules_lodash_lodash_js.bundle.js 1.37 MiB [compared for emit] (id hint: vendors)
    asset vendors-node_modules_babel_runtime_regenerator_index_js-node_modules_css-loader_dist_runtime_-86adfe.bundle.js 93.8 KiB [compared for emit] (id hint: vendors)
  asset index.bundle.js 54.3 KiB [compared for emit] (name: index)
  asset another.bundle.js 17.2 KiB [compared for emit] (name: another)
  asset app.html 658 bytes [compared for emit]
Entrypoint index 1.52 MiB (740 KiB) = vendors-node_modules_lodash_lodash_js.bundle.js 1.37 MiB vendors-node_modules_babel_runtime_regenerator_index_js-node_modules_css-loader_dist_runtime_-86adfe.bundle.js 93.8 KiB styles/4a9cff551c7a105e1554.css 3.81 KiB index.bundle.js 54.3 KiB 3 auxiliary assets
Entrypoint another 1.39 MiB = vendors-node_modules_lodash_lodash_js.bundle.js 1.37 MiB another.bundle.js 17.2 KiB
runtime modules 9.21 KiB 18 modules
....
```

从打印的结果看，除了公共的 `lodash` 代码被单独打包到一个文件外，还生成了一个 `vendors-node_modules_babel_runtime_regenerator_index_js-node_modules_css-loader_dist_runtime_-86adfe.bundle.js` 文件。

<img src="./images/img-1.7.3-2.png" alt="image-20211007083617826" style="zoom:50%;" />

我们看到，静态和动态载入的模块都正常工作了。

### 1.8.4 懒加载

懒加载或者按需加载，是一种很好的优化网页或应用的方式。这种方式实际上是先把你的代码在一些逻辑断点处分离开，然后在一些代码块中完成某些操作后，立即引用或即将引用另外一些新的代码块。这样加快了应用的初始加载速度，减轻了它的总体体积，因为某些代码块可能永远不会被加载。

创建一个 `math.js` 文件，在主页面中通过点击按钮调用其中的函数：

>09-code-splitting/src/math.js
>
>```js
>export const add = () => {
>	return x + y
>}
>
>export const minus = () => {
>	return x - y
>}
>```

编辑 `index.js`文件：

```js
const button = document.createElement('button')
button.textContent = '点击执行加法运算'
button.addEventListener('click', () => {
  import(/* webpackChunkName: 'math' */ './math.js').then(({ add }) => {
    console.log(add(4, 5))
  })
})
document.body.appendChild(button)
```

这里有句注释，我们把它称为 webpack 魔法注释：`webpackChunkName: 'math'`, 告诉webpack打包生成的文件名为 `math`。

启动服务，在浏览器上查看：

<img src="./images/img-1.7.4-6.png" alt="image-20211008205054635" style="zoom:50%;" />

第一次加载完页面，`math.bundle.js`不会加载，当点击按钮后，才加载 `math.bundle.js`文件。

### 1.8.5 预获取/预加载模块

Webpack v4.6.0+ 增加了对预获取和预加载的支持。

在声明 import 时，使用下面这些内置指令，可以让 webpack 输出 "resource hint(资源提示)"，来告知浏览器：

- **prefetch**(预获取)：将来某些导航下可能需要的资源
- **preload**(预加载)：当前导航下可能需要资源

下面这个 prefetch 的简单示例中，编辑 `index.js`文件：

```js
const button = document.createElement('button')
button.textContent = '点击执行加法运算'
button.addEventListener('click', () => {
  import(/* webpackChunkName: 'math', webpackPrefetch: true */ './math.js').then(({ add }) => {
    console.log(add(4, 5))
  })
})
document.body.appendChild(button)
```

添加第二句魔法注释：`webpackPrefetch: true`

告诉 webpack 执行预获取。这会生成 `<link rel="prefetch" href="math.js">` 并追加到页面头部，指示着浏览器在闲置时间预取 `math.js` 文件。

>09-code-splitting/src/index.js
>
>```js
>// 导入模块
>//...
>import './async-module'
>
>//...
>
>const button = document.createElement('button')
>button.textContent = '点击执行加法运算'
>button.addEventListener('click', () => {
>    import( /* webpackChunkName: 'math', webpackPrefetch: true */ './math.js').then(({
>        add
>    }) => {
>        console.log(add(4, 5))
>    })
>})
>document.body.appendChild(button)
>```

启动服务，在浏览器上查看：

<img src="./images/img-1.7.4-1.png" alt="image-20211007092632530" style="zoom:50%;" />

我们发现，在还没有点击按钮时，`math.bundle.js`就已经下载下来了。同时，在 `app.html`里webpack自动添加了一句：

<img src="./images/img-1.7.4-2.png" alt="image-20211007093411484" style="zoom:50%;" align="left"/>

点击按钮，会立即调用已经下载好的 `math.bundle.js`文件中的 `add` 方法：

<img src="./images/img-1.7.4-3.png" alt="image-20211007093806759" style="zoom:50%;" />

点击按钮，执行 `4+5`的加法运算。

与 prefetch 指令相比，preload 指令有许多不同之处：

- preload chunk 会在父 chunk 加载时，以并行方式开始加载。prefetch chunk 会在父 chunk 加载结束后开始加载。
- preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。
- preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。
- 浏览器支持程度不同。

创建一个 `print.js`文件：

```js
export const print = () => {
  console.log('preload chunk.')
}
```

修改 `index.js`文件：

```js
const button2 = document.createElement('button')
button2.textContent = '点击执行字符串打印'
button2.addEventListener('click', () => {
  import(/* webpackChunkName: 'print', webpackPreload: true */ './print.js').then(({ print }) => {
    print(4, 5)
  })
})
document.body.appendChild(button2)
```

>09-code-splitting/src/index.js
>
>```js
>// 导入模块
>//...
>
>import './async-module'
>
>//...
>
>const button2 = document.createElement('button')
>button2.textContent = '点击执行字符串打印'
>button2.addEventListener('click', () => {
>    import( /* webpackChunkName: 'print', webpackPreload: true */ './print.js').then(({
>        print
>    }) => {
>        print()
>    })
>})
>document.body.appendChild(button2)
>```

启动服务，打开浏览器：

<img src="./images/img-1.7.3.3.png" alt="image-20211007104846669" style="zoom:50%;" />

仔细观察，发现 `print.bundle.js`未被下载，因为我们配置的是 `webpackPreload`, 是在父 chunk 加载时，以并行方式开始加载。点击按钮才加载的模块不会事先加载的。

我们修改一下引入方式：

>09-code-splitting/src/index.js
>
>```js
>//...
>import( /* webpackChunkName: 'print', webpackPreload: true */ './print.js').then(({
>    print
>}) => {
>    print()
>})
>```

再次刷新浏览器页面：

<img src="./images/img-1.7.4-5.png" alt="image-20211007105858087" style="zoom:50%;" />

`print.bundle.js`被加载下来，是和当前`index.bundle.js`并行加载的。



## 1.9 缓存

以上，我们使用 webpack 来打包我们的模块化后的应用程序，webpack 会生成一个可部署的 `/dist` 目录，然后把打包后的内容放置在此目录中。只要 `/dist` 目录中的内容部署到 server 上，client（通常是浏览器）就能够访问此 server 的网站及其资源。而最后一步获取资源是比较耗费时间的，这就是为什么浏览器使用一种名为 [缓存](https://en.wikipedia.org/wiki/Cache_(computing)) 的技术。可以通过命中缓存，以降低网络流量，使网站加载速度更快，然而，如果我们在部署新版本时不更改资源的文件名，浏览器可能会认为它没有被更新，就会使用它的缓存版本。由于缓存的存在，当你需要获取新的代码时，就会显得很棘手。

本节通过必要的配置，以确保 webpack 编译生成的文件能够被客户端缓存，而在文件内容变化后，能够请求到新的文件。

### 1.9.1 输出文件的文件名

我们可以通过替换 `output.filename` 中的 [substitutions](https://webpack.docschina.org/configuration/output/#outputfilename) 设置，来定义输出文件的名称。webpack 提供了一种使用称为 **substitution(可替换模板字符串)** 的方式，通过带括号字符串来模板化文件名。其中，`[contenthash]` substitution 将根据资源内容创建出唯一 hash。当资源内容发生变化时，`[contenthash]` 也会发生变化。

修改配置文件：

```js
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
  },
};
```

>10-caching/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>    //...
>    output: {
>        filename: '[name].[contenthash].js',
>    
>        //...
>    },
>
>    //...
>}
>```

执行打包编译：

<img src="./images/img-1.8.1-1.png" alt="image-20211008210912001" style="zoom:50%;" align="left"/>

可以看到，bundle 的名称是它内容（通过 hash）的映射。如果我们不做修改，然后再次运行构建，文件名会保持不变。

### 1.9.2 缓存第三方库

将第三方库(library)（例如 `lodash`）提取到单独的 `vendor` chunk 文件中，是比较推荐的做法，这是因为，它们很少像本地的源代码那样频繁修改。因此通过实现以上步骤，利用 client 的长效缓存机制，命中缓存来消除请求，并减少向 server 获取资源，同时还能保证 client 代码和 server 代码版本一致。 我们在 `optimization.splitChunks` 添加如下 `cacheGroups` 参数并构建：

```js
splitChunks: {
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      chunks: 'all',
    },
  },
},
```

>10-caching/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>  //...
>
>  optimization: {
>    //...
>    
>    splitChunks: {
>      cacheGroups: {
>        vendor: {
>          test: /[\\/]node_modules[\\/]/,
>          name: 'vendors',
>          chunks: 'all',
>        },
>      },
>    }
>  },
>}
>```

执行编译：

```shell
[felix] 10-caching $ npx webpack
assets by status 746 KiB [cached] 6 assets
assets by status 1.55 MiB [emitted]
  asset vendors.cc405abb852d5860354f.js 1.46 MiB [emitted] [immutable] (name: vendors) (id hint: vendor)
  asset index.ac97de18bcd04fe84ceb.js 67.4 KiB [emitted] [immutable] (name: index)
  asset another.e82e921ba518380decce.js 17.2 KiB [emitted] [immutable] (name: another)
  asset app.html 530 bytes [emitted]
  ...
```

<img src="./images/img-1.8.2-2.png" alt="image-20211008212019923" style="zoom:50%;" align="left"/>

### 1.9.3 将 js 文件放到一个文件夹中

目前，全部 js 文件都在 `dist`文件夹根目录下，我们尝试把它们放到一个文件夹中，这个其实也简单，修改配置文件：

```js
output: {
	filename: 'scripts/[name].[contenthash].js',
},
```

>10-caching/webpack.config.js
>
>```js
>//...
>
>module.exports = {
>    //...
>  
>    output: {
>        filename: 'scripts/[name].[contenthash].js',
>
>        //...
>      },
>	
>	//...
>}
>```

我们在输出配置中修改`filename`，在前面加上路径即可。执行编译：

<img src="./images/img-1.8.3-3.png" alt="image-20211008213755692" style="zoom:50%;" align="left"/>

截止目前，我们已经把 JS 文件、样式文件及图片等资源文件分别放到了 `scripts`、`styles`、`images`三个文件夹中。

## 1.10 拆分开发环境和生产环境配置

现在，我们只能手工的来调整 `mode`选项，实现生产环境和开发环境的切换，且很多配置在生产环境和开发环境中存在不一致的情况，比如开发环境没有必要设置缓存，生产环境还需要设置公共路径等等。

本节介绍拆分开发环境和生产环境，让打包更灵活。

### 1.10.1 公共路径

[`publicPath`](https://webpack.docschina.org/configuration/output/#outputpublicpath) 配置选项在各种场景中都非常有用。你可以通过它来指定应用程序中所有资源的基础路径。

- 基于环境设置

  在开发环境中，我们通常有一个 `assets/` 文件夹，它与索引页面位于同一级别。这没太大问题，但是，如果我们将所有静态资源托管至 CDN，然后想在生产环境中使用呢？

  想要解决这个问题，可以直接使用一个 environment variable(环境变量)。假设我们有一个变量 `ASSET_PATH`：

  ```js
  import webpack from 'webpack';
  
  // 尝试使用环境变量，否则使用根路径
  const ASSET_PATH = process.env.ASSET_PATH || '/';
  
  export default {
    output: {
      publicPath: ASSET_PATH,
    },
  
    plugins: [
      // 这可以帮助我们在代码中安全地使用环境变量
      new webpack.DefinePlugin({
        'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH),
      }),
    ],
  };
  
  ```

  >11-multiple-env/webpack.config.js
  >
  >```js
  >//...
  >import webpack from 'webpack';
  >
  >// 尝试使用环境变量，否则使用根路径
  >const ASSET_PATH = process.env.ASSET_PATH || '/';
  >
  >export default {
  >    output: {
  >        //...
  >    
  >        publicPath: ASSET_PATH,
  >    },
  >
  >    plugins: [
  >        // 这可以帮助我们在代码中安全地使用环境变量
  >        new webpack.DefinePlugin({
  >          'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH),
  >        }),
  >    
  >        //...
  >  	],
  >};
  >```

- ### Automatic publicPath

  有可能你事先不知道 publicPath 是什么，webpack 会自动根据 [`import.meta.url`](https://webpack.docschina.org/api/module-variables/#importmetaurl)、[`document.currentScript`](https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript)、`script.src` 或者 `self.location` 变量设置 publicPath。你需要做的是将 [`output.publicPath`](https://webpack.docschina.org/configuration/output/#outputpublicpath) 设为 `'auto'`：

  ```js
  module.exports = {
    output: {
      publicPath: 'auto',
    },
  };
  ```

  请注意在某些情况下不支持 `document.currentScript`，例如：IE 浏览器，你不得不引入一个 polyfill，例如 [`currentScript Polyfill`](https://github.com/amiller-gh/currentScript-polyfill)。

### 1.10.2 环境变量

想要消除 `webpack.config.js` 在 [开发环境](https://webpack.docschina.org/guides/development) 和 [生产环境](https://webpack.docschina.org/guides/production) 之间的差异，你可能需要环境变量(environment variable)。

webpack 命令行 [环境配置](https://webpack.docschina.org/api/cli/#environment-options) 的 `--env` 参数，可以允许你传入任意数量的环境变量。而在 `webpack.config.js` 中可以访问到这些环境变量。例如，`--env production` 或 `--env goal=local`。

```bash
npx webpack --env goal=local --env production --progress
```

对于我们的 webpack 配置，有一个必须要修改之处。通常，`module.exports` 指向配置对象。要使用 `env` 变量，你必须将 `module.exports` 转换成一个函数：

>11-multiple-env/webpack.config.js
>
>```js
>//...
>module.exports = (env) => {
>  return {
>    //...
>    // 根据命令行参数 env 来设置不同环境的 mode
>    mode: env.production ? 'production' : 'development',
>    //...
>  }
>}
>```

### 1.10.3 拆分配置文件

目前，生产环境和开发环境使用的是一个配置文件，我们需要将这两个文件单独放到不同的配置文件中。如`webpack.config.dev.js`（开发环境配置）和 `webpack.config.prod.js`（生产环境配置）。在项目根目录下创建一个配置文件夹 `config` 来存放他们。

`webpack.config.dev.js` 配置如下：

>11-multiple-env/config/webpack.config.dev.js
>
>```js
>const path = require('path')
>const HtmlWebpackPlugin = require('html-webpack-plugin')
>const MiniCssExtractPlugin = require('mini-css-extract-plugin')
>
>const toml = require('toml')
>const yaml = require('yaml')
>const json5 = require('json5')
>
>module.exports = {
>  entry: {
>    index: './src/index.js',
>    another: './src/another-module.js'
>  },
>
>  output: {
>    filename: 'scripts/[name].js',
>    path: path.resolve(__dirname, './dist'),
>    clean: true,
>    assetModuleFilename: 'images/[contenthash][ext]'
>  },
>
>  mode: 'development',
>
>  devtool: 'inline-source-map',
>
>  plugins: [
>    new HtmlWebpackPlugin({
>      template: './index.html',
>      filename: 'app.html',
>      inject: 'body'
>    }),
>
>    new MiniCssExtractPlugin({
>      filename: 'styles/[contenthash].css'
>    })
>  ],
>
>  devServer: {
>    static: './dist'
>  },
>
>  module: {
>    rules: [
>      {
>        test: /\.png$/,
>        type: 'asset/resource',
>        generator: {
>          filename: 'images/[contenthash][ext]'
>        }
>      },
>
>      {
>        test: /\.svg$/,
>        type: 'asset/inline'
>      },
>
>      {
>        test: /\.txt$/,
>        type: 'asset/source'
>      },
>
>      {
>        test: /\.jpg$/,
>        type: 'asset',
>        parser: {
>          dataUrlCondition: {
>            maxSize: 4 * 1024 * 1024
>          }
>        }
>      },
>
>      {
>        test: /\.(css|less)$/,
>        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
>      },
>
>      {
>        test: /\.(woff|woff2|eot|ttf|otf)$/,
>        type: 'asset/resource'
>      },
>
>      {
>        test: /\.(csv|tsv)$/,
>        use: 'csv-loader'
>      },
>
>      {
>        test: /\.xml$/,
>        use: 'xml-loader'
>      },
>
>      {
>        test: /\.toml$/,
>        type: 'json',
>        parser: {
>          parse: toml.parse
>        }
>      },
>
>      {
>        test: /\.yaml$/,
>        type: 'json',
>        parser: {
>          parse: yaml.parse
>        }
>      },
>
>      {
>        test: /\.json5$/,
>        type: 'json',
>        parser: {
>          parse: json5.parse
>        }
>      },
>
>      {
>        test: /\.js$/,
>        exclude: /node_modules/,
>        use: {
>          loader: 'babel-loader',
>          options: {
>            presets: ['@babel/preset-env'],
>            plugins: [
>              [
>                '@babel/plugin-transform-runtime'
>              ]
>            ]
>          }
>        }
>      }
>    ]
>  },
>
>  optimization: {
>    splitChunks: {
>      cacheGroups: {
>        vendor: {
>          test: /[\\/]node_modules[\\/]/,
>          name: 'vendors',
>          chunks: 'all'
>        }
>      }
>    }
>  }
>}
>```

`webpack.config.prod.js` 配置如下：

>11-multiple-env/config/webpack.config.prod.js
>
>```js
>const path = require('path')
>const HtmlWebpackPlugin = require('html-webpack-plugin')
>const MiniCssExtractPlugin = require('mini-css-extract-plugin')
>const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
>
>const toml = require('toml')
>const yaml = require('yaml')
>const json5 = require('json5')
>
>module.exports = {
>  entry: {
>    index: './src/index.js',
>    another: './src/another-module.js'
>  },
>
>  output: {
>    filename: 'scripts/[name].[contenthash].js',
>    // 打包的dist文件夹要放到上一层目录
>    path: path.resolve(__dirname, '../dist'),
>    clean: true,
>    assetModuleFilename: 'images/[contenthash][ext]',
>    publicPath: 'http://localhost:8080/'
>  },
>
>  mode: 'production',
>
>  plugins: [
>    new HtmlWebpackPlugin({
>      template: './index.html',
>      filename: 'app.html',
>      inject: 'body'
>    }),
>
>    new MiniCssExtractPlugin({
>      filename: 'styles/[contenthash].css'
>    })
>  ],
>  
>  module: {
>    rules: [
>      {
>        test: /\.png$/,
>        type: 'asset/resource',
>        generator: {
>          filename: 'images/[contenthash][ext]'
>        }
>      },
>
>      {
>        test: /\.svg$/,
>        type: 'asset/inline'
>      },
>
>      {
>        test: /\.txt$/,
>        type: 'asset/source'
>      },
>
>      {
>        test: /\.jpg$/,
>        type: 'asset',
>        parser: {
>          dataUrlCondition: {
>            maxSize: 4 * 1024 * 1024
>          }
>        }
>      },
>
>      {
>        test: /\.(css|less)$/,
>        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
>      },
>
>      {
>        test: /\.(woff|woff2|eot|ttf|otf)$/,
>        type: 'asset/resource'
>      },
>
>      {
>        test: /\.(csv|tsv)$/,
>        use: 'csv-loader'
>      },
>
>      {
>        test: /\.xml$/,
>        use: 'xml-loader'
>      },
>
>      {
>        test: /\.toml$/,
>        type: 'json',
>        parser: {
>          parse: toml.parse
>        }
>      },
>
>      {
>        test: /\.yaml$/,
>        type: 'json',
>        parser: {
>          parse: yaml.parse
>        }
>      },
>
>      {
>        test: /\.json5$/,
>        type: 'json',
>        parser: {
>          parse: json5.parse
>        }
>      },
>
>      {
>        test: /\.js$/,
>        exclude: /node_modules/,
>        use: {
>          loader: 'babel-loader',
>          options: {
>            presets: ['@babel/preset-env'],
>            plugins: [
>              [
>                '@babel/plugin-transform-runtime'
>              ]
>            ]
>          }
>        }
>      }
>    ]
>  },
>
>  optimization: {
>    minimizer: [
>      new CssMinimizerPlugin()
>    ],
>
>    splitChunks: {
>      cacheGroups: {
>        vendor: {
>          test: /[\\/]node_modules[\\/]/,
>          name: 'vendors',
>          chunks: 'all'
>        }
>      }
>    }
>  },
>
>  //关闭 webpack 的性能提示
>  performance: {
>    hints:false
>  }
>}
>```

拆分成两个配置文件后，分别运行这两个文件：

开发环境：

```shell
[felix] 10-multiple-env $ npx webpack serve -c ./config/webpack.config.dev.js
```

生产环境：

```shell
[felix] 10-multiple-env $ npx webpack -c ./config/webpack.config.prod.js
```

### 1.10.4 npm 脚本

每次打包或启动服务时，都需要在命令行里输入一长串的命令。我们将父目录的 `package.json`、`node_modules` 与 `package-lock.json `拷贝到当前目录下，

<img src="./images/img-1.10.3-1.png" alt="image-20211023161251468" style="zoom: 50%;" align="left" />

配置 npm 脚本来简化命令行的输入，这时可以省略 `npx`：

>11-multiple-env/package.json
>
>```json
>{
>  "scripts": {
>    "start": "webpack serve -c ./config/webpack.config.dev.js",
>    "build": "webpack -c ./config/webpack.config.prod.js"
>  }
>}
>```

开发环境运行脚本：

```shell
[felix] 10-multiple-env $ npm run start
```

```shell
[felix] 10-multiple-env $ npm run build
```

### 1.10.5 提取公共配置

这时，我们发现这两个配置文件里存在大量的重复代码，可以手动的将这些重复的代码单独提取到一个文件里，

创建 `webpack.config.common.js`，配置公共的内容：

>11-multiple-env/config/webpack.config.common.js
>
>```js
>const path = require('path')
>const HtmlWebpackPlugin = require('html-webpack-plugin')
>const MiniCssExtractPlugin = require('mini-css-extract-plugin')
>
>const toml = require('toml')
>const yaml = require('yaml')
>const json5 = require('json5')
>
>module.exports = {
>  entry: {
>    index: './src/index.js',
>    another: './src/another-module.js'
>  },
>
>  output: {
>    // 注意这个dist的路径设置成上一级
>    path: path.resolve(__dirname, '../dist'),
>    clean: true,
>    assetModuleFilename: 'images/[contenthash][ext]',
>  },
>
>  plugins: [
>    new HtmlWebpackPlugin({
>      template: './index.html',
>      filename: 'app.html',
>      inject: 'body'
>    }),
>
>    new MiniCssExtractPlugin({
>      filename: 'styles/[contenthash].css'
>    })
>  ],
>
>  module: {
>    rules: [
>      {
>        test: /\.png$/,
>        type: 'asset/resource',
>        generator: {
>          filename: 'images/[contenthash][ext]'
>        }
>      },
>
>      {
>        test: /\.svg$/,
>        type: 'asset/inline'
>      },
>
>      {
>        test: /\.txt$/,
>        type: 'asset/source'
>      },
>
>      {
>        test: /\.jpg$/,
>        type: 'asset',
>        parser: {
>          dataUrlCondition: {
>            maxSize: 4 * 1024
>          }
>        }
>      },
>
>      {
>        test: /\.(css|less)$/,
>        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
>      },
>
>      {
>        test: /\.(woff|woff2|eot|ttf|otf)$/,
>        type: 'asset/resource'
>      },
>
>      {
>        test: /\.(csv|tsv)$/,
>        use: 'csv-loader'
>      },
>
>      {
>        test: /\.xml$/,
>        use: 'xml-loader'
>      },
>
>      {
>        test: /\.toml$/,
>        type: 'json',
>        parser: {
>          parse: toml.parse
>        }
>      },
>
>      {
>        test: /\.yaml$/,
>        type: 'json',
>        parser: {
>          parse: yaml.parse
>        }
>      },
>
>      {
>        test: /\.json5$/,
>        type: 'json',
>        parser: {
>          parse: json5.parse
>        }
>      },
>
>      {
>        test: /\.js$/,
>        exclude: /node_modules/,
>        use: {
>          loader: 'babel-loader',
>          options: {
>            presets: ['@babel/preset-env'],
>            plugins: [
>              [
>                '@babel/plugin-transform-runtime'
>              ]
>            ]
>          }
>        }
>      }
>    ]
>  },
>
>  optimization: {
>    splitChunks: {
>      cacheGroups: {
>        vendor: {
>          test: /[\\/]node_modules[\\/]/,
>          name: 'vendors',
>          chunks: 'all'
>        }
>      }
>    }
>  },
>  
>  //关闭 webpack 的性能提示
>  performance: {
>    hints:false
>  }
>}
>```

改写 `webpack.config.dev.js`:

>11-multiple-env/config/webpack.config.dev.js
>
>```js
>module.exports = {
>  // 开发环境不需要配置缓存
>  output: {
>    filename: 'scripts/[name].js',
>  },
>
>  // 开发模式
>  mode: 'development',
>
>  // 配置 source-map
>  devtool: 'inline-source-map',
>
>  // 本地服务配置
>  devServer: {
>    static: './dist'
>  }
>}
>```

修改 `webpack.config.prod.js`:

>11-multiple-env/config/webpack.config.prod.js
>
>```js
>const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
>
>module.exports = {
>  // 生产环境需要缓存
>  output: {
>    filename: 'scripts/[name].[contenthash].js',
>    publicPath: 'http://localhost:8080/'
>  },
>
>  // 生产环境模式
>  mode: 'production',
>
>  // 生产环境 css 压缩
>  optimization: {
>    minimizer: [
>      new CssMinimizerPlugin()
>    ]
>  }
>}
>```

### 1.10.6 合并配置文件

配置文件拆分好后，新的问题来了，如何保证配置合并没用问题呢？[webpack-merge](https://www.npmjs.com/package/webpack-merge) 这个工具可以完美解决这个问题。

<img src="./images/img-1.10.2-1.png" alt="image-20211023142058484" style="zoom:33%;" />

安装 `webpack-merge`:

```
[felix] felixcourses $ npm install webpack-merge -D
```

创建 `webpack.config.js`，合并代码：

>11-multiple-env/config/webpack.config.js
>
>```js
>const { merge } = require('webpack-merge')
>
>const commonConfig = require('./webpack.config.common.js')
>
>const productionConfig = require('./webpack.config.prod.js')
>
>const developmentConfig = require('./webpack.config.dev')
>
>module.exports = (env) => {
>  switch(true) {
>    case env.development:
>      return merge(commonConfig, developmentConfig)
>    case env.production:
>      return merge(commonConfig, productionConfig)
>    default:
>      throw new Error('No matching configuration was found!');
>  }
>}
>```



# 二、高级应用篇
上述我们基于webpack构建了我们的基础工程化环境，将我们认为需要的功能配置了上去。
除开公共基础配置之外，我们意识到两点:
1. 开发环境(mode=development),追求强大的开发功能和效率，配置各种方便开发的功能;
2. 生产环境(mode=production),追求更小更轻量的bundle(即打包产物);

接下来基于我们的开发需求，完善我们的工程化配置的同时，来介绍一些常用并强大的工具。
## 2.1 提高开发效率，完善团队开发规范

### 2.1.1 source-map
作为一个开发——无论是什么开发，要求开发环境最不可少的一点功能就是——debug功能。
之前我们通过webpack,将我们的源码打包成了bundle.js。
试想：实际上客户端(浏览器)读取的是打包后的bundle.js,那么当浏览器执行代码报错的时候，报错的信息自然也是bundle的内容。
我们如何将报错信息(bundle错误的语句及其所在行列)映射到源码上？

是的，souce-map。

webpack已经内置了sourcemap的功能，我们只需要通过简单的配置，将可以开启它。


```js
module.exports = {
  // 开启 source map
  // 开发中推荐使用 'source-map'
  // 生产环境一般不开启sourcemap
  devtool: 'source-map',
}
```
当我们执行打包命令之后，我们发现bundle的最后一行总是会多出一个注释，指向打包出的bundle.map.js(sourcemap文件)。
sourcemap文件用来描述 源码文件和bundle文件的代码位置映射关系。基于它，我们将bundle文件的错误信息映射到源码文件上。

除开'source-map'外，还可以基于我们的需求设置其他值，webpack——devtool一共提供了7种SourceMap模式：

| 模式 | 解释 |
| ---- | ----- | 
| eval  |	每个module会封装到 eval 里包裹起来执行，并且会在末尾追加注释 //@ sourceURL. |
|source-map	| 生成一个SourceMap文件. |
|hidden-source-map	| 和 source-map 一样，但不会在 bundle 末尾追加注释. |
|inline-source-map	| 生成一个 DataUrl 形式的 SourceMap 文件. |
|eval-source-map  | 每个module会通过eval()来执行，并且生成一个DataUrl形式的SourceMap. |
|cheap-source-map	| 生成一个没有列信息（column-mappings）的SourceMaps文件，不包含loader的 sourcemap（譬如 babel 的 sourcemap）|
|cheap-module-source-map	| 生成一个没有列信息（column-mappings）的SourceMaps文件，同时 loader 的 sourcemap 也被简化为只包含对应行的。| 

要注意的是，生产环境我们一般不会开启sourcemap功能，主要有两点原因:
1. 通过bundle和sourcemap文件，可以反编译出源码————也就是说，线上产物有soucemap文件的话，就意味着有暴漏源码的风险。
2. 我们可以观察到，sourcemap文件的体积相对比较巨大,这跟我们生产环境的追求不同(生产环境追求更小更轻量的bundle)。

> 一道思考题: 有时候我们期望能第一时间通过线上的错误信息，来追踪到源码位置，从而快速解决掉bug以减轻损失。但又不希望sourcemap文件报漏在生产环境，有比较好的方案吗？


### 2.1.2 resolve使用
+ path.resolve
在webpack中，很多情况下需要用到文件的绝对路径来精准的命中文件。path.resolve结合__dirname,是比较常用的写法。如：
```js
{
  // ...others
  output: {
    path: path.resolve(__dirname, 'dist'), //求出绝对路径
    filename: 'bundle.js'
  },
  //// ...others
}
```
+ require.resolve？
用来获取模块的ID
### 2.1.3 devServer
开发环境下，我们往往需要启动一个web服务，方便我们模拟一个用户从浏览器中访问我们的web服务，读取我们的打包产物，以观测我们的代码在客户端的表现。
webpack内置了这样的功能，我们只需要简单的配置就可以开启它。

在此之前，我们需要安装它
```shell
yarn add -D webpack-dev-server
```

devServer.proxy基于强大的中间键 http-proxy-middleware 实现的,因此它支持很多的配置项，我们基于此，可以做应对绝大多数开发场景的定制化配置。

基础使用：
```js
const path = require('path');
module.exports = {
  //...
  devServer: {
    // static: {
    //   directory: path.join(__dirname, 'dist'),
    // }, // 默认是把/dist目录当作web服务的根目录
    compress: true, //可选择开启gzips压缩功能，对应静态资源请求的响应头里的Content-Encoding: gzip 
    port: 3000, // 端口号
  },
};
```
为了方便，我们配置一下工程的脚本命令，在package.json的scripts里。
```js
{
  //...
  "scripts": {
    //...
    "dev": "webpack serve --mode development" 
    
  }
}
```
注意！如果您需要指定配置文件的路径，请在命令的后面添加 --config [path], 比如:
```shell
webpack serve --mode development --config webpack.config.js 
```

这时，当我们yarn dev(或者npm run dev)时，就可以在日志里看到————它启动了一个http服务。
(webpack-dev-server的最底层实现是源自于node的http模块。)
```shell
> webpack serve --mode development

<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:3000/
<i> [webpack-dev-server] On Your Network (IPv4): http://192.168.0.107:3000/
<i> [webpack-dev-server] On Your Network (IPv6): http://[fe80::1]:3000/
<i> [webpack-dev-server] Content not from webpack is served from '/Users/wxy/codeWorks/githubPros/demos/webpack5demo/public' directory
asset bundle.js 289 KiB [emitted] (name: main) 1 related asset
asset index.html 161 bytes [emitted]
runtime modules 27.2 KiB 13 modules
modules by path ./node_modules/ 207 KiB 36 modules
modules by path ./src/ 6.06 KiB
  modules by path ./src/*.css 2.92 KiB
    ./src/styles.css 2.25 KiB [built] [code generated]
    ./node_modules/css-loader/dist/cjs.js!./src/styles.css 684 bytes [built] [code generated]
  modules by path ./src/*.less 3.07 KiB
    ./src/styles.less 2.37 KiB [built] [code generated]
    ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/styles.less 717 bytes [built] [code generated]
  ./src/index.js 75 bytes [built] [code generated]
webpack 5.60.0 compiled successfully in 1004 ms

```
上述是一个基本的示例，我们可以根据自己的需求定制化devServer的参数对象，比如添加响应头，开启代理来解决跨域问题, http2, https等功能。



+ 添加响应头
有些场景需求下，我们需要为所有响应添加headers,来对资源的请求和响应打入标志，以便做一些安全防范，或者方便发生异常后做请求的链路追踪。比如:
```js
// webpack-config
module.exports = {
  //...
  devServer: {
    headers: {
      'X-Fast-Id': 'p3fdg42njghm34gi9ukj',
    },
  },
};
```
这时，在浏览器中右键检查(或者使用f12快捷键)，在Network一栏查看任意资源访问，我们发现响应头里成功打入了一个FastId。
```YAML
Response Headers
  /** some others**/
  X-Fast-Id: p3fdg42njghm34gi9ukj
```
headers的配置也可以传一个函数：
```js
module.exports = {
  //...
  devServer: {
    headers: () => {
      return { 'X-Bar': ['key1=value1', 'key2=value2'] };
    },
  },
};

```
比如我们的标志ID(X-Fast-Id)，很明显这个id不应该写死，而是随机生成的————这时候你就可以用函数实现这个功能。

+ 开启代理
我们打包出的js bundle里有时会含有一些对特定接口的网络请求(ajax/fetch).
要注意，此时客户端地址是在 http://localhost:3000/ 下，假设我们的接口来自 http://localhost:4001/ ，那么毫无疑问，此时控制台里会报错并提示你跨域。
如何解决这个问题？
在开发环境下，我们可以使用devServer自带的proxy功能：
```js
module.exports = {
  //...
  devServer: {
    proxy: {
      '/api': 'http://localhost:4001',
    },
  },
};
```
现在，对 /api/users 的请求会将请求代理到 http://localhost:4001/api/users 。
如果不希望传递/api，则需要重写路径：
```js
module.exports = {
  //...
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        pathRewrite: { '^/api': '' },
      },
    },
  },
};
```
默认情况下，将不接受在 HTTPS 上运行且证书无效的后端服务器。 如果需要，可以这样修改配置：
```js
module.exports = {
  //...
  devServer: {
    proxy: {
      '/api': {
        target: 'https://other-server.example.com',
        secure: false,
      },
    },
  },
};
```

+ https
如果想让我们的本地http服务变成https服务，我们只需要这样配置:
```js
module.exports = {
  //...
  devServer: {
    https: true,  // https//localhost...
  },
};
```
注意，此时我们访问http://localhost:port 是无法访问我们的服务的，我们需要在地址栏里加前缀：https:
注意:由于默认配置使用的是自签名证书，所以有得浏览器会告诉你是不安全的，但我们依然可以继续访问它。
当然我们也可以提供自己的证书——如果有的话：
```js
module.exports = {
  devServer: {
    https: {
      cacert: './server.pem',
      pfx: './server.pfx',
      key: './server.key',
      cert: './server.crt',
      passphrase: 'webpack-dev-server',
      requestCert: true,
    },
  },
};
```

+ http2
如果想要配置http2，那么直接设置：
```js
 devServer: {
    http2: true,  // https//localhost...
  },
```
即可，http2默认自带https自签名证书，当然我们仍然可以通过https配置项来使用自己的证书。

+ historyApiFallback
如果我们的应用是个SPA(单页面应用)，当路由到/some时(可以直接在地址栏里输入)，会发现此时刷新页面后，控制台会报错。
```YAML
GET http://localhost:3000/some 404 (Not Found)
```
此时打开network，刷新并查看，就会发现问题所在———浏览器把这个路由当作了静态资源地址去请求，然而我们并没有打包出/some这样的资源，所以这个访问无疑是404的。
如何解决它？
这种时候，我们可以通过配置来提供页面代替任何404的静态资源响应：
```js
module.exports = {
  //...
  devServer: {
    historyApiFallback: true,
  },
};
```
此时重启服务刷新后发现请求变成了index.html。
当然，在多数业务场景下，我们需要根据不同的访问路径定制替代的页面，这种情况下，我们可以使用rewrites这个配置项。
类似这样：
```js
module.exports = {
  //...
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/views/landing.html' },
        { from: /^\/subpage/, to: '/views/subpage.html' },
        { from: /./, to: '/views/404.html' },
      ],
    },
  },
};

```
+ 开发服务器主机
如果你在开发环境中起了一个devserve服务，并期望你的同事能访问到它，你只需要配置：
```js
module.exports = {
  //...
  devServer: {
    host: '0.0.0.0',
  },
};
```
这时候，如果你的同事跟你处在同一局域网下，就可以通过局域网ip来访问你的服务啦。


### 2.1.4 模块热替换与热加载
+ 模块热替换(文件替换时，自动刷新我们的服务)
>HMR - hot module replacement， 热替换

启用 webpack 的 热模块替换 特性，需要配置devServer.hot参数：
```js
module.exports = {
  //...
  devServer: {
    hot: true,
  },
};
```
此时我们实现了基本的模块热替换功能。

+ HMR 加载样式
如果你配置了style-loader，那么现在已经同样支持样式文件的热替换功能了。
```js
module.exports={
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
```
这是因为style-loader的实现使用了module.hot.accept，在CSS依赖模块更新之后，会对 style 标签打补丁。从而实现了这个功能。

+ 热加载(文件更新时，自动刷新我们的服务和页面)
新版的webpack-dev-server默认已经开启了热加载的功能。
它对应的参数是devServer.liveReload，默认为true。
注意，如果想要关掉它，要将liveReload设置为false的同时，也要关掉hot

```js
module.exports = {
  //...
  devServer: {
    liveReload: false, //默认为true，即开启热更新功能。
  },
};
```

### 2.1.5 eslint
eslint是用来扫描我们所写的代码是否符合规范的工具。
往往我们的项目是多人协作开发的，我们期望统一的代码规范，这时候可以让eslint来对我们进行约束。
严格意义上来说，eslint配置跟webpack无关，但在工程化开发环境中，它往往是不可或缺的。
```shell
yarn add eslint -D
```

配置eslint，只需要在根目录下添加一个.eslintrc文件(或者.eslintrc.json, .js等)。
当然，我们可以使用eslint工具来自动生成它：
```shell
npx eslint --init
```
我们可以看到控制台里的展示：
```shell
wxy@melodyWxydeMacBook-Pro webpack5demo % npx eslint --init
✔ How would you like to use ESLint? · syntax
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · react
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser
✔ What format do you want your config file to be in? · JSON
```
并生成了一个配置文件（.eslintrc.json)，这样我们就完成了eslint的基本规则配置。
eslint配置文件里的配置项含义如下：
1. env
指定脚本的运行环境。每种环境都有一组特定的预定义全局变量。此处使用的 browser 预定义了浏览器环境中的全局变量，es6 启用除了 modules 以外的所有 ECMAScript 6 特性（该选项会自动设置 ecmaVersion 解析器选项为 6）。
2. globals
脚本在执行期间访问的额外的全局变量。也就是 env 中未预定义，但我们又需要使用的全局变量。
3. extends
检测中使用的预定义的规则集合。
4. rules
启用的规则及其各自的错误级别，会合并 extends 中的同名规则，定义冲突时优先级更高。
5. parserOptions
ESLint 允许你指定你想要支持的 JavaScript 语言选项。ecmaFeatures 是个对象，表示你想使用的额外的语言特性，这里 jsx 代表启用 JSX。ecmaVersion 用来指定支持的 ECMAScript 版本 。默认为 5，即仅支持 es5，你可以使用 6、7、8、9 或 10 来指定你想要使用的 ECMAScript 版本。你也可以用使用年份命名的版本号指定为 2015（同 6），2016（同 7），或 2017（同 8）或 2018（同 9）或 2019 (same as 10)。上面的 env 中启用了 es6，自动设置了ecmaVersion 解析器选项为 6。
plugins
plugins 是一个 npm 包，通常输出 eslint 内部未定义的规则实现。rules 和 extends 中定义的规则，并不都在 eslint 内部中有实现。比如 extends 中的plugin:react/recommended，其中定义了规则开关和等级，但是这些规则如何生效的逻辑是在其对应的插件 ‘react’ 中实现的。


接下来，我们在这个配置文件里额外添加一个规则：
```js
{
  // ...others
  "rules": {
    "no-console": "warn" // 我们在rules里自定义我们的约束规范
  }
}
```
我们通过命令来让elisnt检测代码——在我们的package.scripts里添加一个脚本命令:
```js
// package.json
{
  "scripts": {
    // ...others
    "eslint": "eslint ./src"
  }
}
```

然后执行它:

```shell
xxx@MacBook-Pro webpack5demo % npm run eslint
> eslint src

/Users/wxy/codeWorks/githubPros/demos/webpack5demo/src/index.js
  3:1  warning  Unexpected console statement  no-console
  4:1  warning  Unexpected console statement  no-console

✖ 2 problems (0 errors, 2 warnings)
```
果然，因为代码中含有console.log,所以被警告了。

3. 结合webpack使用
我们期望eslint能够实时提示报错而不必等待执行命令。
这个功能可以通过给自己的IDE(代码编辑器)安装对应的eslint插件来实现。
然而，不是每个IDE都有插件，如果不想使用插件，又想实时提示报错，那么我们可以结合 webpack 的打包编译功能来实现。
```js
  //...
  {
        test: /\.(js|jsx)$/,
        exclude: /node-modules/,
        use: ['babel-loader', 'eslint-loader']
  },
 // ...
```
因为我们使用了devServer，因此需要在devServer下添加一个对应的配置参数：
```js
module.exports = {
  //...
  devServer: {
    liveReload: false, //默认为true，即开启热更新功能。
  },
};
```
现在我们就可以实时地看到代码里的不规范报错啦。

+ husky
为了保证团队里的开发人员提交的代码符合规范，我们可以在开发者上传代码时进行校验。
我们常用 husky 和 lint-staged 来进行代码提交时的 eslint 校验：
```js
// package.json 
// 先安装：yarn add husky lint-staged -D
"husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx}": [
      "eslint"
    ]
  },
```
这样提交 commit 时，会对我们本次 commit 修改涉及到的文件进行 eslint 校验，如果有报错，则不允许 commit。
大大保证了团队开发的规范化。


## 2.2 模块

### 2.2.1 ECMAScript模块

### 2.2.2 Webpack模块

### 2.2.3 依赖图

### 2.2.4 依赖管理

## 2.3 扩展功能

### 2.3.1 post-css, css模块

### 2.3.2 webworks

### 2.3.3 TypeScript

## 2.4 多页面应用

### 2.4.1 entry高级用法



```shell
[felix] 01-entry $ npm install webpack webpack-cli
```



```shell
[felix] 01-entry $ npm i style-loader css-loader less-loader less mini-css-extract-plugin -D
```



### 2.4.2 target

### 2.4.3 多页面应用

### 2.4.4 配置index.html模板-handlebars

## 2.5 Tree-shaking

## 2.6 渐进式网络应用程序

## 2.7 shimming 预置依赖

## 2.8 模块联邦（微前端）

## 2.9 创建 library

### 2.9.1 外部扩展 (Externals)

...

## 2.10 提升构建性能





#三、拓展提升篇

- Loader,

- plugin

- 开发loader, plugin

#四、项目实战篇

- Webpack与React
- Webpack与Vue
- Webpack与jQuery
- Webpck与Node/Express

#五、内部原理篇

webpack原理

