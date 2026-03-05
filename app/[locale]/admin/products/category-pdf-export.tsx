'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getAllCategoriesForAdmin, getProductsByCategoryForExport } from '@/lib/actions/product.actions'
import { formatId } from '@/lib/utils'
import { Download, Loader2, Tag, ChevronDown } from 'lucide-react'

export default function CategoryPdfExport() {
  const [categories, setCategories] = useState<string[]>([])
  const [loadingCat, setLoadingCat] = useState<string | null>(null)

  useEffect(() => {
    getAllCategoriesForAdmin().then(setCategories).catch(console.error)
  }, [])

  const handleExport = async (category: string) => {
    setLoadingCat(category)
    try {
      const products = await getProductsByCategoryForExport(category)

      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // Header
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`Category: ${category}`, 14, 15)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(
        `Generated: ${new Date().toLocaleString()}  |  Total: ${products.length} product${products.length !== 1 ? 's' : ''}`,
        14,
        22
      )
      doc.setTextColor(0)

      autoTable(doc, {
        startY: 27,
        head: [['#', 'ID', 'Product Name', 'List Price', 'Net Price', 'Description', 'Stock', 'Published', 'Last Updated']],
        body: products.map((p, i) => [
          i + 1,
          formatId(p._id.toString()),
          p.name,
          `AED ${Number(p.listPrice).toFixed(2)}`,
          `AED ${Number(p.price).toFixed(2)}`,
          p.description
            ? p.description.length > 80
              ? p.description.substring(0, 80) + '...'
              : p.description
            : '-',
          p.countInStock,
          p.isPublished ? 'Yes' : 'No',
          p.updatedAt
            ? new Date(p.updatedAt).toLocaleDateString('en-AE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '-',
        ]),
        styles: { fontSize: 7.5, cellPadding: 2, overflow: 'linebreak', valign: 'middle' },
        headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 22 },
          2: { cellWidth: 42 },
          3: { cellWidth: 22, halign: 'right' },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 70 },
          6: { cellWidth: 14, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 30 },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          const pageCount = (doc as any).internal.getNumberOfPages()
          doc.setFontSize(7)
          doc.setTextColor(150)
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'center' }
          )
        },
      })

      const safeName = category.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      doc.save(`products-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('Category PDF export failed:', err)
    } finally {
      setLoadingCat(null)
    }
  }

  const isLoading = loadingCat !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' disabled={isLoading} className='gap-2'>
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Tag className='h-4 w-4' />
          )}
          {isLoading ? `Generating "${loadingCat}"…` : 'By Category'}
          {!isLoading && <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='max-h-72 overflow-y-auto w-52'>
        <DropdownMenuLabel className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Download className='h-3.5 w-3.5' />
          Download by Category
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.length === 0 ? (
          <div className='px-3 py-2 text-sm text-muted-foreground'>Loading…</div>
        ) : (
          categories.map((cat) => (
            <DropdownMenuItem
              key={cat}
              onSelect={() => handleExport(cat)}
              className='cursor-pointer text-sm'
            >
              <Tag className='h-3.5 w-3.5 mr-2 text-muted-foreground shrink-0' />
              {cat}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
