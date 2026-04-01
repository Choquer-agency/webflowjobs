interface RichTextContentProps {
  html: string;
  className?: string;
}

export default function RichTextContent({ html, className }: RichTextContentProps) {
  return (
    <div
      className={`text-rich-text${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
