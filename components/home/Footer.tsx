interface FooterProps {
  version?: string;
  author?: string;
}

export function Footer({ 
  version = '1.0.0', 
  author = 'Matías José García Fernández' 
}: FooterProps) {
  return (
    <div className="py-6 text-center z-10">
      <p className="text-slate-600 text-xs font-medium">
        v{version} • {author}
      </p>
    </div>
  );
}
