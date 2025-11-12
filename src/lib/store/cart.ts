import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          const items = existingItem
            ? state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            : [...state.items, { ...item, quantity: 1 }]
          return {
            items,
            total: items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
          }
        })
      },
      removeItem: (id) => {
        set((state) => {
          const items = state.items.filter((i) => i.id !== id)
          return {
            items,
            total: items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
          }
        })
      },
      updateQuantity: (id, quantity) => {
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
          return {
            items,
            total: items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
          }
        })
      },
      clearCart: () => {
        set({ items: [], total: 0 })
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)