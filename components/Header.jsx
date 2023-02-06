import Link from "next/link"

function Header() {
  return (
    // Navbar
    <header className="flex justify-between p-5 max-w-7xl">
        <div className="flex items-center space-x-5">
            {/* Image */}
            <Link href='/'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src='https://links.papareact.com/yvf' 
                    alt=""
                    className="object-contain cursor-pointer w-44" 
                />
            </Link>
 
            {/* Nav items */}
            <div className="hidden md:inline-flex items-center space-x-5">
                <h3>About</h3>
                <h3>Contact</h3>
                <h3 className="text-white bg-green-600 px-4 py-1 rounded-full cursor-pointer">Follow</h3>
            </div>
        </div>

            {/* Sign In and Get Started */}
            <div className="flex items-center space-x-5 text-green-600">
                <h3>Sign In</h3>
                <h3 className="border px-4 py-1 rounded-full border-green-600">Get Started</h3>
            </div>
    </header>
  )
}

export default Header