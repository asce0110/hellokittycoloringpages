#!/usr/bin/env node

/**
 * Next.js路由架构诊断脚本
 * 用于分析和验证动态路由系统的健康状态
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Next.js路由架构诊断开始...\n');

// 1. 检查关键文件存在性
function checkCriticalFiles() {
  const criticalFiles = [
    'app/[slug]/page.tsx',
    'app/api/seo-url/route.ts',
    'lib/seo-url-storage.ts',
    '.seo-url-cache.json'
  ];
  
  console.log('📁 检查关键文件:');
  const missingFiles = [];
  
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(path.resolve(file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) missingFiles.push(file);
  });
  
  if (missingFiles.length > 0) {
    console.log(`\n⚠️  缺失关键文件: ${missingFiles.join(', ')}`);
    return false;
  }
  
  console.log('✅ 所有关键文件存在\n');
  return true;
}

// 2. 分析SEO缓存数据
function analyzeSeoCache() {
  console.log('💾 SEO缓存分析:');
  
  try {
    const cacheData = JSON.parse(fs.readFileSync('.seo-url-cache.json', 'utf8'));
    const entries = Object.entries(cacheData);
    
    console.log(`  📊 总缓存条目: ${entries.length}`);
    
    // 检查过期数据
    const now = Date.now();
    const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24小时
    const expiredEntries = entries.filter(([_, data]) => 
      now - data.timestamp > EXPIRY_TIME
    );
    
    console.log(`  ⏰ 过期条目: ${expiredEntries.length}`);
    
    // 显示示例条目
    console.log('  📝 示例条目:');
    entries.slice(0, 3).forEach(([slug, data]) => {
      const isExpired = now - data.timestamp > EXPIRY_TIME;
      console.log(`    • ${slug} → ${data.title} ${isExpired ? '(过期)' : ''}`);
    });
    
    // 检查URL格式一致性
    const urlFormats = entries.map(([slug]) => {
      if (slug.includes('-coloring-pages')) return 'standard';
      if (slug.match(/\d{6}$/)) return 'legacy';
      return 'other';
    });
    
    const formatCounts = urlFormats.reduce((acc, format) => {
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    }, {});
    
    console.log('  🔗 URL格式分布:', formatCounts);
    
  } catch (error) {
    console.log(`  ❌ SEO缓存读取失败: ${error.message}`);
    return false;
  }
  
  console.log('✅ SEO缓存分析完成\n');
  return true;
}

// 3. 检查路由冲突
function checkRouteConflicts() {
  console.log('🚦 路由冲突检查:');
  
  try {
    const pageContent = fs.readFileSync('app/[slug]/page.tsx', 'utf8');
    
    // 提取STATIC_ROUTES
    const staticRoutesMatch = pageContent.match(/STATIC_ROUTES = new Set\(\[([\s\S]*?)\]\)/);
    if (staticRoutesMatch) {
      const staticRoutesStr = staticRoutesMatch[1];
      const routes = staticRoutesStr.match(/'([^']+)'/g)?.map(r => r.slice(1, -1)) || [];
      
      console.log(`  📋 静态路由保护: ${routes.length} 个路由`);
      console.log('  🛡️  保护的路由:', routes.slice(0, 5).join(', '), routes.length > 5 ? '...' : '');
      
      // 检查是否有潜在冲突
      const cacheData = JSON.parse(fs.readFileSync('.seo-url-cache.json', 'utf8'));
      const dynamicSlugs = Object.keys(cacheData);
      const conflicts = dynamicSlugs.filter(slug => routes.includes(slug));
      
      if (conflicts.length > 0) {
        console.log(`  ⚠️  发现路由冲突: ${conflicts.join(', ')}`);
        return false;
      }
      
    } else {
      console.log('  ⚠️  无法提取静态路由配置');
    }
    
  } catch (error) {
    console.log(`  ❌ 路由冲突检查失败: ${error.message}`);
    return false;
  }
  
  console.log('✅ 无路由冲突\n');
  return true;
}

// 4. 模拟路由解析过程
function simulateRouteResolution() {
  console.log('🧪 路由解析模拟:');
  
  const testSlugs = [
    'beach-bucket-coloring-pages',
    'hello-kitty-test-123456', // 旧格式测试
    'admin', // 静态路由测试
    'non-existent-page' // 不存在页面测试
  ];
  
  try {
    const pageContent = fs.readFileSync('app/[slug]/page.tsx', 'utf8');
    const cacheData = JSON.parse(fs.readFileSync('.seo-url-cache.json', 'utf8'));
    
    // 提取STATIC_ROUTES
    const staticRoutesMatch = pageContent.match(/STATIC_ROUTES = new Set\(\[([\s\S]*?)\]\)/);
    const staticRoutes = staticRoutesMatch ? 
      staticRoutesMatch[1].match(/'([^']+)'/g)?.map(r => r.slice(1, -1)) || [] : [];
    
    testSlugs.forEach(slug => {
      console.log(`  🔍 测试路由: ${slug}`);
      
      // 检查是否为静态路由
      if (staticRoutes.includes(slug)) {
        console.log('    → 静态路由，不处理为着色页面');
        return;
      }
      
      // 检查SEO缓存
      const normalizedSlug = slug.replace(/-\d{6}$/, ''); // 移除旧格式数字
      if (cacheData[normalizedSlug]) {
        console.log(`    → ✅ 在SEO缓存中找到: ${cacheData[normalizedSlug].title}`);
      } else if (cacheData[slug]) {
        console.log(`    → ✅ 在SEO缓存中找到: ${cacheData[slug].title}`);
      } else {
        console.log('    → ❌ SEO缓存中未找到，将尝试库数据匹配');
      }
    });
    
  } catch (error) {
    console.log(`  ❌ 路由解析模拟失败: ${error.message}`);
    return false;
  }
  
  console.log('✅ 路由解析模拟完成\n');
  return true;
}

// 5. 性能分析
function performanceAnalysis() {
  console.log('⚡ 性能分析:');
  
  try {
    const cacheData = JSON.parse(fs.readFileSync('.seo-url-cache.json', 'utf8'));
    const cacheSize = JSON.stringify(cacheData).length;
    
    console.log(`  📦 缓存文件大小: ${(cacheSize / 1024).toFixed(2)} KB`);
    console.log(`  🔢 平均条目大小: ${(cacheSize / Object.keys(cacheData).length).toFixed(2)} bytes`);
    
    // 检查重复数据
    const imageUrls = Object.values(cacheData).map(d => d.imageUrl);
    const uniqueImages = new Set(imageUrls).size;
    
    if (uniqueImages < imageUrls.length) {
      console.log(`  ⚠️  检测到重复图片: ${imageUrls.length - uniqueImages} 个重复`);
    } else {
      console.log('  ✅ 无重复图片数据');
    }
    
  } catch (error) {
    console.log(`  ❌ 性能分析失败: ${error.message}`);
    return false;
  }
  
  console.log('✅ 性能分析完成\n');
  return true;
}

// 6. 生成诊断报告
function generateReport() {
  const checks = [
    { name: '关键文件检查', fn: checkCriticalFiles },
    { name: 'SEO缓存分析', fn: analyzeSeoCache },
    { name: '路由冲突检查', fn: checkRouteConflicts },
    { name: '路由解析模拟', fn: simulateRouteResolution },
    { name: '性能分析', fn: performanceAnalysis }
  ];
  
  const results = checks.map(check => {
    console.log(`\n═══ ${check.name} ═══`);
    const success = check.fn();
    return { name: check.name, success };
  });
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 诊断报告摘要');
  console.log('═'.repeat(50));
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  const totalPassed = results.filter(r => r.success).length;
  const healthScore = Math.round((totalPassed / results.length) * 100);
  
  console.log(`\n🏥 架构健康得分: ${healthScore}%`);
  
  if (healthScore >= 80) {
    console.log('🎉 路由架构状态良好！');
  } else if (healthScore >= 60) {
    console.log('⚠️  路由架构需要一些优化');
  } else {
    console.log('🚨 路由架构存在重要问题，需要立即修复');
  }
  
  console.log('\n📝 建议:');
  if (totalPassed < results.length) {
    console.log('• 修复上述失败的检查项');
    console.log('• 清理过期的SEO缓存数据');
    console.log('• 确保所有路由都有适当的错误处理');
  }
  console.log('• 定期运行此诊断脚本监控系统健康状态');
  console.log('• 考虑添加自动化测试覆盖路由逻辑\n');
}

// 运行诊断
if (require.main === module) {
  generateReport();
}

module.exports = {
  checkCriticalFiles,
  analyzeSeoCache,
  checkRouteConflicts,
  simulateRouteResolution,
  performanceAnalysis
};