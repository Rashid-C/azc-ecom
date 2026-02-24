export const APP_NAME=process.env.NEXT_PUBLIC_APP_NAME || "AZC E-commerce"
export const APP_SLOGAN=process.env.NEXT_PUBLIC_SLOGAN || "laptop"
export const APP_DESCRIPTION=process.env.NEXT_PUBLIC_DESCRIPTION || "AZC_ELCTRONICTSLLC"
export const PAGE_SIZE = Number(process.env.PAGE_SIZE || 9)
export const FREE_SHIPPING_MIN_PRICE = Number(
  process.env.FREE_SHIPPING_MIN_PRICE || 35
)



export const APP_COPYRIGHT =
  process.env.NEXT_PUBLIC_APP_COPYRIGHT ||
  `Copyright © 2026 ${APP_NAME}. All rights reserved.`