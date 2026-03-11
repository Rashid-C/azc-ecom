import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Cart, OrderItem, ShippingAddress } from '@/types'
import { calcDeliveryDateAndPrice } from '@/lib/actions/order.actions'

const initialState: Cart = {
    items: [],
    itemsPrice: 0,
    taxPrice: undefined,
    shippingPrice: undefined,
    totalPrice: 0,
    paymentMethod: undefined,
    shippingAddress: undefined,
    deliveryDateIndex: undefined,
    fulfillmentMethod: 'store-pickup',
}

interface CartState {
    cart: Cart
    addItem: (item: OrderItem, quantity: number) => Promise<string>
    updateItem: (item: OrderItem, quantity: number) => Promise<void>
    removeItem: (item: OrderItem) => void
    clearCart: () => void
    setShippingAddress: (shippingAddress: ShippingAddress) => Promise<void>
    setPaymentMethod: (paymentMethod: string) => void
    setDeliveryDateIndex: (index: number) => Promise<void>
    setFulfillmentMethod: (method: 'store-pickup' | 'home-delivery') => Promise<void>
}

const useCartStore = create(
    persist<CartState>(
        (set, get) => ({
            cart: initialState,

            addItem: async (item: OrderItem, quantity: number) => {
                const { items, shippingAddress, fulfillmentMethod } = get().cart
                const existItem = items.find(
                    (x) =>
                        x.product === item.product &&
                        x.color === item.color &&
                        x.size === item.size
                )

                if (existItem) {
                    if (existItem.countInStock < quantity + existItem.quantity) {
                        throw new Error('Not enough items in stock')
                    }
                } else {
                    if (item.countInStock < item.quantity) {
                        throw new Error('Not enough items in stock')
                    }
                }

                const updatedCartItems = existItem
                    ? items.map((x) =>
                        x.product === item.product &&
                            x.color === item.color &&
                            x.size === item.size
                            ? { ...existItem, quantity: existItem.quantity + quantity }
                            : x
                    )
                    : [...items, { ...item, quantity }]

                set({
                    cart: {
                        ...get().cart,
                        items: updatedCartItems,
                        ...(await calcDeliveryDateAndPrice({
                            items: updatedCartItems,
                            shippingAddress,
                            fulfillmentMethod,
                        })),
                    },
                })
                const foundItem = updatedCartItems.find(
                    (x) =>
                        x.product === item.product &&
                        x.color === item.color &&
                        x.size === item.size
                )
                if (!foundItem) {
                    throw new Error('Item not found in cart')
                }
                return foundItem.clientId
            },

            updateItem: async (item: OrderItem, quantity: number) => {
                const { items, shippingAddress, fulfillmentMethod } = get().cart
                const exist = items.find(
                    (x) =>
                        x.product === item.product &&
                        x.color === item.color &&
                        x.size === item.size
                )
                if (!exist) return
                const updatedCartItems = items.map((x) =>
                    x.product === item.product &&
                        x.color === item.color &&
                        x.size === item.size
                        ? { ...exist, quantity: quantity }
                        : x
                )
                set({
                    cart: {
                        ...get().cart,
                        items: updatedCartItems,
                        ...(await calcDeliveryDateAndPrice({
                            items: updatedCartItems,
                            shippingAddress,
                            fulfillmentMethod,
                        })),
                    },
                })
            },
            removeItem: async (item: OrderItem) => {
                const { items, shippingAddress, fulfillmentMethod } = get().cart
                const updatedCartItems = items.filter(
                    (x) =>
                        x.product !== item.product ||
                        x.color !== item.color ||
                        x.size !== item.size
                )
                set({
                    cart: {
                        ...get().cart,
                        items: updatedCartItems,
                        ...(await calcDeliveryDateAndPrice({
                            items: updatedCartItems,
                            shippingAddress,
                            fulfillmentMethod,
                        })),
                    },
                })
            },

            setShippingAddress: async (shippingAddress: ShippingAddress) => {
                const { items, fulfillmentMethod } = get().cart
                set({
                    cart: {
                        ...get().cart,
                        shippingAddress,
                        ...(await calcDeliveryDateAndPrice({
                            items,
                            shippingAddress,
                            fulfillmentMethod,
                        })),
                    },
                })
            },
            setPaymentMethod: (paymentMethod: string) => {
                set({
                    cart: {
                        ...get().cart,
                        paymentMethod,
                    },
                })
            },
            setDeliveryDateIndex: async (index: number) => {
                const { items, shippingAddress, fulfillmentMethod } = get().cart

                set({
                    cart: {
                        ...get().cart,
                        ...(await calcDeliveryDateAndPrice({
                            items,
                            shippingAddress,
                            deliveryDateIndex: index,
                            fulfillmentMethod,
                        })),
                    },
                })
            },
            setFulfillmentMethod: async (method: 'store-pickup' | 'home-delivery') => {
                const { items, shippingAddress, deliveryDateIndex } = get().cart
                set({
                    cart: {
                        ...get().cart,
                        fulfillmentMethod: method,
                        ...(await calcDeliveryDateAndPrice({
                            items,
                            shippingAddress,
                            deliveryDateIndex,
                            fulfillmentMethod: method,
                        })),
                    },
                })
            },
            clearCart: () => {
                set({
                    cart: {
                        ...get().cart,
                        items: [],
                    },
                })
            },

            init: () => set({ cart: initialState }),
        }),
        {
            name: 'cart-store',
        }
    )
)
export default useCartStore
