// 测试移动端路由修复
const https = require('https')

const testUrls = [
  'https://coloringpagesprintable.net/api/seo-url?slug=test',
  'https://coloringpagesprintable.net/api/library-images?limit=5',
  'https://coloringpagesprintable.net/hello-kitty-coloring-pages'
]

async function testUrl(url) {
  return new Promise((resolve) => {
    console.log(`\n🔍 测试: ${url}`)
    
    https.get(url, (res) => {
      console.log(`📊 状态码: ${res.statusCode}`)
      console.log(`📋 响应头:`, res.headers['content-type'])
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          if (res.headers['content-type']?.includes('application/json')) {
            const json = JSON.parse(data)
            console.log(`✅ JSON响应:`, Object.keys(json))
          } else {
            console.log(`📄 HTML响应长度: ${data.length}`)
            if (data.includes('404')) {
              console.log('❌ 检测到404页面')
            }
          }
        } catch (error) {
          console.log(`⚠️ 解析响应失败:`, error.message)
        }
        resolve()
      })
    }).on('error', (err) => {
      console.log(`❌ 请求失败:`, err.message)
      resolve()
    })
  })
}

async function runTests() {
  console.log('🚀 开始测试移动端路由修复...')
  
  for (const url of testUrls) {
    await testUrl(url)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒
  }
  
  console.log('\n✅ 测试完成!')
}

runTests()