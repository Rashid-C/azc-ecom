import Image from 'next/image'
import Link from 'next/link'

type CardItem = {
    title: string
    link: { text: string; href: string }
    items: {
        name: string
        items?: string[]
        image: string
        href: string
    }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
            {cards.map((card) => (
                <div
                    key={card.title}
                    className='rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden'
                >
                    <div className='p-4 flex-1'>
                        <h3 className='text-lg font-bold mb-3 truncate'>{card.title}</h3>
                        <div className='grid grid-cols-2 gap-3'>
                            {card.items.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className='flex flex-col items-center gap-1.5 group'
                                >
                                    <div className='w-full aspect-square rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center'>
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={120}
                                            height={120}
                                            className='object-scale-down w-full h-full p-1 transition-transform duration-300 group-hover:scale-105'
                                        />
                                    </div>
                                    <p className='text-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight line-clamp-2 w-full'>
                                        {item.name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                    {card.link && (
                        <div className='px-4 pb-4 pt-0'>
                            <Link
                                href={card.link.href}
                                className='text-sm font-medium text-primary hover:underline'
                            >
                                {card.link.text}
                            </Link>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
