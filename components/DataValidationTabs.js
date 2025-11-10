// components/DataValidationTabs.js
import Link from 'next/link'
export default function DataValidationTabs({ active }) {
  const tabs = [
    { label: 'Datasets', href: '/datavalidation/datasets' },
    { label: 'Data Quality', href: '/datavalidation/dataquality' },
    { label: 'Target Correlation', href: '/datavalidation/targetcorrelation' },
  ];
  return (
    <div className="mb-8 flex gap-2 border-b-2 border-blue-200">
      {tabs.map(tab => (
        <Link key={tab.label} href={tab.href}
          className={`py-2 px-5 font-semibold rounded-t-xl ${
            active === tab.label
              ? 'bg-blue-800 text-white'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
