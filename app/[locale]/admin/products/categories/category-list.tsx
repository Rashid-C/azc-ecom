'use client'

import { useState, useTransition } from 'react'
import { renameCategory } from '@/lib/actions/product.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Pencil, Check, X } from 'lucide-react'

export default function CategoryList({
  categories,
}: {
  categories: string[]
}) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [localCategories, setLocalCategories] = useState(categories)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const startEdit = (cat: string) => {
    setEditingCategory(cat)
    setNewName(cat)
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setNewName('')
  }

  const confirmRename = (oldName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) {
      cancelEdit()
      return
    }
    startTransition(async () => {
      const result = await renameCategory(oldName, trimmed)
      if (result.modifiedCount >= 0) {
        setLocalCategories((prev) =>
          prev.map((c) => (c === oldName ? trimmed : c))
        )
        toast({
          description: `Renamed "${oldName}" → "${trimmed}" (${result.modifiedCount} products updated)`,
        })
      } else {
        toast({ variant: 'destructive', description: 'Rename failed' })
      }
      setEditingCategory(null)
      setNewName('')
    })
  }

  return (
    <div className='space-y-2 max-w-lg'>
      {localCategories.map((cat) => (
        <div
          key={cat}
          className='flex items-center gap-2 p-3 rounded-lg border bg-card'
        >
          {editingCategory === cat ? (
            <>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRename(cat)
                  if (e.key === 'Escape') cancelEdit()
                }}
                autoFocus
                className='h-8'
              />
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-green-600'
                onClick={() => confirmRename(cat)}
                disabled={isPending}
              >
                <Check className='w-4 h-4' />
              </Button>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-red-500'
                onClick={cancelEdit}
                disabled={isPending}
              >
                <X className='w-4 h-4' />
              </Button>
            </>
          ) : (
            <>
              <span className='flex-1 font-medium'>{cat}</span>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8'
                onClick={() => startEdit(cat)}
              >
                <Pencil className='w-4 h-4' />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
