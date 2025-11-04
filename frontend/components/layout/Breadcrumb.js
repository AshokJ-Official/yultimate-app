import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumb({ items = [] }) {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    ...items
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
          {item.href ? (
            <Link 
              href={item.href}
              className="flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-gray-900 font-medium">
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}