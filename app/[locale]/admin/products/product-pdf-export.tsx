'use client'

import { Button } from '@/components/ui/button'
import { getAllProductsForExport } from '@/lib/actions/product.actions'
import { formatId } from '@/lib/utils'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function ProductPdfExport() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const products = await getAllProductsForExport()

      // Dynamic import to keep bundle small and avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // Header
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Product Catalog', 14, 15)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Generated: ${new Date().toLocaleString()}  |  Total: ${products.length} products`, 14, 22)
      doc.setTextColor(0)

      autoTable(doc, {
        startY: 27,
        head: [
          ['#', 'ID', 'Product Name', 'List Price', 'Net Price', 'Description', 'Stock', 'Published', 'Last Updated'],
        ],
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
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          overflow: 'linebreak',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },   // #
          1: { cellWidth: 22 },                     // ID
          2: { cellWidth: 42 },                     // Name
          3: { cellWidth: 22, halign: 'right' },    // List Price
          4: { cellWidth: 22, halign: 'right' },    // Net Price
          5: { cellWidth: 70 },                     // Description
          6: { cellWidth: 14, halign: 'center' },   // Stock
          7: { cellWidth: 18, halign: 'center' },   // Published
          8: { cellWidth: 30 },                     // Last Updated
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Footer with page number
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

      doc.save(`products-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleExport}
      disabled={loading}
      className='gap-2'
    >
      {loading ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Download className='h-4 w-4' />
      )}
      {loading ? 'Generating...' : 'Download PDF'}
    </Button>
  )
}
