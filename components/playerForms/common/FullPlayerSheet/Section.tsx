import { PropsWithChildren, HTMLAttributes } from 'react';

export const Section = ({
  label,
  cols = 2,
  borderStyle,
  children,
}: PropsWithChildren<{
  label: string;
  cols?: 2 | 3;
  borderStyle: HTMLAttributes<HTMLDivElement>['style'];
}>) => (
  <div>
    <div className="bg-grey900 p-2 text-grey100" style={borderStyle}>
      <div className="flex justify-between font-bold">
        <span>{label}</span>
      </div>
    </div>
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 p-2">
      <div
        className={`grid w-full grid-cols-1 gap-6 text-sm ${
          cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
        }`}
      >
        {children}
      </div>
    </div>
  </div>
);
