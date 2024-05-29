/** 将英文标点转换为中文标点 */
export function en2zh() {
  const nodes = document.querySelectorAll('body > p, .abstract, .keywords, .author, .school')
  nodes.forEach(node => {
    let text = node.textContent ?? ''
    // 替换中英文逗号和句号
    text = text.replace(/, /g, '，').replace(/\. /g, '。').replace(/\.$/, '。')
    // 替换中英文冒号
    text = text.replace(/: /g, '：')
    // 替换中英文分号
    text = text.replace(/; /g, '；')
    // 替换中英文感叹号
    text = text.replace(/! /g, '！').replace(/!$/, '！')
    // 替换中英文问号
    text = text.replace(/\? /g, '？').replace(/\?$/, '？')
    // 替换中英文括号
    text = text.replace(/ \(/g, '（').replace(/\) /g, '）')
    // 恢复et al.,
    text = text.replace(/et al\.，/g, 'et al., ').replace(/et al。/g, 'et al. ')
    // 设置新文本
    node.textContent = text
  })
}

/** 将中文标点转换为英文标点 */
export function zh2en() {
  const nodes = document.querySelectorAll('body > p, .abstract, .keywords, .author, .school')
  nodes.forEach(node => {
    let text = node.textContent ?? ''
    // 替换中英文逗号和句号
    text = text.replace(/，/g, ', ').replace(/。 /g, '. ')
    // 替换中英文冒号
    text = text.replace(/：/g, ': ')
    // 替换中英文分号
    text = text.replace(/；/g, '; ')
    // 替换中英文感叹号
    text = text.replace(/！/g, '! ')
    // 替换中英文问号
    text = text.replace(/？/g, '? ')
    // 替换中英文括号
    text = text.replace(/（/g, ' (').replace(/）/g, ') ')
    // 设置新文本
    node.textContent = text
  })
}

/**
 * 解析自定义标签
 * @param md markdown 字符串
 * @returns 转换后的 markdown 字符串
 */
export function parseCustomTags(md: string): string {
  // 作者
  md = md.replace(/#author# (.*)/mg, '<div class="author">$1</div>')
  // 单位
  md = md.replace(/#school# (.*)/mg, '<div class="school">$1</div>')
  // 关键词
  md = md.replace(/#keywords# (.*)/mg, '<div class="keywords">$1</div>')
  // 摘要
  md = md.replace(/#abstract# (.*)/mg, '<div class="abstract">$1</div>')
  // 返回处理后的字符串
  return md
}