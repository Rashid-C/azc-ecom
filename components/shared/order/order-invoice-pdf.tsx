'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { IOrder } from '@/lib/db/models/order.model'
import { formatId } from '@/lib/utils'

export interface InvoiceSite {
  name: string
  address: string
  email: string
  phone: string
  url: string
}

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-AE', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

const fmtAed = (n: number) => `AED ${n.toFixed(2)}`

export default function OrderInvoicePdf({
  order,
  site,
}: {
  order: IOrder
  site: InvoiceSite
}) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const jsPDF   = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = doc.internal.pageSize.getWidth()   // 210
      const H = doc.internal.pageSize.getHeight()  // 297
      const ML = 15   // margin left
      const MR = 15   // margin right
      const CW = W - ML - MR  // content width = 180

      const orderId    = formatId(order._id.toString())
      const invoiceNo  = `INV-${orderId}`

      // ─── Palette ───────────────────────────────────────────
      const blue:   [number,number,number] = [30, 64, 175]    // primary
      const blueL:  [number,number,number] = [239, 246, 255]  // blue-50
      const dark:   [number,number,number] = [15, 23, 42]     // near-black
      const gray:   [number,number,number] = [107, 114, 128]  // text-gray-500
      const grayL:  [number,number,number] = [249, 250, 251]  // row alt
      const border: [number,number,number] = [229, 231, 235]  // gray-200
      const green:  [number,number,number] = [21, 128, 61]
      const orange: [number,number,number] = [194, 65, 12]
      const red:    [number,number,number] = [185, 28, 28]
      const white:  [number,number,number] = [255, 255, 255]

      // ══════════════════════════════════════════════════════
      // 1.  COMPANY  (top-left)  +  INVOICE TITLE  (top-right)
      // ══════════════════════════════════════════════════════
      let y = 18

      // Company name
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(...dark)
      doc.text(site.name, ML, y)

      // "INVOICE" big word — right
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(32)
      doc.setTextColor(...blue)
      doc.text('INVOICE', W - MR, y + 2, { align: 'right' })

      y += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...gray)
      doc.text(site.address, ML, y);            y += 5
      doc.text(`${site.email}`, ML, y);         y += 5
      doc.text(`Tel: ${site.phone}`, ML, y);    y += 5
      doc.text(site.url.replace(/^https?:\/\//, ''), ML, y)

      // Invoice meta — right column aligned with company text
      const metaX  = W - MR - 75
      const metaLX = metaX
      const metaVX = W - MR
      let   my     = 25

      const meta: [string, string][] = [
        ['Invoice No.', invoiceNo],
        ['Invoice Date', fmtDate(order.createdAt)],
        ['Payment', order.paymentMethod],
      ]

      for (const [lbl, val] of meta) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...gray)
        doc.text(lbl, metaLX, my)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...dark)
        doc.text(val, metaVX, my, { align: 'right' })
        my += 6
      }

      // Status badge inline
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...gray)
      doc.text('Status', metaLX, my)
      const statusText = order.isCancelled
        ? `CANCELLED${order.cancelledAt ? ` ${fmtDate(order.cancelledAt)}` : ''}`
        : order.isPaid
          ? 'PAID'
          : 'UNPAID'
      const statusColor: [number,number,number] = order.isCancelled ? red : order.isPaid ? green : orange
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...statusColor)
      doc.text(statusText, metaVX, my, { align: 'right' })

      // ── Blue rule ──────────────────────────────────────────
      const ruleY = 52
      doc.setFillColor(...blue)
      doc.rect(ML, ruleY, CW, 0.8, 'F')

      // ══════════════════════════════════════════════════════
      // 2.  BILL TO  +  ORDER INFO  side-by-side boxes
      // ══════════════════════════════════════════════════════
      const boxTop   = ruleY + 6
      const halfW    = CW / 2 - 3
      const boxH     = 36

      // LEFT: Bill To
      doc.setFillColor(...grayL)
      doc.setDrawColor(...border)
      doc.setLineWidth(0.25)
      doc.roundedRect(ML, boxTop, halfW, boxH, 2, 2, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(...blue)
      doc.text('BILL TO', ML + 5, boxTop + 7)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(...dark)
      doc.text(order.shippingAddress.fullName, ML + 5, boxTop + 14)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...gray)
      const a1 = `${order.shippingAddress.street}, ${order.shippingAddress.city}`
      const a2 = `${order.shippingAddress.province}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
      doc.text(a1, ML + 5, boxTop + 20, { maxWidth: halfW - 8 })
      doc.text(a2, ML + 5, boxTop + 25, { maxWidth: halfW - 8 })
      doc.text(`Phone: ${order.shippingAddress.phone}`, ML + 5, boxTop + 31)

      // RIGHT: Order Info
      const rightBoxX = ML + halfW + 6
      doc.setFillColor(...blueL)
      doc.setDrawColor(...border)
      doc.roundedRect(rightBoxX, boxTop, halfW, boxH, 2, 2, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(...blue)
      doc.text('ORDER DETAILS', rightBoxX + 5, boxTop + 7)

      const orderMeta: [string, string, [number,number,number]?][] = [
        ['Order Date',  fmtDate(order.createdAt)],
        ['Expected',    order.expectedDeliveryDate ? fmtDate(order.expectedDeliveryDate) : '—'],
        [
          'Delivery',
          order.isCancelled
            ? `Cancelled${order.cancelledAt ? ` ${fmtDate(order.cancelledAt)}` : ''}`
            : order.isDelivered
              ? `Delivered ${fmtDate(order.deliveredAt!)}`
              : 'Pending',
          order.isCancelled ? red : order.isDelivered ? green : orange,
        ],
        [
          'Payment',
          order.isCancelled
            ? 'Cancelled'
            : order.isPaid
              ? `Paid ${fmtDate(order.paidAt!)}`
              : 'Pending',
          order.isCancelled ? red : order.isPaid ? green : orange,
        ],
      ]

      let omy = boxTop + 14
      for (const [lbl, val, color] of orderMeta) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...gray)
        doc.text(lbl, rightBoxX + 5, omy)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...(color ?? dark))
        doc.text(val, rightBoxX + halfW - 4, omy, { align: 'right' })
        omy += 5.5
      }

      // ══════════════════════════════════════════════════════
      // 3.  ITEMS TABLE
      // ══════════════════════════════════════════════════════
      const tableStartY = boxTop + boxH + 8

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...blue)
      doc.text('ITEMS', ML, tableStartY - 2)

      autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Total']],
        body: order.items.map((item, i) => {
          const sub: string[] = []
          if (item.color) sub.push(`Color: ${item.color}`)
          if (item.size)  sub.push(`Size: ${item.size}`)
          return [
            i + 1,
            item.name + (sub.length ? `\n${sub.join('  |  ')}` : ''),
            item.quantity,
            fmtAed(Number(item.price)),
            fmtAed(Number(item.price) * item.quantity),
          ]
        }),
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
          overflow: 'linebreak',
          valign: 'middle',
          textColor: dark,
        },
        headStyles: {
          fillColor: blue,
          textColor: white,
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        alternateRowStyles: { fillColor: grayL },
        bodyStyles: { lineColor: border, lineWidth: 0.15 },
        columnStyles: {
          0: { cellWidth: 9,  halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 13, halign: 'center' },
          3: { cellWidth: 32, halign: 'right' },
          4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: ML, right: MR },
        tableLineColor: border,
        tableLineWidth: 0.15,
      })

      // ══════════════════════════════════════════════════════
      // 4.  TOTALS  (right-aligned, no boxes)
      // ══════════════════════════════════════════════════════
      const totStartY = (doc as any).lastAutoTable.finalY + 8
      const totLabelX = W - MR - 65
      const totValueX = W - MR

      const totRows: [string, number][] = [
        ['Subtotal',     Number(order.itemsPrice)],
        ['Shipping',     Number(order.shippingPrice)],
        ['VAT (5%)',     Number(order.taxPrice)],
      ]

      let ty = totStartY
      for (const [lbl, amt] of totRows) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(...gray)
        doc.text(lbl, totLabelX, ty)
        doc.setTextColor(...dark)
        doc.text(fmtAed(amt), totValueX, ty, { align: 'right' })
        ty += 7
      }

      // Divider above grand total
      doc.setDrawColor(...border)
      doc.setLineWidth(0.4)
      doc.line(totLabelX, ty, totValueX, ty)
      ty += 1

      // Grand total row — blue background strip
      doc.setFillColor(...blue)
      doc.rect(totLabelX - 4, ty + 1, totValueX - totLabelX + 8, 11, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...white)
      doc.text('GRAND TOTAL', totLabelX, ty + 8)
      doc.text(fmtAed(Number(order.totalPrice)), totValueX, ty + 8, { align: 'right' })

      ty += 18

      // ══════════════════════════════════════════════════════
      // 5.  THANK YOU NOTE
      // ══════════════════════════════════════════════════════
      if (ty < H - 30) {
        doc.setDrawColor(...border)
        doc.setLineWidth(0.25)
        doc.line(ML, ty, ML + CW, ty)
        ty += 6
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...dark)
        doc.text('Thank you for your order!', ML, ty)
        ty += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...gray)
        doc.text(
          `If you have any questions about this invoice, contact us at ${site.email} or call ${site.phone}.`,
          ML, ty, { maxWidth: CW }
        )
      }

      // ══════════════════════════════════════════════════════
      // 6.  FOOTER  (always pinned near bottom)
      // ══════════════════════════════════════════════════════
      const footerY = H - 14
      doc.setDrawColor(...border)
      doc.setLineWidth(0.25)
      doc.line(ML, footerY - 4, W - MR, footerY - 4)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...gray)
      doc.text(
        `${site.name}  ·  ${site.address}  ·  ${site.email}  ·  ${site.phone}`,
        W / 2, footerY, { align: 'center' }
      )
      doc.text(`${invoiceNo}  ·  Page 1 of 1`, W - MR, footerY, { align: 'right' })

      doc.save(`${invoiceNo}.pdf`)
    } catch (err) {
      console.error('Invoice generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleDownload}
      disabled={loading}
      className='gap-2 w-full'
    >
      {loading ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Download className='h-4 w-4' />
      )}
      {loading ? 'Generating...' : 'Download Invoice'}
    </Button>
  )
}
