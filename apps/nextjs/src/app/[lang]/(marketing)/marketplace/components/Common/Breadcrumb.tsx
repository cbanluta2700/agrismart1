import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  href: string;
  name: string;
}

interface BreadcrumbProps {
  title?: string;
  pages?: string[];
  pageName?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const Breadcrumb = ({ title, pages, pageName, breadcrumbs }: BreadcrumbProps) => {
  // Use either the old or new prop structure
  const displayTitle = pageName || title;
  
  return (
    <div className="overflow-hidden shadow-breadcrumb pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px]">
      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="font-semibold text-dark text-xl sm:text-2xl xl:text-custom-2">
              {displayTitle}
            </h1>

            <ul className="flex items-center gap-2">
              <li className="text-custom-sm hover:text-blue">
                <Link href="/">Home /</Link>
              </li>

              {pages && pages.length > 0 &&
                pages.map((page, key) => (
                  <li className="text-custom-sm last:text-blue capitalize" key={key}>
                    {page} 
                  </li>
                ))}
                
              {breadcrumbs && breadcrumbs.length > 0 &&
                breadcrumbs.map((item, key) => (
                  <li className="text-custom-sm capitalize" key={key}>
                    {key < breadcrumbs.length - 1 ? (
                      <Link href={item.href} className="hover:text-blue">
                        {item.name} /
                      </Link>
                    ) : (
                      <span className="text-blue">{item.name}</span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
