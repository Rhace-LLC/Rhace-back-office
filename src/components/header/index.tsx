import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Home", to: "/" },
    { name: "Login", to: "/login" },
    { name: "Signup", to: "/signup" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link to="/" className="text-royalblue-600 text-2xl font-bold">
          MyApp
        </Link>

        {/* Desktop Links */}
        <div className="hidden space-x-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `font-medium ${
                  isActive ? "text-royalblue-600" : "text-gray-700"
                } hover:text-royalblue-600`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="text-gray-700 md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="space-y-3 bg-white px-4 py-3 shadow-md md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className="hover:text-royalblue-600 block text-gray-700"
              onClick={() => setOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
