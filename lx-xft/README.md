



## 新房通PC v2.0.2

#### 技术栈

1.采用coala框架 [作者（陈海峰）](https://github.com/cheft)，可参考同类框架[Riot](http://riotjs.com/zh/)
        
    内核非常小
    
    依赖 jquery, 支持 IE6+
    
    API简单，容易上手
        
 API
 
    init     初始化
 
    update   更新     
 
    updated  更新完成  
    
    mount    挂载
 
    unmount  卸载     

2.默认采用 [doT](http://olado.github.io/doT/) 模板引擎；随时可以替换

    
#### 安装及开发说明

- Sublime3  text    需要安装三个插件：

    1. sublimeLiter

    2. sublimeLiter-contrib-eslint

    3. EditorConfig
    
    前面两个用于Eslint监测，最后一个用于统一编辑器代码风格。

- 通过npm安装本地服务第三方依赖模块(需要已安装Node.js)，使用npm安装依赖模块可能会很慢，建议换成cnpm

      $ npm install -g cnpm --registry=http://registry.npm.taobao.org
    
      $ cd xinfang-xft
    
      #安装依赖模块
      $ cnpm install

      #启动运行
      $ npm start
      

- 项目目录结构说明

      .
      
      ├── README.md           
      ├── dist                     // 项目build目录
      ├── index.html               // 项目主页
      ├── package.json             // 项目配置文件
      ├── webpack.config.js        // 开发的Webpack 配置文件
      ├── .eslintrc.js             //Eslint配置文件      需要安装 cnpm install -g eslint
      ├── .eslintignore         //忽略需要检查的文件
      ├── .editorconfig            //统一代码风格配置文件  
      ├── assets                    // css js 和图片资源等静态资源
      ├── app                      // 生产目录 
      │   ├── components           // 各种组件存放目录
      │   ├── index                // 某个具体组件目录(主页面组件)
      │   ├── common.js            // 通用js文件
      │   ├── config.js            // 项目全局变量配置文件
      │   ├── utils.js             // 日期工具类
      .







