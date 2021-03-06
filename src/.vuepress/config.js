const { description } = require('../../package')
const { yuanqiSidebars } = require('./sidebar')
const { publicNav } = require('./nav')
module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: "Martin's blog",
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,
  dest: './dist',
  /**
   * Extra tags to be injected to the page HTML `<head>`
   *  注入到当前页面的 HTML <head> 中的标签中的
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    ['link', { rel: 'icon', href: '/favicon.ico' }], // 增加一个自定义的 favicon(网页标签的图标)
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    // sidebarDepth: 2, // e'b将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: '最后更新时间', // 文档更新时间：每个文件git最后提交的时间
    // 顶部的 navigation,内部链接 以src为根目录
    nav: [...publicNav],
    /**
     * 这里是配置每个页面的 sidebar,每个页面可以有不同 sidebar;
     * 也可以在 每个文件夹的的 READEME.md 直接配置,如,config
     * 一般每个 page 的 sidebar 共有三级;
     * title: 一级(最顶级),一般就不可点击
     * page : src/xx 每个目录的 md 文件可以作为第二级别(确切的说是 md 文件中的#级别)
     * ## : 每个 md 文件中的 ## 作为第三级
     * 一个 md 文件中最好有一个 #, 做为sidebar 的二级
     */
    sidebar: {
      '/guide/': [
        {
          title: 'Guide', //最顶级
          collapsable: false,
          children: [''], // 文件名称 作为 children
        },
      ],
      '/shared-es/': [
        {
          title: 'Shared-es',
          collapsable: false,
          children: ['', 'tag.md'], // 文件名称
        },
      ],
      '/yuanqi/': [
        {
          title: '元气壁纸', //最顶级
          collapsable: false,
          children: yuanqiSidebars(), // 文件名称 作为 children
        },
      ],
      '/unitTest/': [
        {
          title: 'unitTest',
          collapsable: false,
          children: ['', 'TestTemplate.md', 'Tips.md'], // 文件名称
        },
      ],
    },
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: ['@vuepress/plugin-back-to-top', '@vuepress/plugin-medium-zoom'],
  configureWebpack: {
    resolve: {
      alias: {
        '@alias': '../',
      },
    },
  },
  markdown: {
    lineNumbers: true, // 代码块显示行号
  },
  // base: '/web_accumulate/', // 这是部署到github相关的配置
}
