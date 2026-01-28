
import { useRef, useEffect } from 'react';

type Props = {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hint: boolean;
};

export default function AccordionItem({
  title,
  isOpen,
  onClick,
  children,
  hint
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    if (isOpen) {
      const height = el.scrollHeight;
      el.style.height = height + "px";
    } else {
      el.style.height = "0px";
    }
    
  }, [isOpen])

  return (
    // <div className={`accordion__item accordion__item${isOpen ? '--active' : ''}`}>
     
     <div
  className={`
    accordion__item
    ${isOpen ? 'accordion__item--active' : ''}
    ${hint ? 'accordion__item--hint' : ''}
  `}
>


    <button
        className={`accordion__header accordion__header${isOpen ? '--active' : ''}`}
        onClick={onClick}
        role="button"
      >
        <h1>{title}</h1>
      </button> 

      {/* <div ref={contentRef} className="accordion__content" style={{
        height: "0px",
        overflow: "hidden",
        transition: "height 1s ease",
      }}>
        {children}
      </div> */}
      {isOpen && (
        <div className="accordion__content">
          {children}
        </div>
      )}
    </div>
  );
}