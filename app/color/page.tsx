import { permanentRedirect } from "next/navigation"

/**
 * 处理访问 /color 路径的用户
 * 重定向到 /library 页面，因为这更符合用户期望
 */
export default function ColorRootPage() {
  // 301永久重定向到library页面
  permanentRedirect('/library')
}