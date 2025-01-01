import Image from "next/image";
import logo from "../public/GCHorizontalColorAndBlack.svg";
const navigation = {
  connect: [
    { name: "YouTube", href: "https://www.youtube.com/@GoCreateMakerSpace" },
    { name: "Twitter", href: "https://twitter.com/GoCreateWSU" },
    { name: "Instagram", href: "https://www.instagram.com/GoCreateWSU" },
    { name: "Facebook", href: "https://www.facebook.com/GoCreateWSU" },
  ],
  company: [
    { name: "Blogs", href: "/" },
    { name: "Pricing", href: "/" },
    { name: "Affiliate Partner", href: "/" },
    { name: "AI For Enterprise", href: "/" },
  ],
};

const TwoColumnFooter = () => {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="font-inter w-full bg-gray-100 dark:bg-gray-900"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-12">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-start mb-8">
          {/* GoCreate Section */}
          <div className="space-y-4 max-w-md">
            <Image
              priority
              unoptimized
              width={150}
              height={50}
              src={logo} // Updated to your logo path
              alt="GoCreate Logo"
              className="h-10 w-auto"
            />
            <p className="text-md leading-6 text-gray-700 dark:text-gray-300">
              GoCreate: A creative community workspace open to creators of all
              ages and experiences located on Innovation Campus at Wichita State
              University.
            </p>
            <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
              <span className="font-semibold">OPEN HOURS:</span> <br />
              <strong>Monday:</strong> Closed <br />
              <strong>Tuesday - Saturday:</strong> 9AM - 9PM <br />
              <strong>Sunday:</strong> 1:00 PM - 6:00 PM
            </p>
            <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
              Access the GoCreate facility and parking from 17th Street between
              Hillside and Oliver.
            </p>
          </div>

          {/* Navigation Sections (Vertical Alignment) */}
          <div className="flex space-x-16 mt-8 lg:mt-0">
            {/* Connect Links */}
            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200 mb-4">
                Connect
              </h3>
              <ul className="space-y-2">
                {navigation.connect.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm leading-6 text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200 mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-6 text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 pt-6 text-center">
          <p className="text-xs leading-5 text-gray-700 dark:text-gray-300">
            &copy; 2024 GoCreate / A Koch Collaborative. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default TwoColumnFooter;
