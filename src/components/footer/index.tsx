import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-gray-100">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 py-6 text-sm text-gray-600 md:flex-row">
        <p>© {new Date().getFullYear()} MyApp. All rights reserved.</p>

        <div className="mt-3 flex space-x-4 md:mt-0">
          <Link to="/terms" className="hover:text-royalblue-600">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-royalblue-600">
            Privacy
          </Link>
          <Link to="/contact" className="hover:text-royalblue-600">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
