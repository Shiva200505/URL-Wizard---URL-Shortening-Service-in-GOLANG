import Logo from "./Logo";
import { Link } from "wouter";
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Logo />
            </div>
            <p className="text-gray-600 max-w-md">
              ShortLink provides professional URL shortening with robust link management, 
              advanced analytics, and customizable short links to make your online presence more effective.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Features
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Pricing
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    API
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Integrations
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Documentation
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Support
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Blog
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-600 hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ShortLink. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link href="#">
              <a className="text-sm text-gray-500 hover:text-primary mr-4">
                Terms
              </a>
            </Link>
            <Link href="#">
              <a className="text-sm text-gray-500 hover:text-primary mr-4">
                Privacy
              </a>
            </Link>
            <Link href="#">
              <a className="text-sm text-gray-500 hover:text-primary">
                Cookies
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
