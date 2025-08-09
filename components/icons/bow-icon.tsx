import type { SVGProps } from "react"

export function BowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 10.414l-4.95 4.95-1.414-1.414L10.586 9H4v-2h8v2h-2.586l4.95 4.95-1.414 1.414L12 10.414zM20 7h-8V5h2.586l-4.95-4.95 1.414-1.414L18 4.586V2h2v5z" />
      <path d="M12 13.586l-4.95-4.95-1.414 1.414L10.586 15H4v2h8v-2h-2.586l4.95-4.95-1.414-1.414L12 13.586zM20 17h-8v-2h2.586l-4.95 4.95 1.414 1.414L18 19.414V22h2v-5z" />
    </svg>
  )
}
