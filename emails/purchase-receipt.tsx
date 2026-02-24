import {
    Body,
    Column,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { formatCurrency } from '@/lib/utils'
import { OrderItem, ShippingAddress } from '@/types'
import { SERVER_URL } from '@/lib/constants'

export type PurchaseReceiptOrder = {
    _id: string
    createdAt: Date
    totalPrice: number
    itemsPrice: number
    taxPrice: number
    shippingPrice: number
    user: {
        name: string
        email: string
    }
    shippingAddress: ShippingAddress
    items: OrderItem[]
    paymentMethod: string
    expectedDeliveryDate: Date
    isDelivered: boolean
    isPaid: boolean
    paidAt?: Date
}

type OrderInformationProps = {
    order: PurchaseReceiptOrder
}

PurchaseReceiptEmail.PreviewProps = {
    order: {
        _id: '123',
        createdAt: new Date(),
        isPaid: true,
        paidAt: new Date(),
        totalPrice: 100,
        itemsPrice: 100,
        taxPrice: 0,
        shippingPrice: 0,
        user: {
            name: 'John Doe',
            email: 'john.doe@example.com',
        },
        shippingAddress: {
            fullName: 'John Doe',
            street: '123 Main St',
            city: 'New York',
            postalCode: '12345',
            country: 'USA',
            phone: '123-456-7890',
            province: 'New York',
        },
        items: [
            {
                clientId: '123',
                name: 'Product 1',
                image: 'https://via.placeholder.com/150',
                price: 100,
                quantity: 1,
                product: '123',
                slug: 'product-1',
                category: 'Category 1',
                countInStock: 10,
            },
        ],
        paymentMethod: 'PayPal',
        expectedDeliveryDate: new Date(),
        isDelivered: true,
    },
} satisfies OrderInformationProps

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

const getMimeType = (filePath: string) => {
    const extension = path.extname(filePath).toLowerCase()
    if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
    if (extension === '.png') return 'image/png'
    if (extension === '.webp') return 'image/webp'
    if (extension === '.gif') return 'image/gif'
    if (extension === '.svg') return 'image/svg+xml'
    return 'application/octet-stream'
}

const resolveEmailImageSrc = async (image: string) => {
    if (/^https?:\/\//i.test(image)) return image

    const normalizedImagePath = image.startsWith('/') ? image : `/${image}`
    const absoluteImagePath = path.join(
        process.cwd(),
        'public',
        normalizedImagePath.replace(/^\//, '')
    )

    try {
        const fileBuffer = await readFile(absoluteImagePath)
        const mimeType = getMimeType(absoluteImagePath)
        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
    } catch {
        return `${SERVER_URL}${normalizedImagePath}`
    }
}

export default async function PurchaseReceiptEmail({
    order,
}: OrderInformationProps) {
    const itemsWithImageSrc = await Promise.all(
        order.items.map(async (item) => ({
            ...item,
            emailImageSrc: await resolveEmailImageSrc(item.image),
        }))
    )

    return (
        <Html>
            <Preview>View order receipt</Preview>
            <Tailwind>
                <Head />
                <Body className='font-sans bg-white'>
                    <Container className='max-w-xl'>
                        <Heading>Purchase Receipt</Heading>
                        <Section>
                            <Row>
                                <Column>
                                    <Text className='mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4'>
                                        Order ID
                                    </Text>
                                    <Text className='mt-0 mr-4'>{order._id.toString()}</Text>
                                </Column>
                                <Column>
                                    <Text className='mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4'>
                                        Purchased On
                                    </Text>
                                    <Text className='mt-0 mr-4'>
                                        {dateFormatter.format(order.createdAt)}
                                    </Text>
                                </Column>
                                <Column>
                                    <Text className='mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4'>
                                        Price Paid
                                    </Text>
                                    <Text className='mt-0 mr-4'>
                                        {formatCurrency(order.totalPrice)}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>
                        <Section className='border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4'>
                            {itemsWithImageSrc.map((item) => (
                                <Row key={item.product} className='mt-8'>
                                    <Column className='w-20'>
                                        <Img
                                            width='80'
                                            alt={item.name}
                                            className='rounded'
                                            src={item.emailImageSrc}
                                        />
                                    </Column>
                                    <Column className='align-top'>
                                        <Text className='mx-2 my-0'>
                                            {item.name} x {item.quantity}
                                        </Text>
                                    </Column>
                                    <Column align='right' className='align-top'>
                                        <Text className='m-0 '>{formatCurrency(item.price)}</Text>
                                    </Column>
                                </Row>
                            ))}
                            {[
                                { name: 'Items', price: order.itemsPrice },
                                { name: 'Tax', price: order.taxPrice },
                                { name: 'Shipping', price: order.shippingPrice },
                                { name: 'Total', price: order.totalPrice },
                            ].map(({ name, price }) => (
                                <Row key={name} className='py-1'>
                                    <Column align='right'>{name}:</Column>
                                    <Column align='right' width={70} className='align-top'>
                                        <Text className='m-0'>{formatCurrency(price)}</Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
