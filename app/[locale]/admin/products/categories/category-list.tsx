'use client'

import { useState, useTransition } from 'react'
import { renameCategory } from '@/lib/actions/product.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Pencil, Check, X, ExternalLink, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

type CategoryWithCount = {
  name: string
  count: number
  published: number
}

function nameToHsl(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return { color: `hsl(${hue},60%,48%)`, bg: `hsl(${hue},60%,48%,0.12)` }
}

export default function CategoryList({
  categories,
}: {
  categories: CategoryWithCount[]
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
    if (!trimmed || trimmed === oldName) { cancelEdit(); return }
    startTransition(async () => {
      const result = await renameCategory(oldName, trimmed)
      if (result.modifiedCount >= 0) {
        setLocalCategories((prev) =>
          prev.map((c) => (c.name === oldName ? { ...c, name: trimmed } : c))
        )
        toast({ description: `"${oldName}" → "${trimmed}" · ${result.modifiedCount} products updated` })
      } else {
        toast({ variant: 'destructive', description: 'Rename failed' })
      }
      setEditingCategory(null)
      setNewName('')
    })
  }

  return (
    <div className='rounded-2xl border bg-card shadow-sm overflow-hidden'>

      {/* ── Desktop table header ── */}
      <div className='hidden md:grid md:grid-cols-[44px_1fr_220px_100px_100px_110px] items-center px-5 py-3 bg-muted/50 border-b gap-4'>
        <span />
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Category</span>
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Published rate</span>
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center'>Published</span>
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center'>Total</span>
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right'>Actions</span>
      </div>

      {/* ── Mobile header ── */}
      <div className='flex md:hidden items-center justify-between px-4 py-3 bg-muted/50 border-b'>
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Categories</span>
        <span className='text-xs text-muted-foreground'>{localCategories.length} total</span>
      </div>

      <div className='divide-y divide-border/60'>
        {localCategories.map((cat, index) => {
          const isEditing = editingCategory === cat.name
          const unpublished = cat.count - cat.published
          const publishPct = cat.count > 0 ? Math.round((cat.published / cat.count) * 100) : 0
          const { color, bg } = nameToHsl(cat.name)
          const initial = cat.name.charAt(0).toUpperCase()

          return (
            <div
              key={cat.name}
              className={`group transition-colors duration-150 ${
                isEditing ? 'bg-primary/5' : 'hover:bg-muted/30'
              }`}
            >
              {/* ── Desktop row ── */}
              <div className='hidden md:grid md:grid-cols-[44px_1fr_220px_100px_100px_110px] items-center px-5 py-4 gap-4'>

                {/* Avatar */}
                <div
                  className='w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm'
                  style={{ backgroundColor: color }}
                >
                  {initial}
                </div>

                {/* Name / edit */}
                {isEditing ? (
                  <div className='flex items-center gap-2'>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename(cat.name)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                      className='h-9'
                    />
                    <Button size='icon' variant='ghost'
                      className='h-9 w-9 shrink-0 text-green-600 hover:bg-green-500/10'
                      onClick={() => confirmRename(cat.name)} disabled={isPending}>
                      <Check className='w-4 h-4' />
                    </Button>
                    <Button size='icon' variant='ghost'
                      className='h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10'
                      onClick={cancelEdit} disabled={isPending}>
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className='font-semibold text-sm'>{cat.name}</p>
                    {unpublished > 0 && (
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {unpublished} draft{unpublished > 1 ? 's' : ''} hidden
                      </p>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                {!isEditing ? (
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span>{publishPct}% live</span>
                      <span>{cat.published}/{cat.count}</span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all duration-700'
                        style={{
                          width: `${publishPct}%`,
                          backgroundColor: publishPct >= 80 ? '#22c55e' : publishPct >= 40 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                ) : <div />}

                {/* Published count */}
                <div className='flex justify-center'>
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400'>
                    <Eye className='w-3 h-3' />
                    {cat.published}
                  </span>
                </div>

                {/* Total count */}
                <div className='flex justify-center'>
                  <span
                    className='inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold'
                    style={{ backgroundColor: bg, color }}
                  >
                    {cat.count}
                  </span>
                </div>

                {/* Actions */}
                {!isEditing ? (
                  <div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Button size='icon' variant='ghost' className='h-8 w-8'
                      onClick={() => startEdit(cat.name)} title='Rename'>
                      <Pencil className='w-3.5 h-3.5' />
                    </Button>
                    <Link href={`/search?category=${encodeURIComponent(cat.name)}`} target='_blank'>
                      <Button size='icon' variant='ghost' className='h-8 w-8 text-muted-foreground' title='View in store'>
                        <ExternalLink className='w-3.5 h-3.5' />
                      </Button>
                    </Link>
                  </div>
                ) : <div />}
              </div>

              {/* ── Mobile row ── */}
              <div className='flex md:hidden items-center gap-3 px-4 py-3.5'>
                {/* Avatar */}
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0'
                  style={{ backgroundColor: color }}
                >
                  {initial}
                </div>

                {/* Name + bar */}
                <div className='flex-1 min-w-0'>
                  {isEditing ? (
                    <div className='flex items-center gap-1.5'>
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename(cat.name)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        autoFocus
                        className='h-8 text-sm'
                      />
                      <Button size='icon' variant='ghost'
                        className='h-8 w-8 shrink-0 text-green-600 hover:bg-green-500/10'
                        onClick={() => confirmRename(cat.name)} disabled={isPending}>
                        <Check className='w-4 h-4' />
                      </Button>
                      <Button size='icon' variant='ghost'
                        className='h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10'
                        onClick={cancelEdit} disabled={isPending}>
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center justify-between gap-2 mb-1.5'>
                        <p className='font-semibold text-sm truncate'>{cat.name}</p>
                        <div className='flex items-center gap-1 shrink-0'>
                          <span className='flex items-center gap-0.5 text-xs text-green-600 font-medium'>
                            <Eye className='w-3 h-3' />{cat.published}
                          </span>
                          {unpublished > 0 && (
                            <span className='flex items-center gap-0.5 text-xs text-muted-foreground'>
                              <EyeOff className='w-3 h-3' />{unpublished}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{
                            width: `${publishPct}%`,
                            backgroundColor: publishPct >= 80 ? '#22c55e' : publishPct >= 40 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile actions */}
                {!isEditing && (
                  <div className='flex items-center gap-0.5'>
                    <Button size='icon' variant='ghost' className='h-8 w-8'
                      onClick={() => startEdit(cat.name)}>
                      <Pencil className='w-3.5 h-3.5' />
                    </Button>
                    <Link href={`/search?category=${encodeURIComponent(cat.name)}`} target='_blank'>
                      <Button size='icon' variant='ghost' className='h-8 w-8 text-muted-foreground'>
                        <ExternalLink className='w-3.5 h-3.5' />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between px-5 py-3 bg-muted/30 border-t'>
        <p className='text-xs text-muted-foreground'>
          {localCategories.length} categor{localCategories.length === 1 ? 'y' : 'ies'}
        </p>
        <p className='text-xs text-muted-foreground hidden md:block'>
          Hover a row to rename or open in store
        </p>
      </div>
    </div>
  )
}
