import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand/Logo Section */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h3 className="text-xl font-bold text-text-primary">PaperEdge</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Track Your Strategy, Perfect Your Edge
            </p>
          </div>

          {/* Links Section */}
          <nav className="flex flex-wrap justify-center gap-8">
            <Link
              to="/faqs"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium"
            >
              FAQ
            </Link>
            <Link
              to="/support"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium"
            >
              Support
            </Link>
            <a
              href="#contact"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium"
            >
              Contact
            </a>
          </nav>

          {/* Copyright Section */}
          <div className="text-sm text-text-secondary text-center md:text-right">
            <p>
              &copy; {new Date().getFullYear()} PaperEdge. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
