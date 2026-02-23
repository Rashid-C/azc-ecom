const data = {
  headerMenus: [
    {
      name: "Today's Deals",
      href: '/search?tag=todays-deal',
    },
    {
      name: 'Best Sellers',
      href: '/search?tag=best-seller',
    },
    {
      name: 'Featured Products',
      href: '/search?tag=featured',
    },
    {
      name: 'New Arrivals',
      href: '/search?tag=new-arrival',
    },
    {
      name: 'Browing History',
      href: '/#browsing-history',
    },
    {
      name: 'Customer Service',
      href: '/page/customer-service',
    },
    {
      name: 'About Us',
      href: '/page/about-us',
    },
    {
      name: 'Help',
      href: '/page/help',
    },
  ],

  carousels: [
    {
      title: 'Most Popular Shoes For sale',
      buttonCaption: 'Shop Now',
      image: '/images/hero-1.jpg',
      url: '/search?category=Shoes',
      isPublished: true,
    },
    {
      title: 'Best Sellers in T-Shirts',
      buttonCaption: 'Shop Now',
      image: '/images/hero-2.jpg',
      url: '/search?category=T-Shirts',
      isPublished: true,
    },
    {
      title: 'Best Deals on Wrist Watches',
      buttonCaption: 'Shop Now',
      image: '/images/hero-1.jpg',
      url: '/search?category=Wrist Watches',
      isPublished: true,
    },
  ],
}
export default data