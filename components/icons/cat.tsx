import type { SVGProps } from "react"

export const Cat = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 4h-3V2h-4v2H7v6l5 8 5-8V4z" />
    <circle cx="12" cy="15" r="1" />
  </svg>
)
